use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl From<crate::entities::diagram_walkers::Color> for Color {
    fn from(entity: crate::entities::diagram_walkers::Color) -> Self {
        Self {
            r: entity.r,
            g: entity.g,
            b: entity.b,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FkColumn {
    pub fk_column_name: String,
}

impl From<crate::entities::diagram_walkers::FkColumn> for FkColumn {
    fn from(entity: crate::entities::diagram_walkers::FkColumn) -> Self {
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

impl From<crate::entities::diagram_walkers::FkColumns> for FkColumns {
    fn from(entity: crate::entities::diagram_walkers::FkColumns) -> Self {
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

impl From<crate::entities::diagram_walkers::Relationship> for Relationship {
    fn from(entity: crate::entities::diagram_walkers::Relationship) -> Self {
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

impl From<crate::entities::diagram_walkers::Connections> for Connections {
    fn from(entity: crate::entities::diagram_walkers::Connections) -> Self {
        Self {
            relationships: entity
                .relationships
                .map(|v| v.into_iter().map(Into::into).collect()),
        }
    }
}

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

impl From<crate::entities::diagram_walkers::NormalColumn> for NormalColumn {
    fn from(entity: crate::entities::diagram_walkers::NormalColumn) -> Self {
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

impl From<crate::entities::diagram_walkers::Columns> for Columns {
    fn from(entity: crate::entities::diagram_walkers::Columns) -> Self {
        Self {
            items: entity.items.map(|v| {
                v.into_iter()
                    .map(|item| match item {
                        crate::entities::diagram_walkers::ColumnItem::Normal(column) => {
                            ColumnItem::Normal(column.into())
                        }
                        crate::entities::diagram_walkers::ColumnItem::Group(column) => {
                            ColumnItem::Group(column)
                        }
                    })
                    .collect()
            }),
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Column {
    pub column_id: String,
}

impl From<crate::entities::diagram_walkers::Column> for Column {
    fn from(entity: crate::entities::diagram_walkers::Column) -> Self {
        Self {
            column_id: entity.column_id,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct CompoundUniqueKey {
    pub name: String,
    pub columns: Vec<Column>,
}

impl From<crate::entities::diagram_walkers::CompoundUniqueKey> for CompoundUniqueKey {
    fn from(entity: crate::entities::diagram_walkers::CompoundUniqueKey) -> Self {
        Self {
            name: entity.name,
            columns: entity.columns.into_iter().map(Into::into).collect(),
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct CompoundUniqueKeyList {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub compound_unique_keys: Option<Vec<CompoundUniqueKey>>,
}

impl From<crate::entities::diagram_walkers::CompoundUniqueKeyList> for CompoundUniqueKeyList {
    fn from(entity: crate::entities::diagram_walkers::CompoundUniqueKeyList) -> Self {
        Self {
            compound_unique_keys: entity
                .compound_unique_keys
                .map(|v| v.into_iter().map(Into::into).collect()),
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

impl From<crate::entities::diagram_walkers::Table> for Table {
    fn from(entity: crate::entities::diagram_walkers::Table) -> Self {
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

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagramWalkers {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tables: Option<Vec<Table>>,
}

impl From<crate::entities::diagram_walkers::DiagramWalkers> for DiagramWalkers {
    fn from(entity: crate::entities::diagram_walkers::DiagramWalkers) -> Self {
        Self {
            tables: entity
                .tables
                .map(|v| v.into_iter().map(Into::into).collect()),
        }
    }
}
