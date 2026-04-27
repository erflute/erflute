use pretty_assertions::assert_eq;
use std::fs;

use erm::dtos::diagram::diagram_walkers;
use erm::dtos::diagram::diagram_walkers::tables;
use erm::open;

const DIAGRAM_WALKERS_FIXTURE: &str = "./tests/open/fixtures/diagram/diagram_walkers.erm";

#[test]
fn diagram_walkers_table_tags_keep_valid_values() {
    let diagram = open(DIAGRAM_WALKERS_FIXTURE).expect("failed to parse");
    let diagram_walkers = diagram.diagram_walkers.expect("missing diagram walkers");
    let tables = diagram_walkers.tables.expect("missing tables");

    assert_eq!(tables.len(), 2);
    assert_eq!(
        tables[0],
        diagram_walkers::tables::Table {
            physical_name: "MEMBERS".to_string(),
            logical_name: "Members".to_string(),
            description: "Member master table".to_string(),
            height: Some(108),
            width: Some(194),
            font_name: "Ubuntu".to_string(),
            font_size: 9,
            x: 160,
            y: 106,
            color: tables::Color {
                r: 128,
                g: 129,
                b: 130,
            },
            connections: tables::connections::Connections {
                relationships: None,
            },
            table_constraint: Some("ENGINE=InnoDB".to_string()),
            primary_key_name: Some("PK_MEMBERS".to_string()),
            option: Some("member option".to_string()),
            columns: tables::columns::Columns { items: None },
            indexes: None,
            compound_unique_key_list: tables::compound_unique_key_list::CompoundUniqueKeyList {
                compound_unique_keys: None,
            },
        }
    );
    assert_eq!(
        tables[1],
        diagram_walkers::tables::Table {
            physical_name: "MEMBER_STATUS".to_string(),
            logical_name: "Member Status".to_string(),
            description: "Status master table".to_string(),
            height: None,
            width: None,
            font_name: "Ubuntu".to_string(),
            font_size: 10,
            x: 400,
            y: 120,
            color: tables::Color {
                r: 10,
                g: 20,
                b: 30,
            },
            connections: tables::connections::Connections {
                relationships: None,
            },
            table_constraint: None,
            primary_key_name: None,
            option: None,
            columns: tables::columns::Columns { items: None },
            indexes: None,
            compound_unique_key_list: tables::compound_unique_key_list::CompoundUniqueKeyList {
                compound_unique_keys: None,
            },
        }
    );
}

#[test]
fn height_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error("<height>108</height>", "<height>tall</height>", "height");
}

#[test]
fn width_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error("<width>194</width>", "<width>wide</width>", "width");
}

#[test]
fn font_size_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<font_size>9</font_size>",
        "<font_size>large</font_size>",
        "font_size",
    );
}

#[test]
fn x_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error("<x>160</x>", "<x>left</x>", "x");
}

#[test]
fn y_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error("<y>106</y>", "<y>top</y>", "y");
}

#[test]
fn color_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "      <color>\n        <r>128</r>\n        <g>129</g>\n        <b>130</b>\n      </color>",
        "      <color>\n        <r>red</r>\n        <g>129</g>\n        <b>130</b>\n      </color>",
        "color",
    );
}

#[test]
fn missing_physical_name_is_rejected() {
    assert_removed_line_parse_error("physical_name", "missing_physical_name");
}

#[test]
fn missing_logical_name_is_rejected() {
    assert_removed_line_parse_error("logical_name", "missing_logical_name");
}

#[test]
fn missing_description_is_rejected() {
    assert_removed_line_parse_error("description", "missing_description");
}

#[test]
fn missing_columns_is_rejected() {
    assert_removed_element_parse_error("columns", "missing_columns");
}

#[test]
fn missing_indexes_is_rejected() {
    assert_removed_element_parse_error("indexes", "missing_indexes");
}

#[test]
fn missing_table_properties_is_rejected() {
    assert_removed_element_parse_error("table_properties", "missing_table_properties");
}

fn assert_removed_line_parse_error(tag_name: &str, test_name: &str) {
    let fixture = fs::read_to_string(DIAGRAM_WALKERS_FIXTURE).expect("failed to read fixture");
    let line = fixture
        .lines()
        .find(|line| line.trim_start().starts_with(&format!("<{tag_name}>")))
        .expect("failed to find fixture line");
    let content = fixture.replace(&format!("{line}\n"), "");
    assert_ne!(fixture, content);

    assert_parse_error(content, test_name);
}

fn assert_removed_element_parse_error(tag_name: &str, test_name: &str) {
    let fixture = fs::read_to_string(DIAGRAM_WALKERS_FIXTURE).expect("failed to read fixture");
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
    let fixture = fs::read_to_string(DIAGRAM_WALKERS_FIXTURE).expect("failed to read fixture");
    let content = fixture.replace(target, replacement);
    assert_ne!(fixture, content);

    assert_parse_error(content, test_name);
}

fn assert_parse_error(content: String, test_name: &str) {
    let path = std::env::temp_dir().join(format!(
        "erm_diagram_walkers_{}_{}.erm",
        std::process::id(),
        test_name
    ));

    fs::write(&path, content).expect("failed to write fixture");

    let result = open(path.to_str().expect("invalid fixture path"));

    fs::remove_file(&path).expect("failed to remove fixture");
    assert!(result.is_err());
}
