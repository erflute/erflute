use pretty_assertions::assert_eq;
use std::fs;

use erm::dtos::diagram;
use erm::dtos::diagram::diagram_settings;
use erm::open;

const VALID_VALUES_FIXTURE: &str = "./tests/open/fixtures/diagram/valid_values.erm";

#[test]
fn diagram_tags_keep_valid_values() {
    let diagram = open(VALID_VALUES_FIXTURE).expect("failed to parse");

    assert_eq!(
        diagram,
        diagram::Diagram {
            presenter: Some("ERFlute".to_string()),
            category_index: Some(2),
            current_ermodel: Some("main".to_string()),
            zoom: Some(1.25),
            x: Some(-10),
            y: Some(20),
            default_color: Some(diagram::Color { r: 1, g: 2, b: 3 }),
            color: Some(diagram::Color { r: 4, g: 5, b: 6 }),
            font_name: Some("Ubuntu".to_string()),
            font_size: Some(9),
            diagram_settings: diagram_settings::DiagramSettings {
                database: "MySQL".to_string(),
                view_mode: 1,
            },
            diagram_walkers: None,
            column_groups: None,
        }
    );
}

#[test]
fn category_index_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<category_index>2</category_index>",
        "<category_index>main</category_index>",
        "category_index",
    );
}

#[test]
fn zoom_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error("<zoom>1.25</zoom>", "<zoom>large</zoom>", "zoom");
}

#[test]
fn x_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error("<x>-10</x>", "<x>left</x>", "x");
}

#[test]
fn y_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error("<y>20</y>", "<y>top</y>", "y");
}

#[test]
fn default_color_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "  <default_color>\n    <r>1</r>\n    <g>2</g>\n    <b>3</b>\n  </default_color>",
        "  <default_color>\n    <r>red</r>\n    <g>2</g>\n    <b>3</b>\n  </default_color>",
        "default_color",
    );
}

#[test]
fn color_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "  <color>\n    <r>4</r>\n    <g>5</g>\n    <b>6</b>\n  </color>",
        "  <color>\n    <r>4</r>\n    <g>green</g>\n    <b>6</b>\n  </color>",
        "color",
    );
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
fn missing_required_diagram_settings_is_rejected() {
    assert_replaced_fixture_parse_error(
        "  <diagram_settings>\n    <database>MySQL</database>\n    <view_mode>1</view_mode>\n  </diagram_settings>",
        "",
        "missing_diagram_settings",
    );
}

fn assert_replaced_fixture_parse_error(target: &str, replacement: &str, test_name: &str) {
    let fixture = fs::read_to_string(VALID_VALUES_FIXTURE).expect("failed to read fixture");
    let content = fixture.replace(target, replacement);
    assert_ne!(fixture, content);

    let path = std::env::temp_dir().join(format!(
        "erm_diagram_{}_{}.erm",
        std::process::id(),
        test_name
    ));

    fs::write(&path, content).expect("failed to write fixture");

    let result = open(path.to_str().expect("invalid fixture path"));

    fs::remove_file(&path).expect("failed to remove fixture");
    assert!(result.is_err());
}
