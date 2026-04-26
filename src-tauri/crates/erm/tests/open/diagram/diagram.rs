use pretty_assertions::assert_eq;
use std::fs;

use erm::dtos::diagram;
use erm::open;

const DIAGRAM_FIXTURE: &str = "./tests/open/fixtures/diagram/diagram.erm";

#[test]
fn diagram_tags_keep_valid_values() {
    let diagram = open(DIAGRAM_FIXTURE).expect("failed to parse");

    assert_eq!(diagram.presenter, Some("ERFlute".to_string()));
    assert_eq!(diagram.category_index, Some(2));
    assert_eq!(diagram.current_ermodel, Some("main".to_string()));
    assert_eq!(diagram.zoom, Some(1.25));
    assert_eq!(diagram.x, Some(-10));
    assert_eq!(diagram.y, Some(20));
    assert_eq!(
        diagram.default_color,
        Some(diagram::Color { r: 1, g: 2, b: 3 })
    );
    assert_eq!(diagram.color, Some(diagram::Color { r: 4, g: 5, b: 6 }));
    assert_eq!(diagram.font_name, Some("Ubuntu".to_string()));
    assert_eq!(diagram.font_size, Some(9));
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
    assert_removed_element_parse_error("diagram_settings", "missing_diagram_settings");
}

fn assert_removed_element_parse_error(tag_name: &str, test_name: &str) {
    let fixture = fs::read_to_string(DIAGRAM_FIXTURE).expect("failed to read fixture");
    let start = fixture
        .find(&format!("  <{tag_name}"))
        .expect("failed to find fixture element");
    let closing = format!("  </{tag_name}>\n");
    let end = fixture[start..]
        .find(&closing)
        .map(|index| start + index + closing.len())
        .expect("failed to find fixture closing element");
    let mut content = fixture.clone();
    content.replace_range(start..end, "");

    assert_ne!(fixture, content);
    assert_parse_error(content, test_name);
}

fn assert_replaced_fixture_parse_error(target: &str, replacement: &str, test_name: &str) {
    let fixture = fs::read_to_string(DIAGRAM_FIXTURE).expect("failed to read fixture");
    let content = fixture.replace(target, replacement);
    assert_ne!(fixture, content);

    assert_parse_error(content, test_name);
}

fn assert_parse_error(content: String, test_name: &str) {
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
