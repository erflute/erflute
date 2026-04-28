use std::collections::HashSet;

use crate::dtos::diagram::diagram_walkers::tables::Table;
use crate::dtos::diagram::diagram_walkers::tables::columns::ColumnItem;
use crate::validation::ValidationError;

pub fn validate_duplicate_column_physical_names(table: &Table) -> Result<(), ValidationError> {
    let Some(items) = &table.columns.items else {
        return Ok(());
    };

    let mut column_names = HashSet::new();

    for (item_index, item) in items.iter().enumerate() {
        let ColumnItem::Normal(column) = item else {
            continue;
        };

        if !column_names.insert(column.physical_name.as_str()) {
            return Err(ValidationError::new(
                format!("columns.normal_column[{item_index}].physical_name"),
                format!("duplicate column physical_name: {}", column.physical_name),
            ));
        }
    }

    Ok(())
}
