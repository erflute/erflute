use pretty_assertions::assert_eq;
use std::fs;

use erm::dtos::diagram::page_settings;
use erm::open;

const PAGE_SETTINGS_FIXTURE: &str = "./tests/open/fixtures/diagram/page_settings.erm";

#[test]
fn page_settings_tags_keep_valid_values() {
    let diagram = open(PAGE_SETTINGS_FIXTURE).expect("failed to parse");

    assert_eq!(
        diagram.page_settings,
        Some(page_settings::PageSettings {
            direction_horizontal: true,
            scale: 100,
            paper_size: "A4 210 x 297 mm".to_string(),
            top_margin: 30,
            left_margin: 31,
            bottom_margin: 32,
            right_margin: 33,
        })
    );
}

#[test]
fn direction_horizontal_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<direction_horizontal>true</direction_horizontal>",
        "<direction_horizontal>horizontal</direction_horizontal>",
        "direction_horizontal",
    );
}

#[test]
fn scale_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error("<scale>100</scale>", "<scale>large</scale>", "scale");
}

#[test]
fn top_margin_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<top_margin>30</top_margin>",
        "<top_margin>top</top_margin>",
        "top_margin",
    );
}

#[test]
fn left_margin_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<left_margin>31</left_margin>",
        "<left_margin>left</left_margin>",
        "left_margin",
    );
}

#[test]
fn bottom_margin_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<bottom_margin>32</bottom_margin>",
        "<bottom_margin>bottom</bottom_margin>",
        "bottom_margin",
    );
}

#[test]
fn right_margin_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<right_margin>33</right_margin>",
        "<right_margin>right</right_margin>",
        "right_margin",
    );
}

#[test]
fn missing_direction_horizontal_is_rejected() {
    assert_replaced_fixture_parse_error(
        "    <direction_horizontal>true</direction_horizontal>\n",
        "",
        "missing_direction_horizontal",
    );
}

#[test]
fn missing_scale_is_rejected() {
    assert_replaced_fixture_parse_error("    <scale>100</scale>\n", "", "missing_scale");
}

#[test]
fn missing_paper_size_is_rejected() {
    assert_replaced_fixture_parse_error(
        "    <paper_size>A4 210 x 297 mm</paper_size>\n",
        "",
        "missing_paper_size",
    );
}

#[test]
fn missing_top_margin_is_rejected() {
    assert_replaced_fixture_parse_error(
        "    <top_margin>30</top_margin>\n",
        "",
        "missing_top_margin",
    );
}

#[test]
fn missing_left_margin_is_rejected() {
    assert_replaced_fixture_parse_error(
        "    <left_margin>31</left_margin>\n",
        "",
        "missing_left_margin",
    );
}

#[test]
fn missing_bottom_margin_is_rejected() {
    assert_replaced_fixture_parse_error(
        "    <bottom_margin>32</bottom_margin>\n",
        "",
        "missing_bottom_margin",
    );
}

#[test]
fn missing_right_margin_is_rejected() {
    assert_replaced_fixture_parse_error(
        "    <right_margin>33</right_margin>\n",
        "",
        "missing_right_margin",
    );
}

fn assert_replaced_fixture_parse_error(target: &str, replacement: &str, test_name: &str) {
    let fixture = fs::read_to_string(PAGE_SETTINGS_FIXTURE).expect("failed to read fixture");
    let content = fixture.replace(target, replacement);
    assert_ne!(fixture, content);

    let path = std::env::temp_dir().join(format!(
        "erm_page_settings_{}_{}.erm",
        std::process::id(),
        test_name
    ));

    fs::write(&path, content).expect("failed to write fixture");

    let result = open(path.to_str().expect("invalid fixture path"));

    fs::remove_file(&path).expect("failed to remove fixture");
    assert!(result.is_err());
}
