use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct DiagramSettings {
    // capital: bool,
    // notation_expand_group: bool,
    // table_style: String,
    pub database: String,
    // notation: String,
    // notation_level: u32,
    pub view_mode: u8,
}

// impl DiagramSetting {
//     pub fn database(&self) -> &str {
//         &self.database
//     }
// }
