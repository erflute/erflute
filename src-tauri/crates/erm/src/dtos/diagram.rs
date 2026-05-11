pub mod column_groups;
pub mod diagram_settings;
pub mod diagram_walkers;
pub mod page_settings;

use column_groups::ColumnGroup;
use diagram_settings::DiagramSettings;
use diagram_walkers::DiagramWalkers;
use page_settings::PageSettings;
use serde::{Deserialize, Serialize};

use crate::validation::Validate;
use crate::validation::rules::diagram::{
    validate_column_group_column_length_and_decimal, validate_column_group_references,
    validate_duplicate_column_group_column_physical_names, validate_duplicate_column_group_names,
};

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl From<crate::entities::diagram::Color> for Color {
    fn from(entity: crate::entities::diagram::Color) -> Self {
        Self {
            r: entity.r,
            g: entity.g,
            b: entity.b,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate)]
#[validate(rules(
    validate_duplicate_column_group_names,
    validate_duplicate_column_group_column_physical_names,
    validate_column_group_column_length_and_decimal,
    validate_column_group_references
))]
#[serde(rename_all = "camelCase")]
pub struct Diagram {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub presenter: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub page_settings: Option<PageSettings>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub category_index: Option<i64>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub current_ermodel: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub zoom: Option<f64>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub x: Option<i64>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub y: Option<i64>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub default_color: Option<Color>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub color: Option<Color>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font_name: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font_size: Option<i64>,

    pub diagram_settings: DiagramSettings,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub diagram_walkers: Option<DiagramWalkers>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub column_groups: Option<Vec<ColumnGroup>>,
}

impl From<crate::entities::diagram::Diagram> for Diagram {
    fn from(entity: crate::entities::diagram::Diagram) -> Self {
        Self {
            presenter: entity.presenter,
            page_settings: entity.page_settings.map(Into::into),
            category_index: entity.category_index,
            current_ermodel: entity.current_ermodel,
            zoom: entity.zoom,
            x: entity.x,
            y: entity.y,
            default_color: entity.default_color.map(Into::into),
            color: entity.color.map(Into::into),
            font_name: entity.font_name,
            font_size: entity.font_size,
            diagram_settings: entity.diagram_settings.into(),
            diagram_walkers: entity.diagram_walkers.map(Into::into),
            column_groups: entity
                .column_groups
                .and_then(|groups| groups.column_groups)
                .map(|v| v.into_iter().map(Into::into).collect()),
        }
    }
}
