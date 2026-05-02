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
                    column_type: Some(columns::ColumnType::DecimalPS),
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
fn empty_column_type_is_accepted_as_no_type() {
    let diagram = support::open_replaced_fixture(
        "<physical_name>MEMBER_NAME</physical_name>",
        "<physical_name>MEMBER_NAME</physical_name>\n          <type></type>",
        "empty_column_type",
    )
    .expect("failed to parse");
    let table = diagram
        .diagram_walkers
        .expect("missing diagram walkers")
        .tables
        .expect("missing tables")
        .into_iter()
        .next()
        .expect("missing table");
    let column = table
        .columns
        .items
        .expect("missing columns")
        .into_iter()
        .find_map(|item| match item {
            columns::ColumnItem::Normal(column) if column.physical_name == "MEMBER_NAME" => {
                Some(column)
            }
            columns::ColumnItem::Normal(_) => None,
            columns::ColumnItem::Group(_) => None,
        })
        .expect("missing normal column");

    assert_eq!(column.column_type, None);
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

#[test]
fn display_label_column_type_is_rejected() {
    support::assert_replaced_fixture_parse_error(
        "<type>decimal(p,s)</type>",
        "<type>double(m,d)</type>",
        "display_label_column_type",
    );
}
