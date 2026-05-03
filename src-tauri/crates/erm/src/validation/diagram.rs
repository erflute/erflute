pub mod diagram_walkers;

use std::collections::{HashMap, HashSet};

use crate::column_type::ColumnType;
use crate::dtos::diagram::Diagram;
use crate::dtos::diagram::diagram_walkers::tables::columns::ColumnItem;
use crate::validation::ValidationError;

pub(crate) fn validate_column_length_and_decimal_values(
    column_type: Option<ColumnType>,
    length: Option<u16>,
    decimal: Option<u16>,
    length_path: String,
    decimal_path: String,
    targets: &[(&str, &str)],
) -> Result<(), ValidationError> {
    if let (Some(length), Some(decimal)) = (length, decimal) {
        if decimal > length {
            return Err(with_targets(
                ValidationError::new(
                    decimal_path,
                    format!("decimal must be less than or equal to length: {decimal} > {length}"),
                ),
                targets,
            ));
        }
    }

    let Some(column_type) = column_type else {
        if length.is_some() {
            return Err(with_targets(
                ValidationError::new(
                    length_path,
                    "length requires a column type that supports length".to_string(),
                ),
                targets,
            ));
        }
        if decimal.is_some() {
            return Err(with_targets(
                ValidationError::new(
                    decimal_path,
                    "decimal requires a column type that supports decimal".to_string(),
                ),
                targets,
            ));
        }
        return Ok(());
    };

    if length.is_some() && !column_type.supports_length() {
        return Err(with_targets(
            ValidationError::new(
                length_path,
                format!("column type does not support length: {column_type}"),
            ),
            targets,
        ));
    }

    if decimal.is_some() && !column_type.supports_decimal() {
        return Err(with_targets(
            ValidationError::new(
                decimal_path,
                format!("column type does not support decimal: {column_type}"),
            ),
            targets,
        ));
    }

    Ok(())
}

fn with_targets(mut error: ValidationError, targets: &[(&str, &str)]) -> ValidationError {
    for (label, value) in targets {
        error = error.with_target(*label, *value);
    }

    error
}

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
                )
                .with_target("table name", table.physical_name.as_str()));
            }
        }
    }

    Ok(())
}

pub fn validate_duplicate_column_group_names(diagram: &Diagram) -> Result<(), ValidationError> {
    let Some(column_groups) = &diagram.column_groups else {
        return Ok(());
    };

    let mut group_names = HashMap::new();

    for (group_index, group) in column_groups.iter().enumerate() {
        if group_names
            .insert(group.column_group_name.as_str(), group)
            .is_some()
        {
            return Err(ValidationError::new(
                format!("column_groups[{group_index}].column_group_name"),
                format!("duplicate column group name: {}", group.column_group_name),
            )
            .with_target("column group name", group.column_group_name.as_str()));
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

        let mut column_names = HashMap::new();

        for (column_index, column) in normal_columns.iter().enumerate() {
            if column_names
                .insert(column.physical_name.as_str(), column)
                .is_some()
            {
                return Err(ValidationError::new(
                    format!(
                        "column_groups[{group_index}].columns.normal_column[{column_index}].physical_name"
                    ),
                    format!(
                        "duplicate column group column physical_name: {}",
                        column.physical_name
                    ),
                )
                .with_target("column group name", group.column_group_name.as_str())
                .with_target("column name", column.physical_name.as_str()));
            }
        }
    }

    Ok(())
}

pub fn validate_column_group_column_length_and_decimal(
    diagram: &Diagram,
) -> Result<(), ValidationError> {
    let Some(column_groups) = &diagram.column_groups else {
        return Ok(());
    };

    for (group_index, group) in column_groups.iter().enumerate() {
        let Some(normal_columns) = &group.columns.normal_columns else {
            continue;
        };

        for (column_index, column) in normal_columns.iter().enumerate() {
            validate_column_length_and_decimal_values(
                Some(column.column_type),
                column.length,
                column.decimal,
                format!(
                    "column_groups[{group_index}].columns.normal_column[{column_index}].length"
                ),
                format!(
                    "column_groups[{group_index}].columns.normal_column[{column_index}].decimal"
                ),
                &[
                    ("column group name", group.column_group_name.as_str()),
                    ("column name", column.physical_name.as_str()),
                ],
            )?;
        }
    }

    Ok(())
}
