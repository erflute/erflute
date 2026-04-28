pub mod tables;

use std::collections::HashSet;

use crate::dtos::diagram::diagram_walkers::DiagramWalkers;
use crate::validation::ValidationError;

pub fn validate_duplicate_table_physical_names(
    diagram_walkers: &DiagramWalkers,
) -> Result<(), ValidationError> {
    let Some(tables) = &diagram_walkers.tables else {
        return Ok(());
    };

    let mut table_names = HashSet::new();

    for (table_index, table) in tables.iter().enumerate() {
        if !table_names.insert(table.physical_name.as_str()) {
            return Err(ValidationError::new(
                format!("table[{table_index}].physical_name"),
                format!("duplicate table physical_name: {}", table.physical_name),
            ));
        }
    }

    Ok(())
}
