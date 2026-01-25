use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Bendpoint {
    pub relative: bool,
    pub x: u16,
    pub y: u16,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct FkColumn {
    pub fk_column_name: String,
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct FkColumns {
    #[serde(default)]
    pub fk_column: Vec<FkColumn>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Relationship {
    pub name: String,

    pub source: String,

    pub target: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[serde(rename = "bendpoint")]
    pub bendpoints: Option<Vec<Bendpoint>>,

    pub fk_columns: FkColumns,

    pub parent_cardinality: String,

    pub child_cardinality: String,

    pub reference_for_pk: bool,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub on_delete_action: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub on_update_action: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub referred_simple_unique_column: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub referred_compound_unique_key: Option<String>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct Connections {
    #[serde(default)]
    #[serde(rename = "relationship")]
    pub relationships: Option<Vec<Relationship>>,
}
