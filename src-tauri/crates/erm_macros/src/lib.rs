use proc_macro::TokenStream;
use quote::quote;
use syn::{Data, DeriveInput, Error, Fields, LitStr, Result, parse_macro_input, spanned::Spanned};

#[proc_macro_derive(Validate, attributes(validate))]
pub fn derive_validate(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);

    match expand_validate(input) {
        Ok(tokens) => tokens.into(),
        Err(error) => error.to_compile_error().into(),
    }
}

fn expand_validate(input: DeriveInput) -> Result<proc_macro2::TokenStream> {
    let ident = input.ident;
    let rule_paths = collect_rule_paths(&input.attrs)?;

    let rule_calls = rule_paths.iter().map(|path| {
        quote! {
            #path(self)?;
        }
    });

    let child_validations = match input.data {
        Data::Struct(data) => expand_struct_fields(data.fields)?,
        Data::Enum(data) => expand_enum_variants(data.variants)?,
        Data::Union(data) => {
            return Err(Error::new(
                data.union_token.span(),
                "Validate cannot be derived for unions",
            ));
        }
    };

    Ok(quote! {
        impl crate::validation::Validate for #ident {
            fn validate(&self) -> Result<(), crate::validation::ValidationError> {
                #(#rule_calls)*
                #child_validations
                Ok(())
            }
        }
    })
}

fn expand_struct_fields(fields: Fields) -> Result<proc_macro2::TokenStream> {
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

fn expand_enum_variants(
    variants: syn::punctuated::Punctuated<syn::Variant, syn::token::Comma>,
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

fn collect_rule_paths(attrs: &[syn::Attribute]) -> Result<Vec<syn::Path>> {
    let mut rule_paths = Vec::new();

    for attr in attrs.iter().filter(|attr| attr.path().is_ident("validate")) {
        attr.parse_nested_meta(|meta| {
            if meta.path.is_ident("rule") {
                let value = meta.value()?;
                rule_paths.push(value.parse()?);
                Ok(())
            } else if meta.path.is_ident("rules") {
                meta.parse_nested_meta(|rule| {
                    rule_paths.push(rule.path);
                    Ok(())
                })
            } else {
                Err(meta.error("unsupported validate attribute"))
            }
        })?;
    }

    Ok(rule_paths)
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
