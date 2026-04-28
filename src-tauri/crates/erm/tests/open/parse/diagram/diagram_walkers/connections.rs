use pretty_assertions::assert_eq;

use erm::dtos::diagram::diagram_walkers::tables::connections;

use super::support;

#[test]
fn connections_tags_keep_valid_values() {
    let table = support::first_table();

    assert_eq!(
        table.connections,
        connections::Connections {
            relationships: Some(vec![connections::Relationship {
                name: "FK_MEMBERS_PARENT".to_string(),
                source: "table.PARENT_MEMBERS".to_string(),
                target: "table.MEMBERS".to_string(),
                bendpoints: Some(vec![connections::Bendpoint {
                    relative: true,
                    x: 11,
                    y: 12,
                }]),
                fk_columns: connections::FkColumns {
                    fk_column: vec![connections::FkColumn {
                        fk_column_name: "PARENT_MEMBER_ID".to_string(),
                    }],
                },
                parent_cardinality: "0..1".to_string(),
                child_cardinality: "0..n".to_string(),
                reference_for_pk: false,
                on_delete_action: Some("CASCADE".to_string()),
                on_update_action: Some("RESTRICT".to_string()),
                referred_simple_unique_column: Some("PARENT_MEMBER_CODE".to_string()),
                referred_compound_unique_key: Some("UK_PARENT_MEMBERS_CODE".to_string()),
            }]),
        }
    );
}

#[test]
fn bendpoint_relative_rejects_invalid_value_type() {
    support::assert_replaced_fixture_parse_error(
        "<relative>true</relative>",
        "<relative>yes</relative>",
        "bendpoint_relative",
    );
}

#[test]
fn bendpoint_x_rejects_invalid_value_type() {
    support::assert_replaced_fixture_parse_error("<x>11</x>", "<x>left</x>", "bendpoint_x");
}

#[test]
fn bendpoint_y_rejects_invalid_value_type() {
    support::assert_replaced_fixture_parse_error("<y>12</y>", "<y>top</y>", "bendpoint_y");
}

#[test]
fn reference_for_pk_rejects_invalid_value_type() {
    support::assert_replaced_fixture_parse_error(
        "<reference_for_pk>false</reference_for_pk>",
        "<reference_for_pk>no</reference_for_pk>",
        "reference_for_pk",
    );
}

#[test]
fn parent_cardinality_accepts_enumerated_values() {
    support::assert_replaced_fixture_parse_success(
        "<parent_cardinality>0..1</parent_cardinality>",
        "<parent_cardinality>1</parent_cardinality>",
        "parent_cardinality_one",
    );
}

#[test]
fn parent_cardinality_rejects_non_enumerated_value() {
    support::assert_replaced_fixture_parse_error(
        "<parent_cardinality>0..1</parent_cardinality>",
        "<parent_cardinality>0..n</parent_cardinality>",
        "parent_cardinality",
    );
}

#[test]
fn child_cardinality_accepts_enumerated_values() {
    for (cardinality, test_name) in [
        ("1..n", "child_cardinality_one_or_more"),
        ("1", "child_cardinality_one"),
        ("0..1", "child_cardinality_zero_or_one"),
    ] {
        support::assert_replaced_fixture_parse_success(
            "<child_cardinality>0..n</child_cardinality>",
            &format!("<child_cardinality>{cardinality}</child_cardinality>"),
            test_name,
        );
    }
}

#[test]
fn child_cardinality_rejects_non_enumerated_value() {
    support::assert_replaced_fixture_parse_error(
        "<child_cardinality>0..n</child_cardinality>",
        "<child_cardinality>many</child_cardinality>",
        "child_cardinality",
    );
}

#[test]
fn on_delete_action_accepts_enumerated_values() {
    for (action, test_name) in [
        ("RESTRICT", "on_delete_action_restrict"),
        ("SET NULL", "on_delete_action_set_null"),
        ("SET DEFAULT", "on_delete_action_set_default"),
        ("", "on_delete_action_no_action"),
    ] {
        support::assert_replaced_fixture_parse_success(
            "<on_delete_action>CASCADE</on_delete_action>",
            &format!("<on_delete_action>{action}</on_delete_action>"),
            test_name,
        );
    }
}

#[test]
fn on_delete_action_rejects_non_enumerated_value() {
    support::assert_replaced_fixture_parse_error(
        "<on_delete_action>CASCADE</on_delete_action>",
        "<on_delete_action>NO ACTION</on_delete_action>",
        "on_delete_action",
    );
}

#[test]
fn on_update_action_accepts_enumerated_values() {
    for (action, test_name) in [
        ("CASCADE", "on_update_action_cascade"),
        ("SET NULL", "on_update_action_set_null"),
        ("SET DEFAULT", "on_update_action_set_default"),
        ("", "on_update_action_no_action"),
    ] {
        support::assert_replaced_fixture_parse_success(
            "<on_update_action>RESTRICT</on_update_action>",
            &format!("<on_update_action>{action}</on_update_action>"),
            test_name,
        );
    }
}

#[test]
fn on_update_action_rejects_non_enumerated_value() {
    support::assert_replaced_fixture_parse_error(
        "<on_update_action>RESTRICT</on_update_action>",
        "<on_update_action>NO ACTION</on_update_action>",
        "on_update_action",
    );
}
