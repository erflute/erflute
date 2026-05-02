use std::collections::{HashMap, HashSet};

use crate::dtos::diagram::diagram_walkers::tables::Table;
use crate::dtos::diagram::diagram_walkers::tables::columns::{ColumnItem, NormalColumn};
use crate::validation::ValidationError;
use crate::validation::diagram::validate_column_length_and_decimal_values;

pub fn validate_duplicate_column_physical_names(table: &Table) -> Result<(), ValidationError> {
    let Some(items) = &table.columns.items else {
        return Ok(());
    };

    let mut column_names = HashMap::new();

    for (item_index, item) in items.iter().enumerate() {
        let ColumnItem::Normal(column) = item else {
            continue;
        };

        if column_names
            .insert(column.physical_name.as_str(), column)
            .is_some()
        {
            return Err(ValidationError::new(
                format!("columns.normal_column[{item_index}].physical_name"),
                format!("duplicate column physical_name: {}", column.physical_name),
            )
            .with_target("table name", table.physical_name.as_str())
            .with_target("column name", column.physical_name.as_str()));
        }
    }

    Ok(())
}

pub fn validate_duplicate_index_names(table: &Table) -> Result<(), ValidationError> {
    let Some(indexes) = &table.indexes else {
        return Ok(());
    };

    let mut index_names = HashMap::new();

    for (index_index, index) in indexes.iter().enumerate() {
        if index_names.insert(index.name.as_str(), index).is_some() {
            return Err(ValidationError::new(
                format!("indexes[{index_index}].name"),
                format!("duplicate index name: {}", index.name),
            )
            .with_target("table name", table.physical_name.as_str())
            .with_target("index name", index.name.as_str()));
        }
    }

    Ok(())
}

pub fn validate_duplicate_compound_unique_key_names(table: &Table) -> Result<(), ValidationError> {
    let Some(compound_unique_keys) = &table.compound_unique_key_list.compound_unique_keys else {
        return Ok(());
    };

    let mut key_names = HashMap::new();

    for (key_index, key) in compound_unique_keys.iter().enumerate() {
        if key_names.insert(key.name.as_str(), key).is_some() {
            return Err(ValidationError::new(
                format!("compound_unique_key_list.compound_unique_key[{key_index}].name"),
                format!("duplicate compound unique key name: {}", key.name),
            )
            .with_target("table name", table.physical_name.as_str())
            .with_target("compound unique key name", key.name.as_str()));
        }
    }

    Ok(())
}

pub fn validate_auto_increment_columns_are_key_columns(
    table: &Table,
) -> Result<(), ValidationError> {
    let key_column_names = key_column_names(table);

    for (item_index, column) in normal_columns(table) {
        if column.auto_increment != Some(true) {
            continue;
        }

        if column.primary_key == Some(true)
            || key_column_names.contains(column.physical_name.as_str())
        {
            continue;
        }

        return Err(ValidationError::new(
            format!("columns.normal_column[{item_index}].auto_increment"),
            format!(
                "auto_increment column must be a key column: {}",
                column.physical_name
            ),
        )
        .with_target("table name", table.physical_name.as_str())
        .with_target("column name", column.physical_name.as_str()));
    }

    Ok(())
}

pub fn validate_column_length_and_decimal(table: &Table) -> Result<(), ValidationError> {
    for (item_index, column) in normal_columns(table) {
        validate_column_length_and_decimal_values(
            column.column_type,
            column.length,
            column.decimal,
            format!("columns.normal_column[{item_index}].length"),
            format!("columns.normal_column[{item_index}].decimal"),
            &[
                ("table name", table.physical_name.as_str()),
                ("column name", column.physical_name.as_str()),
            ],
        )?;
    }

    Ok(())
}

pub fn validate_index_column_references(table: &Table) -> Result<(), ValidationError> {
    let Some(indexes) = &table.indexes else {
        return Ok(());
    };

    let column_names = normal_column_names(table);

    for (index_index, index) in indexes.iter().enumerate() {
        for (column_index, column) in index.columns.iter().enumerate() {
            if !column_reference_exists(table, &column_names, &column.column_id) {
                return Err(ValidationError::new(
                    format!("indexes[{index_index}].columns[{column_index}].column_id"),
                    format!("unknown index column_id: {}", column.column_id),
                )
                .with_target("table name", table.physical_name.as_str())
                .with_target("index name", index.name.as_str()));
            }
        }
    }

    Ok(())
}

pub fn validate_compound_unique_key_column_references(
    table: &Table,
) -> Result<(), ValidationError> {
    let Some(compound_unique_keys) = &table.compound_unique_key_list.compound_unique_keys else {
        return Ok(());
    };

    let column_names = normal_column_names(table);

    for (key_index, key) in compound_unique_keys.iter().enumerate() {
        for (column_index, column) in key.columns.iter().enumerate() {
            if !column_reference_exists(table, &column_names, &column.column_id) {
                return Err(ValidationError::new(
                    format!(
                        "compound_unique_key_list.compound_unique_key[{key_index}].columns[{column_index}].column_id"
                    ),
                    format!(
                        "unknown compound unique key column_id: {}",
                        column.column_id
                    ),
                )
                .with_target("table name", table.physical_name.as_str())
                .with_target("compound unique key name", key.name.as_str()));
            }
        }
    }

    Ok(())
}

pub fn validate_local_relationship_consistency(table: &Table) -> Result<(), ValidationError> {
    let Some(relationships) = &table.connections.relationships else {
        return Ok(());
    };

    for (relationship_index, relationship) in relationships.iter().enumerate() {
        if table_reference_name(&relationship.target)
            .is_some_and(|target_table_name| target_table_name != table.physical_name)
        {
            return Err(ValidationError::new(
                format!("connections.relationship[{relationship_index}].target"),
                format!(
                    "relationship target must match containing table: {}",
                    relationship.target
                ),
            )
            .with_target("table name", table.physical_name.as_str())
            .with_target("relationship name", relationship.name.as_str()));
        }

        if relationship.referred_simple_unique_column.is_some()
            && relationship.referred_compound_unique_key.is_some()
        {
            return Err(ValidationError::new(
                format!(
                    "connections.relationship[{relationship_index}].referred_simple_unique_column"
                ),
                "referred_simple_unique_column and referred_compound_unique_key cannot both be specified"
                    .to_string(),
            )
            .with_target("table name", table.physical_name.as_str())
            .with_target("relationship name", relationship.name.as_str()));
        }

        for (column_index, fk_column) in relationship.fk_columns.fk_column.iter().enumerate() {
            let Some((_, column)) = normal_column_by_name(table, &fk_column.fk_column_name) else {
                return Err(ValidationError::new(
                    format!(
                        "connections.relationship[{relationship_index}].fk_columns.fk_column[{column_index}].fk_column_name"
                    ),
                    format!(
                        "unknown relationship fk_column_name: {}",
                        fk_column.fk_column_name
                    ),
                )
                .with_target("table name", table.physical_name.as_str())
                .with_target("relationship name", relationship.name.as_str()));
            };

            if column.relationship.as_deref() != Some(relationship.name.as_str()) {
                return Err(ValidationError::new(
                    format!(
                        "connections.relationship[{relationship_index}].fk_columns.fk_column[{column_index}].fk_column_name"
                    ),
                    format!(
                        "fk column must reference relationship: {} -> {}",
                        fk_column.fk_column_name, relationship.name
                    ),
                )
                .with_target("table name", table.physical_name.as_str())
                .with_target("column name", column.physical_name.as_str())
                .with_target("relationship name", relationship.name.as_str()));
            }
        }
    }

    for (item_index, column) in normal_columns(table) {
        let Some(relationship_name) = &column.relationship else {
            continue;
        };

        let Some(relationship) = find_relationship(table, relationship_name) else {
            continue;
        };

        if !relationship
            .fk_columns
            .fk_column
            .iter()
            .any(|fk_column| fk_column.fk_column_name == column.physical_name)
        {
            return Err(ValidationError::new(
                format!("columns.normal_column[{item_index}].relationship"),
                format!(
                    "relationship does not contain fk column: {} -> {}",
                    relationship_name, column.physical_name
                ),
            )
            .with_target("table name", table.physical_name.as_str())
            .with_target("column name", column.physical_name.as_str())
            .with_target("relationship name", relationship.name.as_str()));
        }
    }

    Ok(())
}

pub(super) fn normal_column_names(table: &Table) -> HashSet<&str> {
    let Some(items) = &table.columns.items else {
        return HashSet::new();
    };

    items
        .iter()
        .filter_map(|item| match item {
            ColumnItem::Normal(column) => Some(column.physical_name.as_str()),
            ColumnItem::Group(_) => None,
        })
        .collect()
}

fn column_reference_exists(table: &Table, column_names: &HashSet<&str>, column_id: &str) -> bool {
    let Some(column_name) = column_reference_column_name(table, column_id) else {
        return false;
    };

    column_names.contains(column_name)
}

fn column_reference_column_name<'a>(table: &Table, column_id: &'a str) -> Option<&'a str> {
    if let Some(reference) = column_id.strip_prefix("table.") {
        let (table_name, column_name) = reference.split_once('.')?;

        if table_name == table.physical_name {
            return Some(column_name);
        }

        return None;
    }

    Some(column_id)
}

fn normal_columns(table: &Table) -> impl Iterator<Item = (usize, &NormalColumn)> {
    table
        .columns
        .items
        .iter()
        .flat_map(|items| items.iter().enumerate())
        .filter_map(|(index, item)| match item {
            ColumnItem::Normal(column) => Some((index, column)),
            ColumnItem::Group(_) => None,
        })
}

fn normal_column_by_name<'a>(
    table: &'a Table,
    column_name: &str,
) -> Option<(usize, &'a NormalColumn)> {
    normal_columns(table).find(|(_, column)| column.physical_name == column_name)
}

fn find_relationship<'a>(
    table: &'a Table,
    relationship_name: &str,
) -> Option<&'a crate::dtos::diagram::diagram_walkers::tables::connections::Relationship> {
    table
        .connections
        .relationships
        .iter()
        .flatten()
        .find(|relationship| relationship.name == relationship_name)
}

fn table_reference_name(reference: &str) -> Option<&str> {
    reference.strip_prefix("table.")
}

fn key_column_names(table: &Table) -> HashSet<String> {
    let simple_key_names = normal_columns(table).filter_map(|(_, column)| {
        if column.unique_key == Some(true) {
            Some(column.physical_name.to_string())
        } else {
            None
        }
    });

    let index_column_names = table.indexes.iter().flat_map(|indexes| {
        indexes.iter().flat_map(|index| {
            index.columns.iter().filter_map(|column| {
                column_reference_column_name(table, &column.column_id).map(str::to_string)
            })
        })
    });

    let compound_unique_key_column_names = table
        .compound_unique_key_list
        .compound_unique_keys
        .iter()
        .flat_map(|keys| {
            keys.iter().flat_map(|key| {
                key.columns.iter().filter_map(|column| {
                    column_reference_column_name(table, &column.column_id).map(str::to_string)
                })
            })
        });

    simple_key_names
        .chain(index_column_names)
        .chain(compound_unique_key_column_names)
        .collect()
}
