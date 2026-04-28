pub mod diagram_walkers;

use std::collections::HashSet;

use crate::dtos::diagram::Diagram;
use crate::dtos::diagram::diagram_walkers::tables::columns::ColumnItem;
use crate::validation::ValidationError;

pub fn validate_column_group_references(diagram: &Diagram) -> Result<(), ValidationError> {
    let Some(diagram_walkers) = &diagram.diagram_walkers else {
        return Ok(());
    };

    let Some(tables) = &diagram_walkers.tables else {
        return Ok(());
    };

    let column_group_names = diagram
        .column_groups
        .as_ref()
        .map(|column_groups| {
            column_groups
                .iter()
                .map(|group| group.column_group_name.as_str())
                .collect::<HashSet<_>>()
        })
        .unwrap_or_default();

    for (table_index, table) in tables.iter().enumerate() {
        let Some(items) = &table.columns.items else {
            continue;
        };

        for (item_index, item) in items.iter().enumerate() {
            let ColumnItem::Group(column_group_name) = item else {
                continue;
            };

            if !column_group_names.contains(column_group_name.as_str()) {
                return Err(ValidationError::new(
                    format!(
                        "diagram_walkers.table[{table_index}].columns.column_group[{item_index}]"
                    ),
                    format!("unknown column group: {column_group_name}"),
                ));
            }
        }
    }

    Ok(())
}
