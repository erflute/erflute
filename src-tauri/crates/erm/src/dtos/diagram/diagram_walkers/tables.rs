pub mod columns;
pub mod compound_unique_key_list;
pub mod connections;

use crate::entities::diagram::diagram_walkers::tables as entities;
use columns::Columns;
use compound_unique_key_list::CompoundUniqueKeyList;
use connections::Connections;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl From<entities::Color> for Color {
    fn from(entity: entities::Color) -> Self {
        Self {
            r: entity.r,
            g: entity.g,
            b: entity.b,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Table {
    pub physical_name: String,
    pub logical_name: String,
    pub description: String,
    pub height: u16,
    pub width: u16,
    pub font_name: String,
    pub font_size: u16,
    pub x: u16,
    pub y: u16,
    pub color: Color,
    pub connections: Connections,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub table_constraint: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub primary_key_name: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub option: Option<String>,

    pub columns: Columns,

    pub compound_unique_key_list: CompoundUniqueKeyList,
}

impl From<entities::Table> for Table {
    fn from(entity: entities::Table) -> Self {
        Self {
            physical_name: entity.physical_name,
            logical_name: entity.logical_name,
            description: entity.description,
            height: entity.height,
            width: entity.width,
            font_name: entity.font_name,
            font_size: entity.font_size,
            x: entity.x,
            y: entity.y,
            color: entity.color.into(),
            connections: entity.connections.into(),
            table_constraint: entity.table_constraint,
            primary_key_name: entity.primary_key_name,
            option: entity.option,
            columns: entity.columns.into(),
            compound_unique_key_list: entity.compound_unique_key_list.into(),
        }
    }
}
