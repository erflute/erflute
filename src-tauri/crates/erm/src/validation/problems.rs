use serde::Serialize;

use crate::validation::{ValidationError, ValidationErrorTarget};

#[derive(Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidationProblem {
    pub id: String,
    pub severity: ValidationProblemSeverity,
    pub title: String,
    pub body: String,
    pub path: String,
    pub targets: Vec<ValidationErrorTarget>,
}

#[derive(Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum ValidationProblemSeverity {
    Error,
}

impl From<ValidationError> for ValidationProblem {
    fn from(error: ValidationError) -> Self {
        let id = format!("{}:{}", error.path, error.message);
        Self {
            id,
            severity: ValidationProblemSeverity::Error,
            title: error.message.clone(),
            body: error.to_string(),
            path: error.path,
            targets: error.targets,
        }
    }
}
