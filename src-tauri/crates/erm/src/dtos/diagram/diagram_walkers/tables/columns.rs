use crate::entities::diagram::diagram_walkers::tables::columns as entities;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct NormalColumn {
    pub physical_name: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub logical_name: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub column_type: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub length: Option<u16>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub decimal: Option<u16>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unsigned: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub not_null: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub unique_key: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub default_value: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub primary_key: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub auto_increment: Option<bool>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub referred_column: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub relationship: Option<String>,
}

impl From<entities::NormalColumn> for NormalColumn {
    fn from(entity: entities::NormalColumn) -> Self {
        Self {
            physical_name: entity.physical_name,
            logical_name: entity.logical_name,
            description: entity.description,
            column_type: entity.column_type,
            length: entity.length,
            decimal: entity.decimal,
            unsigned: entity.unsigned,
            not_null: entity.not_null,
            unique_key: entity.unique_key,
            default_value: entity.default_value,
            primary_key: entity.primary_key,
            auto_increment: entity.auto_increment,
            referred_column: entity.referred_column,
            relationship: entity.relationship,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ColumnItem {
    Normal(NormalColumn),
    Group(String),
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Columns {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub items: Option<Vec<ColumnItem>>,
}

impl From<entities::Columns> for Columns {
    fn from(entity: entities::Columns) -> Self {
        Self {
            items: entity.items.map(|v| {
                v.into_iter()
                    .map(|item| match item {
                        entities::ColumnItem::Normal(column) => ColumnItem::Normal(column.into()),
                        entities::ColumnItem::Group(column) => ColumnItem::Group(column),
                    })
                    .collect()
            }),
        }
    }
}
