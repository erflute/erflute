use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Column {
    pub column_id: String,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Columns {
    #[serde(rename = "column")]
    pub columns: Vec<Column>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct CompoundUniqueKey {
    pub name: String,
    pub columns: Columns,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct CompoundUniqueKeyList {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[serde(rename = "compound_unique_key")]
    pub compound_unique_keys: Option<Vec<CompoundUniqueKey>>,
}
