pub mod vtables;

use serde::{Deserialize, Serialize};
use vtables::VTables;

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct WalkerNotes {}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct WalkerGroups {}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct VDiagram {
    pub vdiagram_name: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub color: Option<Color>,

    pub vtables: VTables,
    pub walker_notes: WalkerNotes,
    pub walker_groups: WalkerGroups,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct VDiagrams {
    #[serde(rename = "vdiagram")]
    pub vdiagrams: Vec<VDiagram>,
}
