use erm_macros::Validate;

use crate::validation::CollectValidationErrors as _;
use crate::validation::Validate as _;

mod validation {
    use thiserror::Error;

    #[derive(Debug, Error, PartialEq)]
    #[error("Validation error at {path}: {message}")]
    pub struct ValidationError {
        pub path: String,
        pub message: String,
        pub severity: ValidationSeverity,
    }

    #[derive(Clone, Copy, Debug, PartialEq)]
    pub enum ValidationSeverity {
        Error,
        Warning,
        Info,
    }

    impl ValidationError {
        pub fn new(path: String, message: String) -> Self {
            Self {
                path,
                message,
                severity: ValidationSeverity::Error,
            }
        }

        pub fn with_severity(mut self, severity: ValidationSeverity) -> Self {
            self.severity = severity;
            self
        }

        pub fn prepend_path(mut self, segment: impl AsRef<str>) -> Self {
            if self.path.starts_with('[') {
                self.path = format!("{}{}", segment.as_ref(), self.path);
            } else {
                self.path = format!("{}.{}", segment.as_ref(), self.path);
            }
            self
        }
    }

    pub trait Validate {
        fn validate(&self) -> Result<(), ValidationError>;
    }

    pub trait CollectValidationErrors {
        fn collect_validation_errors(&self) -> Vec<ValidationError>;
    }

    impl<T: Validate> Validate for Option<T> {
        fn validate(&self) -> Result<(), ValidationError> {
            if let Some(value) = self {
                value.validate()?;
            }
            Ok(())
        }
    }

    impl<T: CollectValidationErrors> CollectValidationErrors for Option<T> {
        fn collect_validation_errors(&self) -> Vec<ValidationError> {
            self.as_ref()
                .map(CollectValidationErrors::collect_validation_errors)
                .unwrap_or_default()
        }
    }

    impl<T: Validate> Validate for Vec<T> {
        fn validate(&self) -> Result<(), ValidationError> {
            for (index, value) in self.iter().enumerate() {
                value
                    .validate()
                    .map_err(|error| error.prepend_path(format!("[{index}]")))?;
            }
            Ok(())
        }
    }

    impl<T: CollectValidationErrors> CollectValidationErrors for Vec<T> {
        fn collect_validation_errors(&self) -> Vec<ValidationError> {
            self.iter()
                .enumerate()
                .flat_map(|(index, value)| {
                    value
                        .collect_validation_errors()
                        .into_iter()
                        .map(move |error| error.prepend_path(format!("[{index}]")))
                })
                .collect()
        }
    }

    impl Validate for String {
        fn validate(&self) -> Result<(), ValidationError> {
            Ok(())
        }
    }

    impl CollectValidationErrors for String {
        fn collect_validation_errors(&self) -> Vec<ValidationError> {
            Vec::new()
        }
    }
}

#[derive(Validate)]
#[validate(rule = validate_child)]
struct Child {
    name: String,
}

#[derive(Validate)]
#[validate(rule = validate_parent)]
struct Parent {
    #[validate(path = "child")]
    children: Option<Vec<Child>>,
}

#[derive(Validate)]
#[validate(rules([validate_first_rule, validate_second_rule]))]
struct MultipleRules {
    name: String,
}

#[derive(Validate)]
#[validate(rules(
    [validate_warning_first_rule, validate_warning_second_rule],
    Warning
))]
struct WarningRules {
    name: String,
}

#[derive(Validate)]
#[validate(rules(
    [validate_qualified_warning_rule],
    crate::validation::ValidationSeverity::Warning
))]
struct QualifiedWarningRules {
    name: String,
}

#[derive(Validate)]
#[validate(rule = validate_info_rule, severity = crate::validation::ValidationSeverity::Info)]
struct InfoRule {
    name: String,
}

fn validate_parent(value: &Parent) -> Result<(), validation::ValidationError> {
    if value.children.is_none() {
        return Err(validation::ValidationError::new(
            "children".to_string(),
            "missing children".to_string(),
        ));
    }

    Ok(())
}

fn validate_child(value: &Child) -> Result<(), validation::ValidationError> {
    if value.name == "invalid" {
        return Err(validation::ValidationError::new(
            "name".to_string(),
            "invalid child".to_string(),
        ));
    }

    Ok(())
}

fn validate_first_rule(value: &MultipleRules) -> Result<(), validation::ValidationError> {
    if value.name == "first" {
        return Err(validation::ValidationError::new(
            "name".to_string(),
            "first rule".to_string(),
        ));
    }

    Ok(())
}

fn validate_second_rule(value: &MultipleRules) -> Result<(), validation::ValidationError> {
    if value.name == "second" {
        return Err(validation::ValidationError::new(
            "name".to_string(),
            "second rule".to_string(),
        ));
    }

    Ok(())
}

fn validate_warning_first_rule(value: &WarningRules) -> Result<(), validation::ValidationError> {
    if value.name == "first" {
        return Err(validation::ValidationError::new(
            "name".to_string(),
            "first rule".to_string(),
        ));
    }

    Ok(())
}

fn validate_warning_second_rule(value: &WarningRules) -> Result<(), validation::ValidationError> {
    if value.name == "second" {
        return Err(validation::ValidationError::new(
            "name".to_string(),
            "second rule".to_string(),
        ));
    }

    Ok(())
}

fn validate_qualified_warning_rule(
    value: &QualifiedWarningRules,
) -> Result<(), validation::ValidationError> {
    if value.name == "first" {
        return Err(validation::ValidationError::new(
            "name".to_string(),
            "first rule".to_string(),
        ));
    }

    Ok(())
}

fn validate_info_rule(value: &InfoRule) -> Result<(), validation::ValidationError> {
    if value.name == "first" {
        return Err(validation::ValidationError::new(
            "name".to_string(),
            "first rule".to_string(),
        ));
    }

    Ok(())
}

#[test]
fn struct_level_rule_is_called() {
    let result = Parent { children: None }.validate();

    let Err(error) = result else {
        panic!("expected validation error");
    };

    assert_eq!(error.path, "children");
    assert_eq!(error.message, "missing children");
    assert_eq!(error.severity, validation::ValidationSeverity::Error);
}

#[test]
fn option_vec_child_path_uses_field_override_and_index() {
    let result = Parent {
        children: Some(vec![Child {
            name: "invalid".to_string(),
        }]),
    }
    .validate();

    let Err(error) = result else {
        panic!("expected validation error");
    };

    assert_eq!(error.path, "child[0].name");
    assert_eq!(error.message, "invalid child");
    assert_eq!(error.severity, validation::ValidationSeverity::Error);
}

#[test]
fn multiple_struct_level_rules_are_called_in_order() {
    let result = MultipleRules {
        name: "second".to_string(),
    }
    .validate();

    let Err(error) = result else {
        panic!("expected validation error");
    };

    assert_eq!(error.path, "name");
    assert_eq!(error.message, "second rule");
    assert_eq!(error.severity, validation::ValidationSeverity::Error);
}

#[test]
fn validation_errors_are_collected_from_rules_and_children() {
    let errors = Parent {
        children: Some(vec![Child {
            name: "invalid".to_string(),
        }]),
    }
    .collect_validation_errors();

    assert_eq!(errors.len(), 1);
    assert_eq!(errors[0].path, "child[0].name");
    assert_eq!(errors[0].message, "invalid child");
    assert_eq!(errors[0].severity, validation::ValidationSeverity::Error);
}

#[test]
fn grouped_rules_share_the_configured_severity() {
    let errors = WarningRules {
        name: "first".to_string(),
    }
    .collect_validation_errors();

    assert_eq!(errors.len(), 1);
    assert_eq!(errors[0].path, "name");
    assert_eq!(errors[0].message, "first rule");
    assert_eq!(errors[0].severity, validation::ValidationSeverity::Warning);
}

#[test]
fn grouped_rules_accept_a_qualified_severity_path() {
    let errors = QualifiedWarningRules {
        name: "first".to_string(),
    }
    .collect_validation_errors();

    assert_eq!(errors.len(), 1);
    assert_eq!(errors[0].path, "name");
    assert_eq!(errors[0].message, "first rule");
    assert_eq!(errors[0].severity, validation::ValidationSeverity::Warning);
}

#[test]
fn single_rule_uses_the_configured_severity() {
    let result = InfoRule {
        name: "first".to_string(),
    }
    .validate();

    let Err(error) = result else {
        panic!("expected validation error");
    };

    assert_eq!(error.path, "name");
    assert_eq!(error.message, "first rule");
    assert_eq!(error.severity, validation::ValidationSeverity::Info);
}
