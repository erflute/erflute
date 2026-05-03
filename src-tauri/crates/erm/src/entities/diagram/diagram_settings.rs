use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct ExportSettings {}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct CategorySettings {}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct ModelProperties {}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct TableProperties {}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct EnvironmentSettings {}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct DesignSettings {}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct DiagramSettings {
    pub database: String,
    pub capital: bool,
    pub table_style: String,
    pub notation: String,
    pub notation_level: i64,
    pub notation_expand_group: bool,
    pub view_mode: i64,
    pub outline_view_mode: i64,
    pub view_order_by: i64,
    pub auto_ime_change: bool,
    pub validate_physical_name: bool,
    pub use_bezier_curve: bool,
    pub suspend_validator: bool,

    #[serde(
        default,
        rename = "titleFontEm",
        skip_serializing_if = "Option::is_none"
    )]
    pub title_font_em: Option<f64>,

    #[serde(
        default,
        rename = "masterDataBasePath",
        skip_serializing_if = "Option::is_none"
    )]
    pub master_data_base_path: Option<String>,

    pub use_view_object: bool,
    pub export_settings: ExportSettings,
    pub category_settings: CategorySettings,
    pub model_properties: ModelProperties,
    pub table_properties: TableProperties,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub environment_settings: Option<EnvironmentSettings>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub design_settings: Option<DesignSettings>,
}
