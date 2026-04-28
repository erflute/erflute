use pretty_assertions::assert_eq;

use erm::errors::Error;

use crate::open::support;

const DIAGRAM_WALKERS_FIXTURE: &str = "./tests/open/fixtures/diagram/diagram_walkers.erm";
const TEMP_PREFIX: &str = "erm_diagram_walkers_tables_validation";
const ASSERTIONS: support::FixtureAssertions =
    support::FixtureAssertions::new(DIAGRAM_WALKERS_FIXTURE, TEMP_PREFIX, "      ");

#[test]
fn duplicate_column_physical_name_in_same_table_is_rejected() {
    let result = ASSERTIONS.open_replaced_fixture(
        "<columns />",
        "      <columns>\n        <normal_column>\n          <physical_name>MEMBER_ID</physical_name>\n        </normal_column>\n        <normal_column>\n          <physical_name>MEMBER_ID</physical_name>\n        </normal_column>\n      </columns>",
        "duplicate_column_physical_name_in_same_table",
    );

    assert_validation_error(
        result,
        "diagram_walkers.table[0].columns.normal_column[1].physical_name",
        "duplicate column physical_name: MEMBER_ID",
    );
}

#[test]
fn same_column_physical_name_in_different_tables_is_accepted() {
    ASSERTIONS.assert_replaced_fixture_parse_success(
        "<columns />",
        "      <columns>\n        <normal_column>\n          <physical_name>MEMBER_ID</physical_name>\n        </normal_column>\n      </columns>",
        "same_column_physical_name_in_different_tables",
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
