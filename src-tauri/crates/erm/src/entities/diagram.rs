pub mod column_groups;
pub mod diagram_settings;
pub mod diagram_walkers;

use column_groups::ColumnGroups;
use diagram_settings::DiagramSettings;
use diagram_walkers::DiagramWalkers;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Diagram {
    pub diagram_settings: DiagramSettings,
    pub diagram_walkers: DiagramWalkers,
    pub column_groups: ColumnGroups,
}
