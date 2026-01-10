use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Column {
    pub column_id: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub desc: Option<bool>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Columns {
    #[serde(rename = "column")]
    pub columns: Column,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Index {
    pub name: String,

    #[serde(rename = "type")]
    pub index_type: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub full_text: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub non_unique: Option<bool>,

    pub columns: Columns,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Indexes {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub indexes: Option<Vec<Index>>,
}
