use crate::entities::diagram::diagram_walkers::tables::connections as entities;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FkColumn {
    pub fk_column_name: String,
}

impl From<entities::FkColumn> for FkColumn {
    fn from(entity: entities::FkColumn) -> Self {
        Self {
            fk_column_name: entity.fk_column_name,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FkColumns {
    #[serde(default)]
    pub fk_column: Vec<FkColumn>,
}

impl From<entities::FkColumns> for FkColumns {
    fn from(entity: entities::FkColumns) -> Self {
        Self {
            fk_column: entity.fk_column.into_iter().map(Into::into).collect(),
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
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

impl From<entities::Relationship> for Relationship {
    fn from(entity: entities::Relationship) -> Self {
        Self {
            name: entity.name,
            source: entity.source,
            target: entity.target,
            fk_columns: entity.fk_columns.into(),
            parent_cardinality: entity.parent_cardinality,
            child_cardinality: entity.child_cardinality,
            reference_for_pk: entity.reference_for_pk,
            on_delete_action: entity.on_delete_action,
            on_update_action: entity.on_update_action,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Connections {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub relationships: Option<Vec<Relationship>>,
}

impl From<entities::Connections> for Connections {
    fn from(entity: entities::Connections) -> Self {
        Self {
            relationships: entity
                .relationships
                .map(|v| v.into_iter().map(Into::into).collect()),
        }
    }
}
