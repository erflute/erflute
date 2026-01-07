use serde::{Deserialize, Serialize};

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
    pub fk_columns: FkColumns,
    pub parent_cardinality: String,
    pub child_cardinality: String,
    pub reference_for_pk: bool,
    pub on_delete_action: String,
    pub on_update_action: String,
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct Connections {
    #[serde(default)]
    #[serde(rename = "relationship")]
    pub relationships: Option<Vec<Relationship>>,
}
