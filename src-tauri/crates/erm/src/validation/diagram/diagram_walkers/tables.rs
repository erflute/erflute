use std::collections::HashSet;

use crate::dtos::diagram::diagram_walkers::tables::Table;
use crate::dtos::diagram::diagram_walkers::tables::columns::{ColumnItem, NormalColumn};
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

pub fn validate_primary_key_name_has_primary_key_column(
    table: &Table,
) -> Result<(), ValidationError> {
    if table.primary_key_name.is_none() {
        return Ok(());
    }

    if normal_columns(table).any(|(_, column)| column.primary_key == Some(true)) {
        return Ok(());
    }

    Err(ValidationError::new(
        "primary_key_name".to_string(),
        "primary_key_name requires at least one primary key column".to_string(),
    ))
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
        ));
    }

    Ok(())
}

pub fn validate_column_length_and_decimal(table: &Table) -> Result<(), ValidationError> {
    for (item_index, column) in normal_columns(table) {
        if let (Some(length), Some(decimal)) = (column.length, column.decimal) {
            if decimal > length {
                return Err(ValidationError::new(
                    format!("columns.normal_column[{item_index}].decimal"),
                    format!("decimal must be less than or equal to length: {decimal} > {length}"),
                ));
            }
        }

        let Some(column_type) = &column.column_type else {
            if column.length.is_some() {
                return Err(ValidationError::new(
                    format!("columns.normal_column[{item_index}].length"),
                    "length requires a column type that supports length".to_string(),
                ));
            }
            if column.decimal.is_some() {
                return Err(ValidationError::new(
                    format!("columns.normal_column[{item_index}].decimal"),
                    "decimal requires a column type that supports decimal".to_string(),
                ));
            }
            continue;
        };

        if column.length.is_some() && !supports_length(column_type) {
            return Err(ValidationError::new(
                format!("columns.normal_column[{item_index}].length"),
                format!("column type does not support length: {column_type}"),
            ));
        }

        if column.decimal.is_some() && !supports_decimal(column_type) {
            return Err(ValidationError::new(
                format!("columns.normal_column[{item_index}].decimal"),
                format!("column type does not support decimal: {column_type}"),
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

fn key_column_names(table: &Table) -> HashSet<&str> {
    let simple_key_names = normal_columns(table).filter_map(|(_, column)| {
        if column.unique_key == Some(true) {
            Some(column.physical_name.as_str())
        } else {
            None
        }
    });

    let index_column_names = table.indexes.iter().flat_map(|indexes| {
        indexes
            .iter()
            .flat_map(|index| index.columns.iter().map(|column| column.column_id.as_str()))
    });

    let compound_unique_key_column_names = table
        .compound_unique_key_list
        .compound_unique_keys
        .iter()
        .flat_map(|keys| {
            keys.iter()
                .flat_map(|key| key.columns.iter().map(|column| column.column_id.as_str()))
        });

    simple_key_names
        .chain(index_column_names)
        .chain(compound_unique_key_column_names)
        .collect()
}

fn supports_length(column_type: &str) -> bool {
    let column_type = column_type.to_ascii_lowercase();
    matches!(
        column_type.as_str(),
        "character(n)"
            | "varchar(n)"
            | "binary(n)"
            | "varbinary(n)"
            | "bit(n)"
            | "int(n)"
            | "tinyint(n)"
            | "smallint(n)"
            | "mediumint(n)"
            | "bigint(n)"
            | "decimal(p)"
            | "decimal(p,s)"
            | "numeric(p)"
            | "numeric(p,s)"
            | "float(p)"
            | "float(m,d)"
            | "double precision(m,d)"
            | "real(m,d)"
    )
}

fn supports_decimal(column_type: &str) -> bool {
    let column_type = column_type.to_ascii_lowercase();
    matches!(
        column_type.as_str(),
        "decimal(p,s)" | "numeric(p,s)" | "float(m,d)" | "double precision(m,d)" | "real(m,d)"
    )
}
