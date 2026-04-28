use pretty_assertions::assert_eq;

use erm::dtos::diagram::column_groups;
use erm::open;

use crate::open::support;

const COLUMN_GROUPS_FIXTURE: &str = "./tests/open/fixtures/diagram/column_groups.erm";
const TEMP_PREFIX: &str = "erm_column_groups";
const ASSERTIONS: support::FixtureAssertions =
    support::FixtureAssertions::new(COLUMN_GROUPS_FIXTURE, TEMP_PREFIX, "      ");

#[test]
fn column_groups_tags_keep_valid_values() {
    let diagram = open(COLUMN_GROUPS_FIXTURE).expect("failed to parse");

    assert_eq!(
        diagram.column_groups,
        Some(vec![
            column_groups::ColumnGroup {
                column_group_name: "COMMON".to_string(),
                columns: column_groups::Columns {
                    normal_columns: Some(vec![
                        column_groups::NormalColumn {
                            physical_name: "CREATED_AT".to_string(),
                            logical_name: Some("Created At".to_string()),
                            description: Some("Created timestamp".to_string()),
                            column_type: "datetime".to_string(),
                            length: Some(6),
                            decimal: Some(0),
                            args: Some("fsp".to_string()),
                            not_null: Some(true),
                            unique_key: Some(false),
                            unsigned: Some(false),
                            default_value: Some("CURRENT_TIMESTAMP".to_string()),
                        },
                        column_groups::NormalColumn {
                            physical_name: "UPDATED_BY".to_string(),
                            column_type: "bigint".to_string(),
                            ..Default::default()
                        },
                    ]),
                },
            },
            column_groups::ColumnGroup {
                column_group_name: "AUDIT".to_string(),
                columns: column_groups::Columns {
                    normal_columns: None,
                },
            },
        ])
    );
}

#[test]
fn length_rejects_invalid_value_type() {
    ASSERTIONS.assert_replaced_fixture_parse_error(
        "<length>6</length>",
        "<length>long</length>",
        "length",
    );
}

#[test]
fn decimal_rejects_invalid_value_type() {
    ASSERTIONS.assert_replaced_fixture_parse_error(
        "<decimal>0</decimal>",
        "<decimal>none</decimal>",
        "decimal",
    );
}

#[test]
fn not_null_rejects_invalid_value_type() {
    ASSERTIONS.assert_replaced_fixture_parse_error(
        "<not_null>true</not_null>",
        "<not_null>required</not_null>",
        "not_null",
    );
}

#[test]
fn unique_key_rejects_invalid_value_type() {
    ASSERTIONS.assert_replaced_fixture_parse_error(
        "<unique_key>false</unique_key>",
        "<unique_key>unique</unique_key>",
        "unique_key",
    );
}

#[test]
fn unsigned_rejects_invalid_value_type() {
    ASSERTIONS.assert_replaced_fixture_parse_error(
        "<unsigned>false</unsigned>",
        "<unsigned>unsigned</unsigned>",
        "unsigned",
    );
}

#[test]
fn missing_column_group_name_is_rejected() {
    ASSERTIONS.assert_removed_line_parse_error("column_group_name", "missing_column_group_name");
}

#[test]
fn missing_columns_is_rejected() {
    ASSERTIONS.assert_removed_element_parse_error("columns", "missing_columns");
}

#[test]
fn missing_physical_name_is_rejected() {
    ASSERTIONS.assert_removed_line_parse_error("physical_name", "missing_physical_name");
}

#[test]
fn missing_type_is_rejected() {
    ASSERTIONS.assert_removed_line_parse_error("type", "missing_type");
}
