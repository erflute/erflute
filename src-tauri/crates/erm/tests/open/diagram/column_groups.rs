use pretty_assertions::assert_eq;
use std::fs;

use erm::dtos::diagram::column_groups;
use erm::open;

const COLUMN_GROUPS_FIXTURE: &str = "./tests/open/fixtures/diagram/column_groups.erm";

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
    assert_replaced_fixture_parse_error("<length>6</length>", "<length>long</length>", "length");
}

#[test]
fn decimal_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<decimal>0</decimal>",
        "<decimal>none</decimal>",
        "decimal",
    );
}

#[test]
fn not_null_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<not_null>true</not_null>",
        "<not_null>required</not_null>",
        "not_null",
    );
}

#[test]
fn unique_key_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<unique_key>false</unique_key>",
        "<unique_key>unique</unique_key>",
        "unique_key",
    );
}

#[test]
fn unsigned_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<unsigned>false</unsigned>",
        "<unsigned>unsigned</unsigned>",
        "unsigned",
    );
}

#[test]
fn missing_column_group_name_is_rejected() {
    assert_removed_line_parse_error("column_group_name", "missing_column_group_name");
}

#[test]
fn missing_columns_is_rejected() {
    assert_removed_element_parse_error("columns", "missing_columns");
}

#[test]
fn missing_physical_name_is_rejected() {
    assert_removed_line_parse_error("physical_name", "missing_physical_name");
}

#[test]
fn missing_type_is_rejected() {
    assert_removed_line_parse_error("type", "missing_type");
}

fn assert_removed_line_parse_error(tag_name: &str, test_name: &str) {
    let fixture = fs::read_to_string(COLUMN_GROUPS_FIXTURE).expect("failed to read fixture");
    let line = fixture
        .lines()
        .find(|line| line.trim_start().starts_with(&format!("<{tag_name}>")))
        .expect("failed to find fixture line");
    let content = fixture.replace(&format!("{line}\n"), "");
    assert_ne!(fixture, content);

    assert_parse_error(content, test_name);
}

fn assert_removed_element_parse_error(tag_name: &str, test_name: &str) {
    let fixture = fs::read_to_string(COLUMN_GROUPS_FIXTURE).expect("failed to read fixture");
    let start = fixture
        .find(&format!("      <{tag_name}"))
        .expect("failed to find fixture element");

    let content = if let Some(self_closing_end) = fixture[start..].find("/>\n") {
        let end = start + self_closing_end + 3;
        let mut content = fixture.clone();
        content.replace_range(start..end, "");
        content
    } else {
        let closing = format!("      </{tag_name}>\n");
        let end = fixture[start..]
            .find(&closing)
            .map(|index| start + index + closing.len())
            .expect("failed to find fixture closing element");
        let mut content = fixture.clone();
        content.replace_range(start..end, "");
        content
    };

    assert_ne!(fixture, content);
    assert_parse_error(content, test_name);
}

fn assert_replaced_fixture_parse_error(target: &str, replacement: &str, test_name: &str) {
    let fixture = fs::read_to_string(COLUMN_GROUPS_FIXTURE).expect("failed to read fixture");
    let content = fixture.replace(target, replacement);
    assert_ne!(fixture, content);

    assert_parse_error(content, test_name);
}

fn assert_parse_error(content: String, test_name: &str) {
    let path = std::env::temp_dir().join(format!(
        "erm_column_groups_{}_{}.erm",
        std::process::id(),
        test_name
    ));

    fs::write(&path, content).expect("failed to write fixture");

    let result = open(path.to_str().expect("invalid fixture path"));

    fs::remove_file(&path).expect("failed to remove fixture");
    assert!(result.is_err());
}
