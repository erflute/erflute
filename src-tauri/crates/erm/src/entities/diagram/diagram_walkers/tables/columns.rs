use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct NormalColumn {
    pub physical_name: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub logical_name: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[serde(rename = "type")]
    pub column_type: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub length: Option<u16>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub decimal: Option<u16>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unsigned: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub not_null: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unique_key: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub default_value: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub primary_key: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub auto_increment: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub referred_column: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub relationship: Option<String>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub enum ColumnItem {
    #[serde(rename = "normal_column")]
    Normal(NormalColumn),

    #[serde(rename = "column_group")]
    Group(String),
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Columns {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[serde(rename = "$value")]
    pub items: Option<Vec<ColumnItem>>,
}
