use pretty_assertions::assert_eq;

use erm::errors::Error;

use crate::open::support;

const DIAGRAM_WALKERS_FIXTURE: &str = "./tests/open/fixtures/diagram/diagram_walkers.erm";
const TEMP_PREFIX: &str = "erm_diagram_walkers_validation";
const ASSERTIONS: support::FixtureAssertions =
    support::FixtureAssertions::new(DIAGRAM_WALKERS_FIXTURE, TEMP_PREFIX, "      ");

#[test]
fn duplicate_table_physical_name_is_rejected() {
    let result = ASSERTIONS.open_replaced_fixture(
        "<physical_name>MEMBER_STATUS</physical_name>",
        "<physical_name>MEMBERS</physical_name>",
        "duplicate_table_physical_name",
    );

    assert_validation_error(
        result,
        "diagram_walkers.table[1].physical_name",
        "duplicate table physical_name: MEMBERS",
    );
}

fn assert_validation_error(
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
