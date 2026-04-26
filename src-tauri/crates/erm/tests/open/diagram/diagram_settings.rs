use pretty_assertions::assert_eq;
use std::fs;

use erm::dtos::diagram::diagram_settings;
use erm::open;

const DEFAULT_DIAGRAM_FIXTURE: &str = "./tests/open/fixtures/default_diagram.erm";

#[test]
fn diagram_settings_tags_keep_valid_values() {
    let diagram = open(DEFAULT_DIAGRAM_FIXTURE).expect("failed to parse");

    assert_eq!(
        diagram.diagram_settings,
        diagram_settings::DiagramSettings {
            database: "MySQL".to_string(),
            capital: true,
            table_style: "standard".to_string(),
            notation: "IE".to_string(),
            notation_level: 1,
            notation_expand_group: false,
            view_mode: 1,
            outline_view_mode: 2,
            view_order_by: 3,
            auto_ime_change: false,
            validate_physical_name: true,
            use_bezier_curve: false,
            suspend_validator: false,
            title_font_em: Some(1.5),
            master_data_base_path: Some("master.db".to_string()),
            use_view_object: true,
            export_settings: diagram_settings::ExportSettings {},
            category_settings: diagram_settings::CategorySettings {},
            model_properties: diagram_settings::ModelProperties {},
            table_properties: diagram_settings::TableProperties {},
            environment_settings: Some(diagram_settings::EnvironmentSettings {}),
            design_settings: Some(diagram_settings::DesignSettings {}),
        }
    );
}

#[test]
fn capital_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<capital>true</capital>",
        "<capital>yes</capital>",
        "capital",
    );
}

#[test]
fn notation_level_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<notation_level>1</notation_level>",
        "<notation_level>high</notation_level>",
        "notation_level",
    );
}

#[test]
fn notation_expand_group_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<notation_expand_group>false</notation_expand_group>",
        "<notation_expand_group>expanded</notation_expand_group>",
        "notation_expand_group",
    );
}

#[test]
fn view_mode_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<view_mode>1</view_mode>",
        "<view_mode>list</view_mode>",
        "view_mode",
    );
}

#[test]
fn outline_view_mode_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<outline_view_mode>2</outline_view_mode>",
        "<outline_view_mode>outline</outline_view_mode>",
        "outline_view_mode",
    );
}

#[test]
fn view_order_by_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<view_order_by>3</view_order_by>",
        "<view_order_by>name</view_order_by>",
        "view_order_by",
    );
}

#[test]
fn auto_ime_change_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<auto_ime_change>false</auto_ime_change>",
        "<auto_ime_change>auto</auto_ime_change>",
        "auto_ime_change",
    );
}

#[test]
fn validate_physical_name_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<validate_physical_name>true</validate_physical_name>",
        "<validate_physical_name>validate</validate_physical_name>",
        "validate_physical_name",
    );
}

#[test]
fn use_bezier_curve_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<use_bezier_curve>false</use_bezier_curve>",
        "<use_bezier_curve>curve</use_bezier_curve>",
        "use_bezier_curve",
    );
}

#[test]
fn suspend_validator_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<suspend_validator>false</suspend_validator>",
        "<suspend_validator>suspend</suspend_validator>",
        "suspend_validator",
    );
}

#[test]
fn title_font_em_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<titleFontEm>1.5</titleFontEm>",
        "<titleFontEm>large</titleFontEm>",
        "title_font_em",
    );
}

#[test]
fn use_view_object_rejects_invalid_value_type() {
    assert_replaced_fixture_parse_error(
        "<use_view_object>true</use_view_object>",
        "<use_view_object>use</use_view_object>",
        "use_view_object",
    );
}

#[test]
fn missing_database_is_rejected() {
    assert_removed_line_parse_error("database", "missing_database");
}

#[test]
fn missing_capital_is_rejected() {
    assert_removed_line_parse_error("capital", "missing_capital");
}

#[test]
fn missing_table_style_is_rejected() {
    assert_removed_line_parse_error("table_style", "missing_table_style");
}

#[test]
fn missing_notation_is_rejected() {
    assert_removed_line_parse_error("notation", "missing_notation");
}

#[test]
fn missing_notation_level_is_rejected() {
    assert_removed_line_parse_error("notation_level", "missing_notation_level");
}

#[test]
fn missing_notation_expand_group_is_rejected() {
    assert_removed_line_parse_error("notation_expand_group", "missing_notation_expand_group");
}

#[test]
fn missing_view_mode_is_rejected() {
    assert_removed_line_parse_error("view_mode", "missing_view_mode");
}

#[test]
fn missing_outline_view_mode_is_rejected() {
    assert_removed_line_parse_error("outline_view_mode", "missing_outline_view_mode");
}

#[test]
fn missing_view_order_by_is_rejected() {
    assert_removed_line_parse_error("view_order_by", "missing_view_order_by");
}

#[test]
fn missing_auto_ime_change_is_rejected() {
    assert_removed_line_parse_error("auto_ime_change", "missing_auto_ime_change");
}

#[test]
fn missing_validate_physical_name_is_rejected() {
    assert_removed_line_parse_error("validate_physical_name", "missing_validate_physical_name");
}

#[test]
fn missing_use_bezier_curve_is_rejected() {
    assert_removed_line_parse_error("use_bezier_curve", "missing_use_bezier_curve");
}

#[test]
fn missing_suspend_validator_is_rejected() {
    assert_removed_line_parse_error("suspend_validator", "missing_suspend_validator");
}

#[test]
fn missing_use_view_object_is_rejected() {
    assert_removed_line_parse_error("use_view_object", "missing_use_view_object");
}

#[test]
fn missing_export_settings_is_rejected() {
    assert_removed_element_parse_error("export_settings", "missing_export_settings");
}

#[test]
fn missing_category_settings_is_rejected() {
    assert_removed_element_parse_error("category_settings", "missing_category_settings");
}

#[test]
fn missing_model_properties_is_rejected() {
    assert_removed_element_parse_error("model_properties", "missing_model_properties");
}

#[test]
fn missing_table_properties_is_rejected() {
    assert_removed_element_parse_error("table_properties", "missing_table_properties");
}

fn assert_removed_line_parse_error(tag_name: &str, test_name: &str) {
    let fixture = fs::read_to_string(DEFAULT_DIAGRAM_FIXTURE).expect("failed to read fixture");
    let line = fixture
        .lines()
        .find(|line| line.trim_start().starts_with(&format!("<{tag_name}>")))
        .expect("failed to find fixture line");
    let content = fixture.replace(&format!("{line}\n"), "");
    assert_ne!(fixture, content);

    assert_parse_error(content, test_name);
}

fn assert_removed_element_parse_error(tag_name: &str, test_name: &str) {
    let fixture = fs::read_to_string(DEFAULT_DIAGRAM_FIXTURE).expect("failed to read fixture");
    let start = fixture
        .find(&format!("    <{tag_name}"))
        .expect("failed to find fixture element");

    let content = if let Some(self_closing_end) = fixture[start..].find("/>\n") {
        let end = start + self_closing_end + 3;
        let mut content = fixture.clone();
        content.replace_range(start..end, "");
        content
    } else {
        let closing = format!("    </{tag_name}>\n");
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
    let fixture = fs::read_to_string(DEFAULT_DIAGRAM_FIXTURE).expect("failed to read fixture");
    let content = fixture.replace(target, replacement);
    assert_ne!(fixture, content);

    assert_parse_error(content, test_name);
}

fn assert_parse_error(content: String, test_name: &str) {
    let path = std::env::temp_dir().join(format!(
        "erm_diagram_settings_{}_{}.erm",
        std::process::id(),
        test_name
    ));

    fs::write(&path, content).expect("failed to write fixture");

    let result = open(path.to_str().expect("invalid fixture path"));

    fs::remove_file(&path).expect("failed to remove fixture");
    assert!(result.is_err());
}
