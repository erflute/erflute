pub mod column_groups;
pub mod diagram_settings;
pub mod diagram_walkers;

use column_groups::ColumnGroups;
use diagram_settings::DiagramSettings;
use diagram_walkers::DiagramWalkers;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Diagram {
    pub diagram_settings: DiagramSettings,
    pub diagram_walkers: DiagramWalkers,
    pub column_groups: ColumnGroups,
}

impl From<crate::entities::diagram::Diagram> for Diagram {
    fn from(entity: crate::entities::diagram::Diagram) -> Self {
        Self {
            diagram_settings: entity.diagram_settings.into(),
            diagram_walkers: entity.diagram_walkers.into(),
            column_groups: entity.column_groups.into(),
        }
    }
}
