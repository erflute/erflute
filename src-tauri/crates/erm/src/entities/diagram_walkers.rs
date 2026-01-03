use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

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

#[derive(Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct NormalColumn {
    pub physical_name: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub logical_name: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[serde(rename = "type")]
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

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub enum ColumnItem {
    #[serde(rename = "normal_column")]
    Normal(NormalColumn),

    #[serde(rename = "column_group")]
    Group(String),
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Columns {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[serde(rename = "$value")]
    pub items: Option<Vec<ColumnItem>>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Indexes {}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Column {
    pub column_id: String,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct CompoundUniqueKey {
    pub name: String,
    pub columns: Vec<Column>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct CompoundUniqueKeyList {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[serde(rename = "compound_unique_key")]
    pub compound_unique_keys: Option<Vec<CompoundUniqueKey>>,
}

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

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct DiagramWalkers {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[serde(rename = "table")]
    pub tables: Option<Vec<Table>>,
}
