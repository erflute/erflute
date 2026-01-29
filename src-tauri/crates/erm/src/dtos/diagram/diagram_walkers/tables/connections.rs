use crate::entities::diagram::diagram_walkers::tables::connections as entities;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Bendpoint {
    pub relative: bool,
    pub x: u16,
    pub y: u16,
}

impl From<entities::Bendpoint> for Bendpoint {
    fn from(entity: entities::Bendpoint) -> Self {
        Self {
            relative: entity.relative,
            x: entity.x,
            y: entity.y,
        }
    }
}

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

    #[serde(default, skip_serializing_if = "Option::is_none")]
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

impl From<entities::Relationship> for Relationship {
    fn from(entity: entities::Relationship) -> Self {
        Self {
            name: entity.name,
            source: entity.source,
            target: entity.target,
            bendpoints: entity
                .bendpoints
                .map(|v| v.into_iter().map(Into::into).collect()),
            fk_columns: entity.fk_columns.into(),
            parent_cardinality: entity.parent_cardinality,
            child_cardinality: entity.child_cardinality,
            reference_for_pk: entity.reference_for_pk,
            on_delete_action: entity.on_delete_action,
            on_update_action: entity.on_update_action,
            referred_simple_unique_column: entity.referred_simple_unique_column,
            referred_compound_unique_key: entity.referred_compound_unique_key,
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
