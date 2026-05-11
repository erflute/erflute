use pretty_assertions::assert_eq;

use erm::errors::Error;
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
        .expect("expected validation problem");

    assert_eq!(problem.path, path);
    assert_eq!(problem.title, message);
    assert_eq!(problem.targets.len(), targets.len());

    let display = &problem.body;
    assert!(display.contains("Validation error\n\n"));
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
