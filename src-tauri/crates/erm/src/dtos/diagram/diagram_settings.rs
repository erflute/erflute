use crate::entities::diagram::diagram_settings as entities;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportSettings {}

impl From<entities::ExportSettings> for ExportSettings {
    fn from(_: entities::ExportSettings) -> Self {
        Self {}
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CategorySettings {}

impl From<entities::CategorySettings> for CategorySettings {
    fn from(_: entities::CategorySettings) -> Self {
        Self {}
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelProperties {}

impl From<entities::ModelProperties> for ModelProperties {
    fn from(_: entities::ModelProperties) -> Self {
        Self {}
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TableProperties {}

impl From<entities::TableProperties> for TableProperties {
    fn from(_: entities::TableProperties) -> Self {
        Self {}
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnvironmentSettings {}

impl From<entities::EnvironmentSettings> for EnvironmentSettings {
    fn from(_: entities::EnvironmentSettings) -> Self {
        Self {}
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DesignSettings {}

impl From<entities::DesignSettings> for DesignSettings {
    fn from(_: entities::DesignSettings) -> Self {
        Self {}
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
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
    pub title_font_em: Option<f64>,
    pub master_data_base_path: Option<String>,
    pub use_view_object: bool,
    pub export_settings: ExportSettings,
    pub category_settings: CategorySettings,
    pub model_properties: ModelProperties,
    pub table_properties: TableProperties,
    pub environment_settings: Option<EnvironmentSettings>,
    pub design_settings: Option<DesignSettings>,
}

impl From<entities::DiagramSettings> for DiagramSettings {
    fn from(entity: entities::DiagramSettings) -> Self {
        Self {
            database: entity.database,
            capital: entity.capital,
            table_style: entity.table_style,
            notation: entity.notation,
            notation_level: entity.notation_level,
            notation_expand_group: entity.notation_expand_group,
            view_mode: entity.view_mode,
            outline_view_mode: entity.outline_view_mode,
            view_order_by: entity.view_order_by,
            auto_ime_change: entity.auto_ime_change,
            validate_physical_name: entity.validate_physical_name,
            use_bezier_curve: entity.use_bezier_curve,
            suspend_validator: entity.suspend_validator,
            title_font_em: entity.title_font_em,
            master_data_base_path: entity.master_data_base_path,
            use_view_object: entity.use_view_object,
            export_settings: entity.export_settings.into(),
            category_settings: entity.category_settings.into(),
            model_properties: entity.model_properties.into(),
            table_properties: entity.table_properties.into(),
            environment_settings: entity.environment_settings.map(Into::into),
            design_settings: entity.design_settings.map(Into::into),
        }
    }
}
