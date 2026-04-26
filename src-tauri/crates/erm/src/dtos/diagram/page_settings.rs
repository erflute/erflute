use crate::entities::diagram::page_settings as entities;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PageSettings {
    pub direction_horizontal: bool,
    pub scale: i64,
    pub paper_size: String,
    pub top_margin: i64,
    pub left_margin: i64,
    pub bottom_margin: i64,
    pub right_margin: i64,
}

impl From<entities::PageSettings> for PageSettings {
    fn from(entity: entities::PageSettings) -> Self {
        Self {
            direction_horizontal: entity.direction_horizontal,
            scale: entity.scale,
            paper_size: entity.paper_size,
            top_margin: entity.top_margin,
            left_margin: entity.left_margin,
            bottom_margin: entity.bottom_margin,
            right_margin: entity.right_margin,
        }
    }
}
