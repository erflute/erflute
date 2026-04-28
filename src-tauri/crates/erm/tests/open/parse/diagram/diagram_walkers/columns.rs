use pretty_assertions::assert_eq;

use erm::dtos::diagram::diagram_walkers::tables::columns;

use super::support;

#[test]
fn columns_tags_keep_valid_values() {
    let table = support::first_table();

    assert_eq!(
        table.columns,
        columns::Columns {
            items: Some(vec![
                columns::ColumnItem::Normal(columns::NormalColumn {
                    physical_name: "MEMBER_ID".to_string(),
                    logical_name: Some("Member ID".to_string()),
                    description: Some("Surrogate key".to_string()),
                    column_type: Some("bigint".to_string()),
                    length: Some(18),
                    decimal: Some(0),
                    args: Some("UNSIGNED".to_string()),
                    unsigned: Some(true),
                    not_null: Some(true),
                    unique_key: Some(true),
                    default_value: Some("0".to_string()),
                    primary_key: Some(true),
                    auto_increment: Some(true),
                    referred_column: Some("table.PARENT_MEMBERS.PARENT_MEMBER_ID".to_string()),
                    relationship: Some("FK_MEMBERS_PARENT".to_string()),
                }),
                columns::ColumnItem::Normal(columns::NormalColumn {
                    physical_name: "MEMBER_NAME".to_string(),
                    ..Default::default()
                }),
                columns::ColumnItem::Group("COMMON_COLUMNS".to_string()),
            ]),
        }
    );
}

#[test]
fn length_rejects_invalid_value_type() {
    support::assert_replaced_fixture_parse_error(
        "<length>18</length>",
        "<length>long</length>",
        "column_length",
    );
}

#[test]
fn decimal_rejects_invalid_value_type() {
    support::assert_replaced_fixture_parse_error(
        "<decimal>0</decimal>",
        "<decimal>none</decimal>",
        "column_decimal",
    );
}

#[test]
fn unsigned_rejects_invalid_value_type() {
    support::assert_replaced_fixture_parse_error(
        "<unsigned>true</unsigned>",
        "<unsigned>yes</unsigned>",
        "column_unsigned",
    );
}

#[test]
fn not_null_rejects_invalid_value_type() {
    support::assert_replaced_fixture_parse_error(
        "<not_null>true</not_null>",
        "<not_null>required</not_null>",
        "column_not_null",
    );
}

#[test]
fn primary_key_rejects_invalid_value_type() {
    support::assert_replaced_fixture_parse_error(
        "<primary_key>true</primary_key>",
        "<primary_key>primary</primary_key>",
        "column_primary_key",
    );
}
