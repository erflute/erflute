pub mod tables;

use crate::entities::diagram::diagram_walkers as entities;
use crate::validation::Validate;
use crate::validation::diagram::diagram_walkers::{
    validate_cross_table_references, validate_duplicate_relationship_names,
    validate_duplicate_table_physical_names,
};
use serde::{Deserialize, Serialize};
use tables::Table;

#[derive(Debug, PartialEq, Serialize, Deserialize, Validate)]
#[validate(rules(
    validate_duplicate_table_physical_names,
    validate_duplicate_relationship_names,
    validate_cross_table_references
))]
#[serde(rename_all = "camelCase")]
pub struct DiagramWalkers {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[validate(path = "table")]
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
