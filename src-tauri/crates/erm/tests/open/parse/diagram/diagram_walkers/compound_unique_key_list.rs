use pretty_assertions::assert_eq;

use erm::dtos::diagram::diagram_walkers::tables::compound_unique_key_list;

use super::support;

#[test]
fn compound_unique_key_list_tags_keep_valid_values() {
    let table = support::first_table();

    assert_eq!(
        table.compound_unique_key_list,
        compound_unique_key_list::CompoundUniqueKeyList {
            compound_unique_keys: Some(vec![compound_unique_key_list::CompoundUniqueKey {
                name: "UK_MEMBERS_NAME".to_string(),
                columns: vec![
                    compound_unique_key_list::Column {
                        column_id: "MEMBER_NAME".to_string(),
                    },
                    compound_unique_key_list::Column {
                        column_id: "MEMBER_ID".to_string(),
                    },
                ],
            }]),
        }
    );
}

#[test]
fn missing_compound_unique_key_name_is_rejected() {
    support::assert_replaced_fixture_parse_error(
        "          <name>UK_MEMBERS_NAME</name>\n",
        "",
        "missing_compound_unique_key_name",
    );
}

#[test]
fn missing_compound_unique_key_columns_is_rejected() {
    support::assert_replaced_fixture_parse_error(
        "          <columns>\n            <column>\n              <column_id>MEMBER_NAME</column_id>\n            </column>\n            <column>\n              <column_id>MEMBER_ID</column_id>\n            </column>\n          </columns>",
        "",
        "missing_compound_unique_key_columns",
    );
}
