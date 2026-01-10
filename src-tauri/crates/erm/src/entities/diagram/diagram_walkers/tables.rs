pub mod columns;
pub mod compound_unique_key_list;
pub mod connections;

use columns::Columns;
use compound_unique_key_list::CompoundUniqueKeyList;
use connections::Connections;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Indexes {}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct TableProperties {}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
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
    pub indexes: Indexes,
    pub compound_unique_key_list: CompoundUniqueKeyList,
    pub table_properties: TableProperties,
}
