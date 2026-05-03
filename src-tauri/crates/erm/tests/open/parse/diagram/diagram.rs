use pretty_assertions::assert_eq;

use erm::dtos::diagram;
use erm::open;

use crate::open::support;

const DIAGRAM_FIXTURE: &str = "./tests/open/fixtures/diagram/diagram.erm";
const TEMP_PREFIX: &str = "erm_diagram";
const ASSERTIONS: support::FixtureAssertions =
    support::FixtureAssertions::new(DIAGRAM_FIXTURE, TEMP_PREFIX, "  ");

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
    ASSERTIONS.assert_replaced_fixture_parse_error(
        "<category_index>2</category_index>",
        "<category_index>main</category_index>",
        "category_index",
    );
}

#[test]
fn zoom_rejects_invalid_value_type() {
    ASSERTIONS.assert_replaced_fixture_parse_error(
        "<zoom>1.25</zoom>",
        "<zoom>large</zoom>",
        "zoom",
    );
}

#[test]
fn x_rejects_invalid_value_type() {
    ASSERTIONS.assert_replaced_fixture_parse_error("<x>-10</x>", "<x>left</x>", "x");
}

#[test]
fn y_rejects_invalid_value_type() {
    ASSERTIONS.assert_replaced_fixture_parse_error("<y>20</y>", "<y>top</y>", "y");
}

#[test]
fn default_color_rejects_invalid_value_type() {
    ASSERTIONS.assert_replaced_fixture_parse_error(
        "  <default_color>\n    <r>1</r>\n    <g>2</g>\n    <b>3</b>\n  </default_color>",
        "  <default_color>\n    <r>red</r>\n    <g>2</g>\n    <b>3</b>\n  </default_color>",
        "default_color",
    );
}

#[test]
fn color_rejects_invalid_value_type() {
    ASSERTIONS.assert_replaced_fixture_parse_error(
        "  <color>\n    <r>4</r>\n    <g>5</g>\n    <b>6</b>\n  </color>",
        "  <color>\n    <r>4</r>\n    <g>green</g>\n    <b>6</b>\n  </color>",
        "color",
    );
}

#[test]
fn font_size_rejects_invalid_value_type() {
    ASSERTIONS.assert_replaced_fixture_parse_error(
        "<font_size>9</font_size>",
        "<font_size>large</font_size>",
        "font_size",
    );
}

#[test]
fn missing_required_diagram_settings_is_rejected() {
    ASSERTIONS.assert_removed_element_parse_error("diagram_settings", "missing_diagram_settings");
}
