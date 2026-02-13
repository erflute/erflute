use crate::entities::diagram::vdiagrams::vtables as entities;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VTable {
    pub table_id: String,
    pub x: u16,
    pub y: u16,
    pub font_name: String,
    pub font_size: u16,
}

impl From<entities::VTable> for VTable {
    fn from(entity: entities::VTable) -> Self {
        Self {
            table_id: entity.table_id,
            x: entity.x,
            y: entity.y,
            font_name: entity.font_name,
            font_size: entity.font_size,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VTables {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vtables: Option<Vec<VTable>>,
}

impl From<entities::VTables> for VTables {
    fn from(entity: entities::VTables) -> Self {
        Self {
            vtables: entity
                .vtables
                .map(|v| v.into_iter().map(Into::into).collect()),
        }
    }
}
