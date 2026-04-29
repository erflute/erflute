pub mod tables;

use std::collections::HashSet;

use crate::dtos::diagram::diagram_walkers::DiagramWalkers;
use crate::dtos::diagram::diagram_walkers::tables::Table;
use crate::dtos::diagram::diagram_walkers::tables::columns::ColumnItem;
use crate::validation::ValidationError;

use tables::normal_column_names;

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

pub fn validate_duplicate_relationship_names(
    diagram_walkers: &DiagramWalkers,
) -> Result<(), ValidationError> {
    let Some(tables) = &diagram_walkers.tables else {
        return Ok(());
    };

    let mut relationship_names = HashSet::new();

    for (table_index, table) in tables.iter().enumerate() {
        let Some(relationships) = &table.connections.relationships else {
            continue;
        };

        for (relationship_index, relationship) in relationships.iter().enumerate() {
            if !relationship_names.insert(relationship.name.as_str()) {
                return Err(ValidationError::new(
                    format!(
                        "table[{table_index}].connections.relationship[{relationship_index}].name"
                    ),
                    format!("duplicate relationship name: {}", relationship.name),
                ));
            }
        }
    }

    Ok(())
}

pub fn validate_relationship_references(
    diagram_walkers: &DiagramWalkers,
) -> Result<(), ValidationError> {
    let Some(tables) = &diagram_walkers.tables else {
        return Ok(());
    };

    let table_names = tables
        .iter()
        .map(|table| table.physical_name.as_str())
        .collect::<HashSet<_>>();

    for (table_index, table) in tables.iter().enumerate() {
        let Some(relationships) = &table.connections.relationships else {
            continue;
        };

        for (relationship_index, relationship) in relationships.iter().enumerate() {
            let Some(source_table_name) = table_reference_name(&relationship.source) else {
                return Err(ValidationError::new(
                    format!(
                        "table[{table_index}].connections.relationship[{relationship_index}].source"
                    ),
                    format!("invalid relationship source: {}", relationship.source),
                ));
            };

            let Some(target_table_name) = table_reference_name(&relationship.target) else {
                return Err(ValidationError::new(
                    format!(
                        "table[{table_index}].connections.relationship[{relationship_index}].target"
                    ),
                    format!("invalid relationship target: {}", relationship.target),
                ));
            };

            if !table_names.contains(source_table_name) {
                return Err(ValidationError::new(
                    format!(
                        "table[{table_index}].connections.relationship[{relationship_index}].source"
                    ),
                    format!("unknown relationship source table: {}", relationship.source),
                ));
            }

            if !table_names.contains(target_table_name) {
                return Err(ValidationError::new(
                    format!(
                        "table[{table_index}].connections.relationship[{relationship_index}].target"
                    ),
                    format!("unknown relationship target table: {}", relationship.target),
                ));
            }

            if target_table_name != table.physical_name {
                return Err(ValidationError::new(
                    format!(
                        "table[{table_index}].connections.relationship[{relationship_index}].target"
                    ),
                    format!(
                        "relationship target must match containing table: {}",
                        relationship.target
                    ),
                ));
            }

            if relationship.referred_simple_unique_column.is_some()
                && relationship.referred_compound_unique_key.is_some()
            {
                return Err(ValidationError::new(
                    format!(
                        "table[{table_index}].connections.relationship[{relationship_index}].referred_simple_unique_column"
                    ),
                    "referred_simple_unique_column and referred_compound_unique_key cannot both be specified".to_string(),
                ));
            }

            let Some(source_table) = tables
                .iter()
                .find(|table| table.physical_name == source_table_name)
            else {
                continue;
            };

            let target_column_names = normal_column_names(table);

            for (column_index, column) in relationship.fk_columns.fk_column.iter().enumerate() {
                if !target_column_names.contains(column.fk_column_name.as_str()) {
                    return Err(ValidationError::new(
                        format!(
                            "table[{table_index}].connections.relationship[{relationship_index}].fk_columns.fk_column[{column_index}].fk_column_name"
                        ),
                        format!(
                            "unknown relationship fk_column_name: {}",
                            column.fk_column_name
                        ),
                    ));
                }
            }

            if let Some(column_reference) = &relationship.referred_simple_unique_column {
                let Some((referred_table_name, referred_column_name)) =
                    column_reference_names(column_reference)
                else {
                    return Err(ValidationError::new(
                        format!(
                            "table[{table_index}].connections.relationship[{relationship_index}].referred_simple_unique_column"
                        ),
                        format!("invalid referred simple unique column: {column_reference}"),
                    ));
                };

                if referred_table_name != source_table_name {
                    return Err(ValidationError::new(
                        format!(
                            "table[{table_index}].connections.relationship[{relationship_index}].referred_simple_unique_column"
                        ),
                        format!(
                            "referred simple unique column table must match relationship source: {column_reference}"
                        ),
                    ));
                }

                let unique_column_names = unique_column_names(source_table);

                if !unique_column_names.contains(referred_column_name) {
                    return Err(ValidationError::new(
                        format!(
                            "table[{table_index}].connections.relationship[{relationship_index}].referred_simple_unique_column"
                        ),
                        format!("unknown referred simple unique column: {column_reference}"),
                    ));
                }
            }

            if let Some(key_name) = &relationship.referred_compound_unique_key {
                let compound_unique_key_names = compound_unique_key_names(source_table);

                if !compound_unique_key_names.contains(key_name.as_str()) {
                    return Err(ValidationError::new(
                        format!(
                            "table[{table_index}].connections.relationship[{relationship_index}].referred_compound_unique_key"
                        ),
                        format!("unknown referred compound unique key: {key_name}"),
                    ));
                }
            }
        }
    }

    Ok(())
}

pub fn validate_normal_column_references(
    diagram_walkers: &DiagramWalkers,
) -> Result<(), ValidationError> {
    let Some(tables) = &diagram_walkers.tables else {
        return Ok(());
    };

    let table_names = tables
        .iter()
        .map(|table| table.physical_name.as_str())
        .collect::<HashSet<_>>();
    let relationship_names = tables
        .iter()
        .flat_map(|table| table.connections.relationships.iter().flatten())
        .map(|relationship| relationship.name.as_str())
        .collect::<HashSet<_>>();

    for (table_index, table) in tables.iter().enumerate() {
        let Some(items) = &table.columns.items else {
            continue;
        };

        for (item_index, item) in items.iter().enumerate() {
            let ColumnItem::Normal(column) = item else {
                continue;
            };

            if let Some(relationship_name) = &column.relationship {
                if !relationship_names.contains(relationship_name.as_str()) {
                    return Err(ValidationError::new(
                        format!(
                            "table[{table_index}].columns.normal_column[{item_index}].relationship"
                        ),
                        format!("unknown relationship: {relationship_name}"),
                    ));
                }
            }

            let Some(referred_column) = &column.referred_column else {
                continue;
            };

            let Some((referred_table_name, referred_column_name)) =
                column_reference_names(referred_column)
            else {
                return Err(ValidationError::new(
                    format!(
                        "table[{table_index}].columns.normal_column[{item_index}].referred_column"
                    ),
                    format!("invalid referred_column: {referred_column}"),
                ));
            };

            if !table_names.contains(referred_table_name) {
                return Err(ValidationError::new(
                    format!(
                        "table[{table_index}].columns.normal_column[{item_index}].referred_column"
                    ),
                    format!("unknown referred column table: {referred_column}"),
                ));
            }

            let Some(referred_table) = tables
                .iter()
                .find(|table| table.physical_name == referred_table_name)
            else {
                continue;
            };

            let referred_column_names = normal_column_names(referred_table);

            if !referred_column_names.contains(referred_column_name) {
                return Err(ValidationError::new(
                    format!(
                        "table[{table_index}].columns.normal_column[{item_index}].referred_column"
                    ),
                    format!("unknown referred column: {referred_column}"),
                ));
            }
        }
    }

    Ok(())
}

fn table_reference_name(reference: &str) -> Option<&str> {
    reference.strip_prefix("table.")
}

fn column_reference_names(reference: &str) -> Option<(&str, &str)> {
    let reference = reference.strip_prefix("table.")?;
    reference.split_once('.')
}

fn unique_column_names(table: &Table) -> HashSet<&str> {
    let Some(items) = &table.columns.items else {
        return HashSet::new();
    };

    items
        .iter()
        .filter_map(|item| match item {
            ColumnItem::Normal(column) if column.unique_key == Some(true) => {
                Some(column.physical_name.as_str())
            }
            _ => None,
        })
        .collect()
}

fn compound_unique_key_names(table: &Table) -> HashSet<&str> {
    let Some(compound_unique_keys) = &table.compound_unique_key_list.compound_unique_keys else {
        return HashSet::new();
    };

    compound_unique_keys
        .iter()
        .map(|key| key.name.as_str())
        .collect()
}
