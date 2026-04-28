use pretty_assertions::assert_eq;

use erm::errors::Error;

pub(super) fn assert_validation_error(
    result: Result<erm::dtos::diagram::Diagram, Error>,
    path: &str,
    message: &str,
) {
    let Err(Error::Validation(error)) = result else {
        panic!("expected validation error");
    };

    assert_eq!(error.path, path);
    assert_eq!(error.message, message);
}
