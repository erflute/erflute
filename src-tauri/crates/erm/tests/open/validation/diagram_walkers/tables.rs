use crate::open::support;
use crate::open::validation::support::assert_validation_error;

const DIAGRAM_WALKERS_FIXTURE: &str = "./tests/open/fixtures/diagram/diagram_walkers.erm";
const DIAGRAM_WALKERS_DETAILS_FIXTURE: &str =
    "./tests/open/fixtures/diagram/diagram_walkers_details.erm";
const TEMP_PREFIX: &str = "erm_diagram_walkers_tables_validation";
const ASSERTIONS: support::FixtureAssertions =
    support::FixtureAssertions::new(DIAGRAM_WALKERS_FIXTURE, TEMP_PREFIX, "      ");
const DETAILS_ASSERTIONS: support::FixtureAssertions =
    support::FixtureAssertions::new(DIAGRAM_WALKERS_DETAILS_FIXTURE, TEMP_PREFIX, "      ");

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

#[test]
fn unknown_index_column_id_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "<column_id>MEMBER_NAME</column_id>",
        "<column_id>UNKNOWN_MEMBER_NAME</column_id>",
        "unknown_index_column_id",
    );

    assert_validation_error(
        result,
        "diagram_walkers.table[0].indexes[0].columns[0].column_id",
        "unknown index column_id: UNKNOWN_MEMBER_NAME",
    );
}

#[test]
fn unknown_compound_unique_key_column_id_is_rejected() {
    let result = DETAILS_ASSERTIONS.open_replaced_fixture(
        "            <column>\n              <column_id>MEMBER_NAME</column_id>\n            </column>\n            <column>\n              <column_id>MEMBER_ID</column_id>\n            </column>",
        "            <column>\n              <column_id>UNKNOWN_MEMBER_NAME</column_id>\n            </column>\n            <column>\n              <column_id>MEMBER_ID</column_id>\n            </column>",
        "unknown_compound_unique_key_column_id",
    );

    assert_validation_error(
        result,
        "diagram_walkers.table[0].compound_unique_key_list.compound_unique_key[0].columns[0].column_id",
        "unknown compound unique key column_id: UNKNOWN_MEMBER_NAME",
    );
}
