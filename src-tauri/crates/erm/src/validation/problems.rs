use serde::Serialize;

use crate::validation::{ValidationError, ValidationErrorTarget, ValidationSeverity};

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

pub type ValidationProblemSeverity = ValidationSeverity;

impl From<ValidationError> for ValidationProblem {
    fn from(error: ValidationError) -> Self {
        let id = format!("{}:{}", error.path, error.message);
        let body = problem_body(&error);
        Self {
            id,
            severity: error.severity,
            title: error.message.clone(),
            body,
            path: error.path,
            targets: error.targets,
        }
    }
}

fn problem_body(error: &ValidationError) -> String {
    let mut body = error.message.clone();

    if !error.targets.is_empty() {
        body.push_str("\n\nTarget:");

        for target in &error.targets {
            body.push_str(&format!("\n- {}: {}", target.label, target.value));
        }
    }

    body.push_str(&format!("\n\nTechnical details:\n- path: {}", error.path));
    body
}
