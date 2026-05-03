use pretty_assertions::assert_eq;

use erm::errors::Error;

pub(super) fn assert_validation_error_with_targets(
    result: Result<erm::dtos::diagram::Diagram, Error>,
    path: &str,
    message: &str,
    targets: &[(&str, &str)],
) {
    let Err(Error::Validation(error)) = result else {
        panic!("expected validation error");
    };

    assert_eq!(error.path, path);
    assert_eq!(error.message, message);
    assert_eq!(error.targets.len(), targets.len());

    let display = error.to_string();
    assert!(display.contains("Validation error\n\n"));
    assert!(display.contains(message));
    assert!(display.contains("Technical details:"));
    assert!(display.contains(path));

    for (target, (label, value)) in error.targets.iter().zip(targets) {
        assert_eq!(target.label, *label);
        assert!(target.value.contains(value));
        assert!(display.contains(label));
        assert!(display.contains(value));
    }
}
