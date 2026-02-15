pub mod vtables;

use crate::entities::diagram::vdiagrams as entities;
use serde::{Deserialize, Serialize};
use vtables::VTables;

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
pub struct WalkerNotes {}

impl From<entities::WalkerNotes> for WalkerNotes {
    fn from(_: entities::WalkerNotes) -> Self {
        Self {}
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WalkerGroups {}

impl From<entities::WalkerGroups> for WalkerGroups {
    fn from(_: entities::WalkerGroups) -> Self {
        Self {}
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VDiagram {
    pub vdiagram_name: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub color: Option<Color>,

    pub vtables: VTables,
    pub walker_notes: WalkerNotes,
    pub walker_groups: WalkerGroups,
}

impl From<entities::VDiagram> for VDiagram {
    fn from(entity: entities::VDiagram) -> Self {
        Self {
            vdiagram_name: entity.vdiagram_name,
            color: entity.color.map(Into::into),
            vtables: entity.vtables.into(),
            walker_notes: entity.walker_notes.into(),
            walker_groups: entity.walker_groups.into(),
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VDiagrams {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vdiagrams: Option<Vec<VDiagram>>,
}

impl From<entities::VDiagrams> for VDiagrams {
    fn from(entity: entities::VDiagrams) -> Self {
        Self {
            vdiagrams: entity
                .vdiagrams
                .map(|v| v.into_iter().map(Into::into).collect()),
        }
    }
}
