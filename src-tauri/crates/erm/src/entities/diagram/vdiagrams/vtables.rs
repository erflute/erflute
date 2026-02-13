use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct VTable {
    pub table_id: String,
    pub x: u16,
    pub y: u16,
    pub font_name: String,
    pub font_size: u16,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct VTables {
    #[serde(rename = "vtable")]
    pub vtables: Vec<VTable>,
}
