use crate::open::support;
use crate::open::validation::support::assert_validation_error_with_targets;

const COLUMN_GROUPS_FIXTURE: &str = "./tests/open/fixtures/diagram/column_groups.erm";
const TEMP_PREFIX: &str = "erm_column_groups_validation";
const ASSERTIONS: support::FixtureAssertions =
    support::FixtureAssertions::new(COLUMN_GROUPS_FIXTURE, TEMP_PREFIX, "      ");

#[test]
fn duplicate_column_group_name_is_rejected() {
    let result = ASSERTIONS.open_replaced_fixture(
        "<column_group_name>AUDIT</column_group_name>",
        "<column_group_name>COMMON</column_group_name>",
        "duplicate_column_group_name",
    );

    assert_validation_error_with_targets(
        result,
        "column_groups[1].column_group_name",
        "duplicate column group name: COMMON",
        &[("column group name", "COMMON")],
    );
}

#[test]
fn duplicate_column_physical_name_in_same_column_group_is_rejected() {
    let result = ASSERTIONS.open_replaced_fixture(
        "<physical_name>UPDATED_BY</physical_name>",
        "<physical_name>CREATED_AT</physical_name>",
        "duplicate_column_physical_name_in_same_column_group",
    );

    assert_validation_error_with_targets(
        result,
        "column_groups[0].columns.normal_column[1].physical_name",
        "duplicate column group column physical_name: CREATED_AT",
        &[
            ("column group name", "COMMON"),
            ("column name", "CREATED_AT"),
        ],
    );
}

#[test]
fn column_group_column_decimal_greater_than_length_is_rejected() {
    let result = ASSERTIONS.open_replaced_fixture(
        "<decimal>0</decimal>",
        "<decimal>7</decimal>",
        "column_group_column_decimal_greater_than_length",
    );

    assert_validation_error_with_targets(
        result,
        "column_groups[0].columns.normal_column[0].decimal",
        "decimal must be less than or equal to length: 7 > 6",
        &[
            ("column group name", "COMMON"),
            ("column name", "CREATED_AT"),
        ],
    );
}

#[test]
fn column_group_column_length_for_unsupported_column_type_is_rejected() {
    let result = ASSERTIONS.open_replaced_fixture(
        "<type>decimal(p,s)</type>",
        "<type>datetime</type>",
        "column_group_column_length_for_unsupported_column_type",
    );

    assert_validation_error_with_targets(
        result,
        "column_groups[0].columns.normal_column[0].length",
        "column type does not support length: datetime",
        &[
            ("column group name", "COMMON"),
            ("column name", "CREATED_AT"),
        ],
    );
}

#[test]
fn column_group_column_decimal_for_unsupported_column_type_is_rejected() {
    let result = ASSERTIONS.open_replaced_fixture(
        "<type>decimal(p,s)</type>",
        "<type>varchar(n)</type>",
        "column_group_column_decimal_for_unsupported_column_type",
    );

    assert_validation_error_with_targets(
        result,
        "column_groups[0].columns.normal_column[0].decimal",
        "column type does not support decimal: varchar(n)",
        &[
            ("column group name", "COMMON"),
            ("column name", "CREATED_AT"),
        ],
    );
}
