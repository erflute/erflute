use crate::entities::diagram::diagram_settings as entities;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagramSettings {
    pub database: String,
    pub view_mode: u8,
}

impl From<entities::DiagramSettings> for DiagramSettings {
    fn from(entity: entities::DiagramSettings) -> Self {
        Self {
            database: entity.database,
            view_mode: entity.view_mode,
        }
    }
}
