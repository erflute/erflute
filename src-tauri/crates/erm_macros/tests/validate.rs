use erm_macros::Validate;

use crate::validation::Validate as _;

mod validation {
    use thiserror::Error;

    #[derive(Debug, Error, PartialEq)]
    #[error("Validation error at {path}: {message}")]
    pub struct ValidationError {
        pub path: String,
        pub message: String,
    }

    impl ValidationError {
        pub fn new(path: String, message: String) -> Self {
            Self { path, message }
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

    impl<T: Validate> Validate for Option<T> {
        fn validate(&self) -> Result<(), ValidationError> {
            if let Some(value) = self {
                value.validate()?;
            }
            Ok(())
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

    impl Validate for String {
        fn validate(&self) -> Result<(), ValidationError> {
            Ok(())
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
#[validate(rules(validate_first_rule, validate_second_rule))]
struct MultipleRules {
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

#[test]
fn struct_level_rule_is_called() {
    let result = Parent { children: None }.validate();

    let Err(error) = result else {
        panic!("expected validation error");
    };

    assert_eq!(error.path, "children");
    assert_eq!(error.message, "missing children");
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
}
