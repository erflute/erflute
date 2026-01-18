import type { TableResponse } from "@/types/api/diagramWalkers";
import { Cardinality, ReferenceOperation } from "@/types/domain/relationship";
import { mapRelationshipsFrom } from "./tableMapper";

const createTableResponse = (
  overrides?: Partial<TableResponse>,
): TableResponse => ({
  physicalName: "users",
  logicalName: "Users",
  description: "User table",
  height: 80,
  width: 120,
  fontName: "Arial",
  fontSize: 12,
  x: 10,
  y: 20,
  color: { r: 10, g: 20, b: 30 },
  connections: { relationships: [] },
  columns: { items: [] },
  indexes: { indexes: [] },
  compoundUniqueKeyList: {},
  ...overrides,
});

describe("when tables include relationships", () => {
  it("uses the primary key when flattening relationships across tables", () => {
    const relationships = mapRelationshipsFrom([
      createTableResponse({
        columns: {
          items: [
            {
              physicalName: "id",
              primaryKey: true,
            },
            {
              physicalName: "unique_title",
              uniqueKey: true,
            },
          ],
        },
      }),
      createTableResponse({
        physicalName: "comments",
        connections: {
          relationships: [
            {
              name: "user_comments",
              source: "table.users",
              target: "table.comments",
              fkColumns: { fkColumn: [{ fkColumnName: "user_id" }] },
              parentCardinality: Cardinality.One,
              childCardinality: Cardinality.ZeroN,
              referenceForPk: true,
              onDeleteAction: ReferenceOperation.Cascade,
              onUpdateAction: ReferenceOperation.Cascade,
            },
          ],
        },
      }),
    ]);

    expect(relationships).toEqual([
      {
        name: "user_comments",
        source: "table.users",
        target: "table.comments",
        fkColumnNames: ["user_id"],
        parentCardinality: Cardinality.One,
        childCardinality: Cardinality.ZeroN,
        referredColumn: "id",
        referredColumnOptions: ["id", "unique_title"],
        onDeleteAction: ReferenceOperation.Cascade,
        onUpdateAction: ReferenceOperation.Cascade,
      },
    ]);
  });

  it("uses the referred simple unique column when not pointing to the primary key", () => {
    const relationships = mapRelationshipsFrom([
      createTableResponse({
        physicalName: "accounts",
        columns: {
          items: [
            {
              physicalName: "id",
              primaryKey: true,
            },
            {
              physicalName: "email",
              uniqueKey: true,
            },
            {
              physicalName: "tenant_id",
            },
          ],
        },
        compoundUniqueKeyList: {
          compoundUniqueKeys: [
            {
              name: "uq_account_tenant",
              columns: {
                columns: [{ columnId: "email" }, { columnId: "tenant_id" }],
              },
            },
          ],
        },
      }),
      createTableResponse({
        physicalName: "logins",
        connections: {
          relationships: [
            {
              name: "account_logins",
              source: "table.accounts",
              target: "table.logins",
              fkColumns: { fkColumn: [{ fkColumnName: "account_email" }] },
              parentCardinality: Cardinality.One,
              childCardinality: Cardinality.ZeroN,
              referenceForPk: false,
              referredSimpleUniqueColumn: "email",
            },
          ],
        },
      }),
    ]);

    expect(relationships).toEqual([
      {
        name: "account_logins",
        source: "table.accounts",
        target: "table.logins",
        fkColumnNames: ["account_email"],
        parentCardinality: Cardinality.One,
        childCardinality: Cardinality.ZeroN,
        referredColumn: "email",
        referredColumnOptions: ["id", "email", "uq_account_tenant"],
        onDeleteAction: undefined,
        onUpdateAction: undefined,
      },
    ]);
  });

  it("uses the referred compound unique key when provided", () => {
    const relationships = mapRelationshipsFrom([
      createTableResponse({
        physicalName: "projects",
        columns: {
          items: [
            {
              physicalName: "id",
              primaryKey: true,
            },
            {
              physicalName: "code",
              uniqueKey: true,
            },
            {
              physicalName: "tenant_id",
            },
          ],
        },
        compoundUniqueKeyList: {
          compoundUniqueKeys: [
            {
              name: "uq_project_tenant",
              columns: {
                columns: [{ columnId: "code" }, { columnId: "tenant_id" }],
              },
            },
          ],
        },
      }),
      createTableResponse({
        physicalName: "issues",
        connections: {
          relationships: [
            {
              name: "project_issues",
              source: "table.projects",
              target: "table.issues",
              fkColumns: {
                fkColumn: [
                  { fkColumnName: "project_code" },
                  { fkColumnName: "project_tenant_id" },
                ],
              },
              parentCardinality: Cardinality.One,
              childCardinality: Cardinality.ZeroN,
              referenceForPk: false,
              referredCompoundUniqueKey: "uq_project_tenant",
            },
          ],
        },
      }),
    ]);

    expect(relationships).toEqual([
      {
        name: "project_issues",
        source: "table.projects",
        target: "table.issues",
        fkColumnNames: ["project_code", "project_tenant_id"],
        parentCardinality: Cardinality.One,
        childCardinality: Cardinality.ZeroN,
        referredColumn: "uq_project_tenant",
        referredColumnOptions: ["id", "code", "uq_project_tenant"],
        onDeleteAction: undefined,
        onUpdateAction: undefined,
      },
    ]);
  });
});

describe("when no relationships exist", () => {
  it("returns an empty list", () => {
    const relationships = mapRelationshipsFrom([
      createTableResponse(),
      createTableResponse({ connections: { relationships: [] } }),
    ]);

    expect(relationships).toEqual([]);
  });
});
