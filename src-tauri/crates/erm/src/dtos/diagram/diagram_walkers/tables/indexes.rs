use crate::entities::diagram::diagram_walkers::tables::indexes as entities;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Column {
    pub column_id: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub desc: Option<bool>,
}

impl From<entities::Column> for Column {
    fn from(entity: entities::Column) -> Self {
        Self {
            column_id: entity.column_id,
            desc: entity.desc,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Index {
    pub name: String,

    pub index_type: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub full_text: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub non_unique: Option<bool>,

    pub columns: Vec<Column>,
}

impl From<entities::Index> for Index {
    fn from(entity: entities::Index) -> Self {
        Self {
            name: entity.name,
            index_type: entity.index_type,
            description: entity.description,
            full_text: entity.full_text,
            non_unique: entity.non_unique,
            columns: entity.columns.columns.into_iter().map(Into::into).collect(),
        }
    }
}
