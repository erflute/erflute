use crate::entities::diagram::column_groups as entities;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct NormalColumn {
    pub physical_name: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub logical_name: Option<String>,

    pub column_type: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub not_null: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unique_key: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unsigned: Option<bool>,
}

impl From<entities::NormalColumn> for NormalColumn {
    fn from(entity: entities::NormalColumn) -> Self {
        Self {
            physical_name: entity.physical_name,
            logical_name: entity.logical_name,
            column_type: entity.column_type,
            not_null: entity.not_null,
            unique_key: entity.unique_key,
            unsigned: entity.unsigned,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Columns {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub normal_columns: Option<Vec<NormalColumn>>,
}

impl From<entities::Columns> for Columns {
    fn from(entity: entities::Columns) -> Self {
        Self {
            normal_columns: entity
                .normal_columns
                .map(|v| v.into_iter().map(Into::into).collect()),
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ColumnGroup {
    pub column_group_name: String,
    pub columns: Columns,
}

impl From<entities::ColumnGroup> for ColumnGroup {
    fn from(entity: entities::ColumnGroup) -> Self {
        Self {
            column_group_name: entity.column_group_name,
            columns: entity.columns.into(),
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ColumnGroups {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub column_groups: Option<Vec<ColumnGroup>>,
}

impl From<entities::ColumnGroups> for ColumnGroups {
    fn from(entity: entities::ColumnGroups) -> Self {
        Self {
            column_groups: entity
                .column_groups
                .map(|v| v.into_iter().map(Into::into).collect()),
        }
    }
}
