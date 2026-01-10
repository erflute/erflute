pub mod tables;

use crate::entities::diagram::diagram_walkers as entities;
use serde::{Deserialize, Serialize};
use tables::Table;

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagramWalkers {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tables: Option<Vec<Table>>,
}

impl From<entities::DiagramWalkers> for DiagramWalkers {
    fn from(entity: entities::DiagramWalkers) -> Self {
        Self {
            tables: entity
                .tables
                .map(|v| v.into_iter().map(Into::into).collect()),
        }
    }
}
