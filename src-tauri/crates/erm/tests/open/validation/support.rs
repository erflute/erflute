use pretty_assertions::assert_eq;

use erm::errors::Error;
use erm::validation::ValidationSeverity;
use erm::validation::problems::ValidationProblem;

pub(super) fn assert_validation_error_with_targets(
    result: Result<Vec<ValidationProblem>, Error>,
    path: &str,
    message: &str,
    targets: &[(&str, &str)],
) {
    let problems = result.expect("failed to validate diagram");
    let problem = problems
        .iter()
        .find(|problem| problem.path == path && problem.title == message)
        .unwrap_or_else(|| {
            panic!(
                "expected validation problem was not found\nexpected path: {path}\nexpected message: {message}\nactual problems:\n{}",
                format_validation_problems(&problems),
            )
        });

    assert_eq!(problem.path, path);
    assert_eq!(problem.title, message);
    assert_eq!(problem.severity, ValidationSeverity::Error);
    assert_eq!(problem.targets.len(), targets.len());

    let display = &problem.body;
    assert!(display.contains(message));
    assert!(display.contains("Technical details:"));
    assert!(display.contains(path));

    for (target, (label, value)) in problem.targets.iter().zip(targets) {
        assert_eq!(target.label, *label);
        assert!(target.value.contains(value));
        assert!(display.contains(label));
        assert!(display.contains(value));
    }
}

fn format_validation_problems(problems: &[ValidationProblem]) -> String {
    if problems.is_empty() {
        return "  <none>".to_string();
    }

    problems
        .iter()
        .enumerate()
        .map(|(index, problem)| {
            let targets = if problem.targets.is_empty() {
                "targets: <none>".to_string()
            } else {
                format!(
                    "targets: {}",
                    problem
                        .targets
                        .iter()
                        .map(|target| format!("{}={}", target.label, target.value))
                        .collect::<Vec<_>>()
                        .join(", "),
                )
            };

            format!(
                "  {index}. path: {}\n     title: {}\n     {targets}",
                problem.path, problem.title,
            )
        })
        .collect::<Vec<_>>()
        .join("\n")
}
