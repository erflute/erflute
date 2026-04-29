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

pub fn validate_duplicate_index_names(table: &Table) -> Result<(), ValidationError> {
    let Some(indexes) = &table.indexes else {
        return Ok(());
    };

    let mut index_names = HashSet::new();

    for (index_index, index) in indexes.iter().enumerate() {
        if !index_names.insert(index.name.as_str()) {
            return Err(ValidationError::new(
                format!("indexes[{index_index}].name"),
                format!("duplicate index name: {}", index.name),
            ));
        }
    }

    Ok(())
}

pub fn validate_duplicate_compound_unique_key_names(table: &Table) -> Result<(), ValidationError> {
    let Some(compound_unique_keys) = &table.compound_unique_key_list.compound_unique_keys else {
        return Ok(());
    };

    let mut key_names = HashSet::new();

    for (key_index, key) in compound_unique_keys.iter().enumerate() {
        if !key_names.insert(key.name.as_str()) {
            return Err(ValidationError::new(
                format!("compound_unique_key_list.compound_unique_key[{key_index}].name"),
                format!("duplicate compound unique key name: {}", key.name),
            ));
        }
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
            if !column_names.contains(column.column_id.as_str()) {
                return Err(ValidationError::new(
                    format!("indexes[{index_index}].columns[{column_index}].column_id"),
                    format!("unknown index column_id: {}", column.column_id),
                ));
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
            if !column_names.contains(column.column_id.as_str()) {
                return Err(ValidationError::new(
                    format!(
                        "compound_unique_key_list.compound_unique_key[{key_index}].columns[{column_index}].column_id"
                    ),
                    format!(
                        "unknown compound unique key column_id: {}",
                        column.column_id
                    ),
                ));
            }
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
