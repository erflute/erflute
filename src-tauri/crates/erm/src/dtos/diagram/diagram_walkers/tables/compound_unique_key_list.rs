use crate::entities::diagram::diagram_walkers::tables::compound_unique_key_list as entities;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Column {
    pub column_id: String,
}

impl From<entities::Column> for Column {
    fn from(entity: entities::Column) -> Self {
        Self {
            column_id: entity.column_id,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompoundUniqueKey {
    pub name: String,
    pub columns: Vec<Column>,
}

impl From<entities::CompoundUniqueKey> for CompoundUniqueKey {
    fn from(entity: entities::CompoundUniqueKey) -> Self {
        Self {
            name: entity.name,
            columns: entity.columns.columns.into_iter().map(Into::into).collect(),
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompoundUniqueKeyList {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub compound_unique_keys: Option<Vec<CompoundUniqueKey>>,
}

impl From<entities::CompoundUniqueKeyList> for CompoundUniqueKeyList {
    fn from(entity: entities::CompoundUniqueKeyList) -> Self {
        Self {
            compound_unique_keys: entity
                .compound_unique_keys
                .map(|v| v.into_iter().map(Into::into).collect()),
        }
    }
}
