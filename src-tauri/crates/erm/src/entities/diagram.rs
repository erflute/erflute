pub mod column_groups;
pub mod diagram_settings;
pub mod diagram_walkers;

use column_groups::ColumnGroups;
use diagram_settings::DiagramSettings;
use diagram_walkers::DiagramWalkers;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Diagram {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub presenter: Option<String>,

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
    pub column_groups: Option<ColumnGroups>,
}
