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

pub fn validate_duplicate_column_group_names(diagram: &Diagram) -> Result<(), ValidationError> {
    let Some(column_groups) = &diagram.column_groups else {
        return Ok(());
    };

    let mut group_names = HashSet::new();

    for (group_index, group) in column_groups.iter().enumerate() {
        if !group_names.insert(group.column_group_name.as_str()) {
            return Err(ValidationError::new(
                format!("column_groups[{group_index}].column_group_name"),
                format!("duplicate column group name: {}", group.column_group_name),
            ));
        }
    }

    Ok(())
}

pub fn validate_duplicate_column_group_column_physical_names(
    diagram: &Diagram,
) -> Result<(), ValidationError> {
    let Some(column_groups) = &diagram.column_groups else {
        return Ok(());
    };

    for (group_index, group) in column_groups.iter().enumerate() {
        let Some(normal_columns) = &group.columns.normal_columns else {
            continue;
        };

        let mut column_names = HashSet::new();

        for (column_index, column) in normal_columns.iter().enumerate() {
            if !column_names.insert(column.physical_name.as_str()) {
                return Err(ValidationError::new(
                    format!(
                        "column_groups[{group_index}].columns.normal_column[{column_index}].physical_name"
                    ),
                    format!(
                        "duplicate column group column physical_name: {}",
                        column.physical_name
                    ),
                ));
            }
        }
    }

    Ok(())
}
