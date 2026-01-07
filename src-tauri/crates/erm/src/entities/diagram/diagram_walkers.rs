pub mod tables;

use serde::{Deserialize, Serialize};
use tables::Table;

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct DiagramWalkers {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    #[serde(rename = "table")]
    pub tables: Option<Vec<Table>>,
}
