use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct NormalColumn {
    pub physical_name: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub logical_name: Option<String>,

    #[serde(rename = "type")]
    pub column_type: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub not_null: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unique_key: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unsigned: Option<bool>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Columns {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[serde(rename = "normal_column")]
    pub normal_columns: Option<Vec<NormalColumn>>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct ColumnGroup {
    pub column_group_name: String,
    pub columns: Columns,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct ColumnGroups {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[serde(rename = "column_group")]
    pub column_groups: Option<Vec<ColumnGroup>>,
}
