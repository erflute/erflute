use proc_macro::TokenStream;
use quote::quote;
use syn::{
    Data, DeriveInput, Error, Fields, LitStr, Path, Result, Token, bracketed, parenthesized,
    parse::{Parse, ParseStream},
    parse_macro_input,
    spanned::Spanned,
};

struct RuleSpec {
    path: Path,
    severity: Path,
}

struct RulesArgs {
    rules: Vec<RuleSpec>,
}

// Parses both default-error rules and grouped-severity rules:
// - rules(validate_a, validate_b)
// - rules([validate_a, validate_b])
// - rules([validate_a, validate_b], Warning)
// - rules([validate_a, validate_b], crate::validation::ValidationSeverity::Warning)
impl Parse for RulesArgs {
    fn parse(input: ParseStream<'_>) -> Result<Self> {
        if input.peek(syn::token::Bracket) {
            let content;
            bracketed!(content in input);
            let paths = content.parse_terminated(Path::parse_mod_style, Token![,])?;
            let severity = if input.is_empty() {
                default_severity_path()
            } else {
                input.parse::<Token![,]>()?;
                input.parse::<Path>()?
            };

            return Ok(Self {
                rules: paths
                    .into_iter()
                    .map(|path| RuleSpec {
                        path,
                        severity: severity.clone(),
                    })
                    .collect(),
            });
        }

        let paths = input.parse_terminated(Path::parse_mod_style, Token![,])?;
        Ok(Self {
            rules: paths
                .into_iter()
                .map(|path| RuleSpec {
                    path,
                    severity: default_severity_path(),
                })
                .collect(),
        })
    }
}

/// Derives validation traversal and supports `#[validate(...)]` metadata.
///
/// Struct-level rules:
/// - `#[validate(rule = validate_name)]`
/// - `#[validate(rule = validate_name, severity = Warning)]`
/// - `#[validate(rule = validate_name, severity = crate::validation::ValidationSeverity::Warning)]`
/// - `#[validate(rules(validate_a, validate_b))]`
/// - `#[validate(rules([validate_a, validate_b]))]`
/// - `#[validate(rules([validate_a, validate_b], Warning))]`
/// - `#[validate(rules([validate_a, validate_b], crate::validation::ValidationSeverity::Warning))]`
///
/// Field-level path override:
/// - `#[validate(path = "table")]`
///
/// Rule functions must accept `&Self` and return
/// `Result<(), crate::validation::ValidationError>`. Severity defaults to
/// `crate::validation::ValidationSeverity::Error`.
#[proc_macro_derive(Validate, attributes(validate))]
pub fn derive_validate(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);

    match expand_validate(input) {
        Ok(tokens) => tokens.into(),
        Err(error) => error.to_compile_error().into(),
    }
}

fn expand_validate(input: DeriveInput) -> Result<proc_macro2::TokenStream> {
    let DeriveInput {
        ident, attrs, data, ..
    } = input;
    let rule_specs = collect_rule_specs(&attrs)?;

    let rule_calls = rule_specs.iter().map(|rule| {
        let path = &rule.path;
        let severity = severity_tokens(&rule.severity);
        quote! {
            #path(self).map_err(|error| {
                error.with_severity(#severity)
            })?;
        }
    });
    let collect_rule_calls = rule_specs.iter().map(|rule| {
        let path = &rule.path;
        let severity = severity_tokens(&rule.severity);
        quote! {
            if let Err(error) = #path(self) {
                errors.push(error.with_severity(#severity));
            }
        }
    });

    let child_validations = match &data {
        Data::Struct(data) => expand_struct_fields(&data.fields)?,
        Data::Enum(data) => expand_enum_variants(&data.variants)?,
        Data::Union(data) => {
            return Err(Error::new(
                data.union_token.span(),
                "Validate cannot be derived for unions",
            ));
        }
    };
    let child_error_collections = match &data {
        Data::Struct(data) => expand_struct_field_error_collections(&data.fields)?,
        Data::Enum(data) => expand_enum_variant_error_collections(&data.variants)?,
        Data::Union(_) => unreachable!("unions are rejected before collection expansion"),
    };

    Ok(quote! {
        impl crate::validation::Validate for #ident {
            fn validate(&self) -> Result<(), crate::validation::ValidationError> {
                #(#rule_calls)*
                #child_validations
                Ok(())
            }
        }

        impl crate::validation::CollectValidationErrors for #ident {
            fn collect_validation_errors(&self) -> Vec<crate::validation::ValidationError> {
                let mut errors = Vec::new();
                #(#collect_rule_calls)*
                #child_error_collections
                errors
            }
        }
    })
}

fn expand_struct_fields(fields: &Fields) -> Result<proc_macro2::TokenStream> {
    let validations = fields
        .iter()
        .enumerate()
        .map(|(index, field)| {
            let path = field_path(field)?;
            let access = field
                .ident
                .as_ref()
                .map(|ident| quote! { #ident })
                .unwrap_or_else(|| {
                    let index = syn::Index::from(index);
                    quote! { #index }
                });

            Ok(quote! {
                crate::validation::Validate::validate(&self.#access)
                    .map_err(|error| error.prepend_path(#path))?;
            })
        })
        .collect::<Result<Vec<_>>>()?;

    Ok(quote! {
        #(#validations)*
    })
}

fn expand_struct_field_error_collections(fields: &Fields) -> Result<proc_macro2::TokenStream> {
    let collections = fields
        .iter()
        .enumerate()
        .map(|(index, field)| {
            let path = field_path(field)?;
            let access = field
                .ident
                .as_ref()
                .map(|ident| quote! { #ident })
                .unwrap_or_else(|| {
                    let index = syn::Index::from(index);
                    quote! { #index }
                });

            Ok(quote! {
                errors.extend(
                    crate::validation::CollectValidationErrors::collect_validation_errors(&self.#access)
                        .into_iter()
                        .map(|error| error.prepend_path(#path)),
                );
            })
        })
        .collect::<Result<Vec<_>>>()?;

    Ok(quote! {
        #(#collections)*
    })
}

fn expand_enum_variants(
    variants: &syn::punctuated::Punctuated<syn::Variant, syn::token::Comma>,
) -> Result<proc_macro2::TokenStream> {
    let arms = variants
        .iter()
        .map(|variant| match &variant.fields {
            Fields::Unit => {
                let ident = &variant.ident;
                Ok(quote! {
                    Self::#ident => {}
                })
            }
            Fields::Unnamed(fields) if fields.unnamed.len() == 1 => {
                let ident = &variant.ident;
                Ok(quote! {
                    Self::#ident(value) => {
                        crate::validation::Validate::validate(value)?;
                    }
                })
            }
            Fields::Named(_) | Fields::Unnamed(_) => Err(Error::new(
                variant.span(),
                "Validate can only be derived for unit enum variants or single-value tuple variants",
            )),
        })
        .collect::<Result<Vec<_>>>()?;

    Ok(quote! {
        match self {
            #(#arms)*
        }
    })
}

fn expand_enum_variant_error_collections(
    variants: &syn::punctuated::Punctuated<syn::Variant, syn::token::Comma>,
) -> Result<proc_macro2::TokenStream> {
    let arms = variants
        .iter()
        .map(|variant| match &variant.fields {
            Fields::Unit => {
                let ident = &variant.ident;
                Ok(quote! {
                    Self::#ident => {}
                })
            }
            Fields::Unnamed(fields) if fields.unnamed.len() == 1 => {
                let ident = &variant.ident;
                Ok(quote! {
                    Self::#ident(value) => {
                        errors.extend(
                            crate::validation::CollectValidationErrors::collect_validation_errors(value),
                        );
                    }
                })
            }
            Fields::Named(_) | Fields::Unnamed(_) => Err(Error::new(
                variant.span(),
                "Validate can only be derived for unit enum variants or single-value tuple variants",
            )),
        })
        .collect::<Result<Vec<_>>>()?;

    Ok(quote! {
        match self {
            #(#arms)*
        }
    })
}

fn collect_rule_specs(attrs: &[syn::Attribute]) -> Result<Vec<RuleSpec>> {
    let mut rule_specs = Vec::new();

    for attr in attrs.iter().filter(|attr| attr.path().is_ident("validate")) {
        let mut attr_rule_specs = Vec::new();
        attr.parse_nested_meta(|meta| {
            if meta.path.is_ident("rule") {
                let value = meta.value()?;
                attr_rule_specs.push(RuleSpec {
                    path: value.parse()?,
                    severity: default_severity_path(),
                });
                Ok(())
            } else if meta.path.is_ident("severity") {
                let value = meta.value()?;
                let severity = value.parse::<Path>()?;
                let Some(rule) = attr_rule_specs.last_mut() else {
                    return Err(
                        meta.error("severity must follow rule in the same validate attribute")
                    );
                };
                rule.severity = severity;
                Ok(())
            } else if meta.path.is_ident("rules") {
                let content;
                parenthesized!(content in meta.input);
                let args = content.parse::<RulesArgs>()?;
                attr_rule_specs.extend(args.rules);
                Ok(())
            } else {
                Err(meta.error("unsupported validate attribute"))
            }
        })?;
        rule_specs.extend(attr_rule_specs);
    }

    Ok(rule_specs)
}

fn default_severity_path() -> Path {
    syn::parse_quote!(Error)
}

fn severity_tokens(severity: &Path) -> proc_macro2::TokenStream {
    if severity.segments.len() == 1 {
        quote! { crate::validation::ValidationSeverity::#severity }
    } else {
        quote! { #severity }
    }
}

fn field_path(field: &syn::Field) -> Result<String> {
    let mut path = field
        .ident
        .as_ref()
        .map(ToString::to_string)
        .unwrap_or_default();

    for attr in field
        .attrs
        .iter()
        .filter(|attr| attr.path().is_ident("validate"))
    {
        attr.parse_nested_meta(|meta| {
            if meta.path.is_ident("path") {
                let value = meta.value()?;
                let override_path = value.parse::<LitStr>()?;
                path = override_path.value();
                Ok(())
            } else {
                Err(meta.error("unsupported validate attribute"))
            }
        })?;
    }

    Ok(path)
}
