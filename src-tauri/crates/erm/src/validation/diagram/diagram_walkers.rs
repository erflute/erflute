pub mod tables;

use std::collections::{HashMap, HashSet};

use crate::dtos::diagram::diagram_walkers::DiagramWalkers;
use crate::dtos::diagram::diagram_walkers::tables::Table;
use crate::dtos::diagram::diagram_walkers::tables::columns::{ColumnItem, NormalColumn};
use crate::validation::ValidationError;

use tables::normal_column_names;

pub fn validate_duplicate_table_physical_names(
    diagram_walkers: &DiagramWalkers,
) -> Result<(), ValidationError> {
    let Some(tables) = &diagram_walkers.tables else {
        return Ok(());
    };

    let mut table_names = HashMap::new();

    for (table_index, table) in tables.iter().enumerate() {
        if table_names
            .insert(table.physical_name.as_str(), table)
            .is_some()
        {
            return Err(ValidationError::new(
                format!("table[{table_index}].physical_name"),
                format!("duplicate table physical_name: {}", table.physical_name),
            )
            .with_target("table name", table.physical_name.as_str()));
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

    let mut relationship_names = HashMap::new();

    for (table_index, table) in tables.iter().enumerate() {
        let Some(relationships) = &table.connections.relationships else {
            continue;
        };

        for (relationship_index, relationship) in relationships.iter().enumerate() {
            if relationship_names
                .insert(relationship.name.as_str(), relationship)
                .is_some()
            {
                return Err(ValidationError::new(
                    format!(
                        "table[{table_index}].connections.relationship[{relationship_index}].name"
                    ),
                    format!("duplicate relationship name: {}", relationship.name),
                )
                .with_target("table name", table.physical_name.as_str())
                .with_target("relationship name", relationship.name.as_str()));
            }
        }
    }

    Ok(())
}

pub fn validate_cross_table_references(
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

            let relationship = if let Some(relationship_name) = &column.relationship {
                if !relationship_names.contains(relationship_name.as_str()) {
                    return Err(ValidationError::new(
                        format!(
                            "table[{table_index}].columns.normal_column[{item_index}].relationship"
                        ),
                        format!("unknown relationship: {relationship_name}"),
                    )
                    .with_target("table name", table.physical_name.as_str())
                    .with_target("column name", column.physical_name.as_str()));
                }

                find_relationship(tables, relationship_name)
            } else {
                None
            };

            if let Some(referred_column) = &column.referred_column {
                let Some((referred_table_name, referred_column_name)) =
                    column_reference_names(referred_column)
                else {
                    return Err(ValidationError::new(
                        format!(
                            "table[{table_index}].columns.normal_column[{item_index}].referred_column"
                        ),
                        format!("invalid referred_column: {referred_column}"),
                    )
                    .with_target("table name", table.physical_name.as_str())
                    .with_target("column name", column.physical_name.as_str()));
                };

                let Some(referred_table) = find_table(tables, referred_table_name) else {
                    return Err(ValidationError::new(
                        format!(
                            "table[{table_index}].columns.normal_column[{item_index}].referred_column"
                        ),
                        format!("unknown referred column table: {referred_column}"),
                    )
                    .with_target("table name", table.physical_name.as_str())
                    .with_target("column name", column.physical_name.as_str()));
                };

                let referred_column_names = normal_column_names(referred_table);

                if !referred_column_names.contains(referred_column_name) {
                    return Err(ValidationError::new(
                        format!(
                            "table[{table_index}].columns.normal_column[{item_index}].referred_column"
                        ),
                        format!("unknown referred column: {referred_column}"),
                    )
                    .with_target("table name", table.physical_name.as_str())
                    .with_target("column name", column.physical_name.as_str()));
                }
            }

            if let Some(relationship) = relationship {
                // Invalid relationship sources are reported on the relationship itself below.
                let source_table_exists = table_reference_name(&relationship.source)
                    .is_some_and(|source_table_name| table_names.contains(source_table_name));

                if source_table_exists {
                    validate_relationship_column_source(
                        table.physical_name.as_str(),
                        table_index,
                        item_index,
                        column,
                        relationship.source.as_str(),
                    )?;
                }
            }
        }
    }

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
                )
                .with_target("table name", table.physical_name.as_str())
                .with_target("relationship name", relationship.name.as_str()));
            };

            let Some(target_table_name) = table_reference_name(&relationship.target) else {
                return Err(ValidationError::new(
                    format!(
                        "table[{table_index}].connections.relationship[{relationship_index}].target"
                    ),
                    format!("invalid relationship target: {}", relationship.target),
                )
                .with_target("table name", table.physical_name.as_str())
                .with_target("relationship name", relationship.name.as_str()));
            };

            let Some(source_table) = find_table(tables, source_table_name) else {
                return Err(ValidationError::new(
                    format!(
                        "table[{table_index}].connections.relationship[{relationship_index}].source"
                    ),
                    format!("unknown relationship source table: {}", relationship.source),
                )
                .with_target("table name", table.physical_name.as_str())
                .with_target("relationship name", relationship.name.as_str()));
            };

            if find_table(tables, target_table_name).is_none() {
                return Err(ValidationError::new(
                    format!(
                        "table[{table_index}].connections.relationship[{relationship_index}].target"
                    ),
                    format!("unknown relationship target table: {}", relationship.target),
                )
                .with_target("table name", table.physical_name.as_str())
                .with_target("relationship name", relationship.name.as_str()));
            }

            if let Some(column_reference) = &relationship.referred_simple_unique_column {
                let Some((_, referred_column_name)) = column_reference_names(column_reference)
                else {
                    return Err(ValidationError::new(
                        format!(
                            "table[{table_index}].connections.relationship[{relationship_index}].referred_simple_unique_column"
                        ),
                        format!("invalid referred simple unique column: {column_reference}"),
                    )
                    .with_target("table name", table.physical_name.as_str())
                    .with_target("relationship name", relationship.name.as_str()));
                };

                // Traditional ERM files may store the target table name in this reference.
                // Keep that compatible by validating only the column name for now.
                // See https://github.com/erflute/erflute-traditional/issues/70.

                let unique_column_names = unique_column_names(source_table);

                if !unique_column_names.contains(referred_column_name) {
                    return Err(ValidationError::new(
                        format!(
                            "table[{table_index}].connections.relationship[{relationship_index}].referred_simple_unique_column"
                        ),
                        format!("unknown referred simple unique column: {column_reference}"),
                    )
                    .with_target("table name", table.physical_name.as_str())
                    .with_target("relationship name", relationship.name.as_str())
                    .with_target("source table name", source_table.physical_name.as_str()));
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
                    )
                    .with_target("table name", table.physical_name.as_str())
                    .with_target("relationship name", relationship.name.as_str())
                    .with_target("source table name", source_table.physical_name.as_str()));
                }
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

fn find_relationship<'a>(
    tables: &'a [Table],
    relationship_name: &str,
) -> Option<&'a crate::dtos::diagram::diagram_walkers::tables::connections::Relationship> {
    tables
        .iter()
        .flat_map(|table| table.connections.relationships.iter().flatten())
        .find(|relationship| relationship.name == relationship_name)
}

fn find_table<'a>(tables: &'a [Table], table_name: &str) -> Option<&'a Table> {
    tables
        .iter()
        .find(|table| table.physical_name == table_name)
}

fn validate_relationship_column_source(
    table_name: &str,
    table_index: usize,
    item_index: usize,
    column: &NormalColumn,
    relationship_source: &str,
) -> Result<(), ValidationError> {
    let Some(referred_column) = &column.referred_column else {
        return Err(ValidationError::new(
            format!("table[{table_index}].columns.normal_column[{item_index}].referred_column"),
            format!(
                "relationship column requires referred_column: {}",
                column.physical_name
            ),
        )
        .with_target("table name", table_name)
        .with_target("column name", column.physical_name.as_str()));
    };

    let Some(source_table_name) = table_reference_name(relationship_source) else {
        return Ok(());
    };

    let Some((referred_table_name, _)) = column_reference_names(referred_column) else {
        return Ok(());
    };

    if referred_table_name != source_table_name {
        return Err(ValidationError::new(
            format!("table[{table_index}].columns.normal_column[{item_index}].referred_column"),
            format!("referred_column table must match relationship source: {referred_column}"),
        )
        .with_target("table name", table_name)
        .with_target("column name", column.physical_name.as_str()));
    }

    Ok(())
}
