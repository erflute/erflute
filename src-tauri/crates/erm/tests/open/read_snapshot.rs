use pretty_assertions::assert_eq;

use erm::dtos::diagram;
use erm::dtos::diagram::column_groups;
use erm::dtos::diagram::diagram_settings;
use erm::dtos::diagram::diagram_walkers;
use erm::dtos::diagram::diagram_walkers::tables;
use erm::dtos::diagram::diagram_walkers::tables::columns;
use erm::dtos::diagram::diagram_walkers::tables::compound_unique_key_list;
use erm::dtos::diagram::diagram_walkers::tables::connections;
use erm::dtos::diagram::page_settings;
use erm::open;

// TODO: Add test cases of detailed condition for each field in https://github.com/s-kai273/erflute/issues/22

#[test]
fn test_read_snapshot() {
    let diagram = open("./tests/open/fixtures/read_snapshot.erm").expect("failed to parse");
    assert_eq!(
        diagram,
        diagram::Diagram {
            presenter: Some("ERFlute".to_string()),
            page_settings: Some(page_settings::PageSettings {
                direction_horizontal: true,
                scale: 100,
                paper_size: "A4 210 x 297 mm".to_string(),
                top_margin: 30,
                left_margin: 30,
                bottom_margin: 30,
                right_margin: 30,
            }),
            category_index: None,
            current_ermodel: None,
            zoom: None,
            x: None,
            y: None,
            default_color: None,
            color: Some(diagram::Color {
                r: 255,
                g: 255,
                b: 255,
            }),
            font_name: Some("".to_string()),
            font_size: Some(9),
            diagram_settings: diagram_settings::DiagramSettings {
                database: "MySQL".to_string(),
                capital: true,
                table_style: "".to_string(),
                notation: "".to_string(),
                notation_level: 0,
                notation_expand_group: true,
                view_mode: 1,
                outline_view_mode: 1,
                view_order_by: 1,
                auto_ime_change: false,
                validate_physical_name: true,
                use_bezier_curve: false,
                suspend_validator: false,
                title_font_em: Some(1.5),
                master_data_base_path: Some("".to_string()),
                use_view_object: false,
                export_settings: diagram_settings::ExportSettings {},
                category_settings: diagram_settings::CategorySettings {},
                model_properties: diagram_settings::ModelProperties {},
                table_properties: diagram_settings::TableProperties {},
                environment_settings: Some(diagram_settings::EnvironmentSettings {}),
                design_settings: None,
            },
            diagram_walkers: Some(diagram_walkers::DiagramWalkers {
                tables: Some(vec![
                    tables::Table {
                        physical_name: "MEMBERS".to_string(),
                        logical_name: "会員".to_string(),
                        description: "".to_string(),
                        height: Some(108),
                        width: Some(194),
                        font_name: "Ubuntu".to_string(),
                        font_size: 9,
                        x: 160,
                        y: 106,
                        color: tables::Color {
                            r: 128,
                            g: 128,
                            b: 192,
                        },
                        connections: connections::Connections {
                            relationships: None,
                        },
                        table_constraint: None,
                        primary_key_name: None,
                        option: None,
                        columns: columns::Columns {
                            items: Some(vec![
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "MEMBER_ID".to_string(),
                                    logical_name: Some("会員ID".to_string()),
                                    column_type: Some(columns::ColumnType::BigInt),
                                    unsigned: Some(true),
                                    not_null: Some(true),
                                    primary_key: Some(true),
                                    auto_increment: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "LAST_NAME".to_string(),
                                    logical_name: Some("苗字".to_string()),
                                    column_type: Some(columns::ColumnType::VarCharN),
                                    length: Some(32),
                                    not_null: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "FIRST_NAME".to_string(),
                                    logical_name: Some("名前".to_string()),
                                    column_type: Some(columns::ColumnType::VarCharN),
                                    length: Some(32),
                                    not_null: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Group("COMMON".to_string()),
                            ]),
                        },
                        indexes: None,
                        compound_unique_key_list: compound_unique_key_list::CompoundUniqueKeyList {
                            compound_unique_keys: None
                        },
                    },
                    tables::Table {
                        physical_name: "MEMBER_PROFILES".to_string(),
                        logical_name: "会員プロフィール".to_string(),
                        description: "".to_string(),
                        height: Some(161),
                        width: Some(245),
                        font_name: "Ubuntu".to_string(),
                        font_size: 9,
                        x: 502,
                        y: 103,
                        color: tables::Color {
                            r: 128,
                            g: 128,
                            b: 192,
                        },
                        connections: connections::Connections {
                            relationships: Some(vec![
                                connections::Relationship {
                                    name: "FK_MEMBER_PROFILES_MEMBERS".to_string(),
                                    source: "table.MEMBERS".to_string(),
                                    target: "table.MEMBER_PROFILES".to_string(),
                                    bendpoints: None,
                                    fk_columns: connections::FkColumns {
                                        fk_column: vec![connections::FkColumn {
                                            fk_column_name: "MEMBER_ID".to_string(),
                                        }],
                                    },
                                    parent_cardinality: "1".to_string(),
                                    child_cardinality: "0..1".to_string(),
                                    reference_for_pk: true,
                                    on_delete_action: Some(connections::OnAction::Restrict),
                                    on_update_action: Some(connections::OnAction::Restrict),
                                    referred_simple_unique_column: None,
                                    referred_compound_unique_key: None,
                                },
                                connections::Relationship {
                                    name: "FK_MEMBER_PROFILES_MST_GENDER".to_string(),
                                    source: "table.MST_GENDER".to_string(),
                                    target: "table.MEMBER_PROFILES".to_string(),
                                    bendpoints: None,
                                    fk_columns: connections::FkColumns {
                                        fk_column: vec![connections::FkColumn {
                                            fk_column_name: "GENDER_ID".to_string(),
                                        }]
                                    },
                                    parent_cardinality: "1".to_string(),
                                    child_cardinality: "0..n".to_string(),
                                    reference_for_pk: true,
                                    on_delete_action: Some(connections::OnAction::Restrict),
                                    on_update_action: Some(connections::OnAction::Restrict),
                                    referred_simple_unique_column: None,
                                    referred_compound_unique_key: None,
                                }
                            ])
                        },
                        table_constraint: None,
                        primary_key_name: None,
                        option: None,
                        columns: columns::Columns {
                            items: Some(vec![
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "MEMBER_PROFILE_ID".to_string(),
                                    logical_name: Some("会員プロフィールID".to_string()),
                                    column_type: Some(columns::ColumnType::BigInt),
                                    unsigned: Some(true),
                                    not_null: Some(true),
                                    primary_key: Some(true),
                                    auto_increment: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "MEMBER_ID".to_string(),
                                    referred_column: Some("table.MEMBERS.MEMBER_ID".to_string()),
                                    relationship: Some("FK_MEMBER_PROFILES_MEMBERS".to_string()),
                                    not_null: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "SELF_INTRODUCTION".to_string(),
                                    logical_name: Some("自己紹介".to_string()),
                                    column_type: Some(columns::ColumnType::Text),
                                    not_null: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "PROFILE_IMG_URL".to_string(),
                                    logical_name: Some("プロフィール画像URL".to_string()),
                                    column_type: Some(columns::ColumnType::VarCharN),
                                    length: Some(2048),
                                    not_null: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "GENDER_ID".to_string(),
                                    referred_column: Some("table.MST_GENDER.GENDER_ID".to_string()),
                                    relationship: Some("FK_MEMBER_PROFILES_MST_GENDER".to_string()),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Group("COMMON".to_string()),
                            ]),
                        },
                        indexes: None,
                        compound_unique_key_list: compound_unique_key_list::CompoundUniqueKeyList {
                            compound_unique_keys: None
                        },
                    },
                    tables::Table {
                        physical_name: "MST_GENDER".to_string(),
                        logical_name: "マスター性別".to_string(),
                        description: "".to_string(),
                        height: Some(75),
                        width: Some(190),
                        font_name: "Ubuntu".to_string(),
                        font_size: 9,
                        x: 829,
                        y: 99,
                        color: tables::Color {
                            r: 128,
                            g: 128,
                            b: 192,
                        },
                        connections: connections::Connections {
                            relationships: None,
                        },
                        table_constraint: None,
                        primary_key_name: None,
                        option: None,
                        columns: columns::Columns {
                            items: Some(vec![
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "GENDER_ID".to_string(),
                                    logical_name: Some("性別ID".to_string()),
                                    column_type: Some(columns::ColumnType::Int),
                                    unsigned: Some(true),
                                    not_null: Some(true),
                                    primary_key: Some(true),
                                    auto_increment: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "GENDER".to_string(),
                                    logical_name: Some("性別".to_string()),
                                    column_type: Some(columns::ColumnType::CharN),
                                    length: Some(2),
                                    description: Some("「男性」または「女性」".to_string()),
                                    not_null: Some(true),
                                    ..Default::default()
                                }),
                            ]),
                        },
                        indexes: None,
                        compound_unique_key_list: compound_unique_key_list::CompoundUniqueKeyList {
                            compound_unique_keys: None
                        },
                    },
                    tables::Table {
                        physical_name: "POSTS".to_string(),
                        logical_name: "投稿".to_string(),
                        description: "".to_string(),
                        height: Some(233),
                        width: Some(215),
                        font_name: "Ubuntu".to_string(),
                        font_size: 9,
                        x: 159,
                        y: 364,
                        color: tables::Color {
                            r: 128,
                            g: 128,
                            b: 192,
                        },
                        connections: connections::Connections {
                            relationships: Some(vec![connections::Relationship {
                                name: "FK_MEMBER_POSTS_MEMBERS".to_string(),
                                source: "table.MEMBERS".to_string(),
                                target: "table.POSTS".to_string(),
                                bendpoints: None,
                                fk_columns: connections::FkColumns {
                                    fk_column: vec![connections::FkColumn {
                                        fk_column_name: "MEMBER_ID".to_string(),
                                    }],
                                },
                                parent_cardinality: "0..1".to_string(),
                                child_cardinality: "0..n".to_string(),
                                reference_for_pk: true,
                                on_delete_action: Some(connections::OnAction::Restrict),
                                on_update_action: Some(connections::OnAction::Restrict),
                                referred_simple_unique_column: None,
                                referred_compound_unique_key: None,
                            }])
                        },
                        table_constraint: None,
                        primary_key_name: None,
                        option: None,
                        columns: columns::Columns {
                            items: Some(vec![
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "POST_ID".to_string(),
                                    logical_name: Some("投稿ID".to_string()),
                                    column_type: Some(columns::ColumnType::BigInt),
                                    unsigned: Some(true),
                                    not_null: Some(true),
                                    primary_key: Some(true),
                                    auto_increment: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "MEMBER_ID".to_string(),
                                    referred_column: Some("table.MEMBERS.MEMBER_ID".to_string()),
                                    relationship: Some("FK_MEMBER_POSTS_MEMBERS".to_string()),
                                    not_null: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "TITLE".to_string(),
                                    logical_name: Some("タイトル".to_string()),
                                    column_type: Some(columns::ColumnType::VarCharN),
                                    length: Some(128),
                                    not_null: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "TEXT".to_string(),
                                    logical_name: Some("本文".to_string()),
                                    column_type: Some(columns::ColumnType::Text),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "IMG_URL".to_string(),
                                    logical_name: Some("画像URL".to_string()),
                                    column_type: Some(columns::ColumnType::VarCharN),
                                    length: Some(2048),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "VIEW_COUNT".to_string(),
                                    logical_name: Some("閲覧数".to_string()),
                                    column_type: Some(columns::ColumnType::BigInt),
                                    not_null: Some(true),
                                    default_value: Some("0".to_string()),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "LIKE_COUNT".to_string(),
                                    logical_name: Some("いいね数".to_string()),
                                    column_type: Some(columns::ColumnType::BigInt),
                                    not_null: Some(true),
                                    default_value: Some("0".to_string()),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "PUBLIC_START_AT".to_string(),
                                    logical_name: Some("公開開始時間".to_string()),
                                    column_type: Some(columns::ColumnType::Datetime),
                                    not_null: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "PUBLIC_END_AT".to_string(),
                                    logical_name: Some("公開終了時間".to_string()),
                                    column_type: Some(columns::ColumnType::Datetime),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "DELETED".to_string(),
                                    logical_name: Some("削除済".to_string()),
                                    column_type: Some(columns::ColumnType::Boolean),
                                    not_null: Some(true),
                                    default_value: Some("FALSE".to_string()),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Group("COMMON".to_string()),
                            ]),
                        },
                        indexes: None,
                        compound_unique_key_list: compound_unique_key_list::CompoundUniqueKeyList {
                            compound_unique_keys: None
                        },
                    },
                    tables::Table {
                        physical_name: "POST_REPLIES".to_string(),
                        logical_name: "投稿返信".to_string(),
                        description: "".to_string(),
                        height: Some(75),
                        width: Some(120),
                        font_name: "Ubuntu".to_string(),
                        font_size: 9,
                        x: 782,
                        y: 391,
                        color: tables::Color {
                            r: 128,
                            g: 128,
                            b: 192,
                        },
                        connections: connections::Connections {
                            relationships: Some(vec![
                                connections::Relationship {
                                    name: "FK_POST_REPLIES_POST_THREADS".to_string(),
                                    source: "table.POST_THREADS".to_string(),
                                    target: "table.POST_REPLIES".to_string(),
                                    bendpoints: None,
                                    fk_columns: connections::FkColumns {
                                        fk_column: vec![connections::FkColumn {
                                            fk_column_name: "POST_THREAD_ID".to_string(),
                                        }],
                                    },
                                    parent_cardinality: "1".to_string(),
                                    child_cardinality: "1..n".to_string(),
                                    reference_for_pk: true,
                                    on_delete_action: Some(connections::OnAction::Restrict),
                                    on_update_action: Some(connections::OnAction::Restrict),
                                    referred_simple_unique_column: None,
                                    referred_compound_unique_key: None,
                                },
                                connections::Relationship {
                                    name: "FK_POST_REPLIES_MEMBERS".to_string(),
                                    source: "table.MEMBERS".to_string(),
                                    target: "table.POST_REPLIES".to_string(),
                                    bendpoints: None,
                                    fk_columns: connections::FkColumns {
                                        fk_column: vec![connections::FkColumn {
                                            fk_column_name: "MEMBER_ID".to_string(),
                                        }],
                                    },
                                    parent_cardinality: "0..1".to_string(),
                                    child_cardinality: "0..n".to_string(),
                                    reference_for_pk: true,
                                    on_delete_action: Some(connections::OnAction::Restrict),
                                    on_update_action: Some(connections::OnAction::Restrict),
                                    referred_simple_unique_column: None,
                                    referred_compound_unique_key: None,
                                },
                            ])
                        },
                        table_constraint: None,
                        primary_key_name: None,
                        option: None,
                        columns: columns::Columns {
                            items: Some(vec![
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "POST_REPLY_ID".to_string(),
                                    logical_name: Some("投稿返信ID".to_string()),
                                    column_type: Some(columns::ColumnType::BigInt),
                                    unsigned: Some(true),
                                    not_null: Some(true),
                                    primary_key: Some(true),
                                    auto_increment: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "POST_THREAD_ID".to_string(),
                                    referred_column: Some(
                                        "table.POST_THREADS.POST_THREAD_ID".to_string()
                                    ),
                                    relationship: Some("FK_POST_REPLIES_POST_THREADS".to_string()),
                                    not_null: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "MEMBER_ID".to_string(),
                                    referred_column: Some("table.MEMBERS.MEMBER_ID".to_string()),
                                    relationship: Some("FK_POST_REPLIES_MEMBERS".to_string()),
                                    not_null: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "TEXT".to_string(),
                                    logical_name: Some("本文".to_string()),
                                    column_type: Some(columns::ColumnType::Text),
                                    not_null: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "VIEW_COUNT".to_string(),
                                    logical_name: Some("閲覧数".to_string()),
                                    column_type: Some(columns::ColumnType::BigInt),
                                    not_null: Some(true),
                                    default_value: Some("0".to_string()),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "LIKE_COUNT".to_string(),
                                    logical_name: Some("いいね数".to_string()),
                                    column_type: Some(columns::ColumnType::BigInt),
                                    not_null: Some(true),
                                    default_value: Some("0".to_string()),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Group("COMMON".to_string()),
                            ]),
                        },
                        indexes: None,
                        compound_unique_key_list: compound_unique_key_list::CompoundUniqueKeyList {
                            compound_unique_keys: None
                        },
                    },
                    tables::Table {
                        physical_name: "POST_THREADS".to_string(),
                        logical_name: "投稿スレッド".to_string(),
                        description: "".to_string(),
                        height: Some(75),
                        width: Some(203),
                        font_name: "Ubuntu".to_string(),
                        font_size: 9,
                        x: 481,
                        y: 474,
                        color: tables::Color {
                            r: 128,
                            g: 128,
                            b: 192,
                        },
                        connections: connections::Connections {
                            relationships: Some(vec![connections::Relationship {
                                name: "FK_POST_THREADS_MEMBER_POSTS".to_string(),
                                source: "table.POSTS".to_string(),
                                target: "table.POST_THREADS".to_string(),
                                bendpoints: None,
                                fk_columns: connections::FkColumns {
                                    fk_column: vec![connections::FkColumn {
                                        fk_column_name: "POST_ID".to_string(),
                                    }],
                                },
                                parent_cardinality: "1".to_string(),
                                child_cardinality: "0..1".to_string(),
                                reference_for_pk: true,
                                on_delete_action: Some(connections::OnAction::Restrict),
                                on_update_action: Some(connections::OnAction::Restrict),
                                referred_simple_unique_column: None,
                                referred_compound_unique_key: None,
                            }])
                        },
                        table_constraint: None,
                        primary_key_name: None,
                        option: None,
                        columns: columns::Columns {
                            items: Some(vec![
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "POST_THREAD_ID".to_string(),
                                    logical_name: Some("投稿スレッドID".to_string()),
                                    column_type: Some(columns::ColumnType::BigInt),
                                    unsigned: Some(true),
                                    not_null: Some(true),
                                    primary_key: Some(true),
                                    auto_increment: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Normal(columns::NormalColumn {
                                    physical_name: "POST_ID".to_string(),
                                    referred_column: Some("table.POSTS.POST_ID".to_string()),
                                    relationship: Some("FK_POST_THREADS_MEMBER_POSTS".to_string()),
                                    not_null: Some(true),
                                    unique_key: Some(true),
                                    ..Default::default()
                                }),
                                columns::ColumnItem::Group("COMMON".to_string()),
                            ]),
                        },
                        indexes: None,
                        compound_unique_key_list: compound_unique_key_list::CompoundUniqueKeyList {
                            compound_unique_keys: None
                        },
                    }
                ]),
            }),
            column_groups: Some(vec![column_groups::ColumnGroup {
                column_group_name: "COMMON".to_string(),
                columns: column_groups::Columns {
                    normal_columns: Some(vec![
                        column_groups::NormalColumn {
                            physical_name: "CREATED_AT".to_string(),
                            logical_name: Some("作成時間".to_string()),
                            column_type: column_groups::ColumnType::Datetime,
                            not_null: Some(true),
                            ..Default::default()
                        },
                        column_groups::NormalColumn {
                            physical_name: "CREATED_BY".to_string(),
                            logical_name: Some("作成会員ID".to_string()),
                            column_type: column_groups::ColumnType::BigInt,
                            not_null: Some(true),
                            ..Default::default()
                        },
                        column_groups::NormalColumn {
                            physical_name: "UPDATED_AT".to_string(),
                            logical_name: Some("更新時間".to_string()),
                            column_type: column_groups::ColumnType::Datetime,
                            not_null: Some(true),
                            ..Default::default()
                        },
                        column_groups::NormalColumn {
                            physical_name: "UPDATED_BY".to_string(),
                            logical_name: Some("更新会員ID".to_string()),
                            column_type: column_groups::ColumnType::BigInt,
                            not_null: Some(true),
                            ..Default::default()
                        }
                    ])
                }
            }])
        }
    )
}
