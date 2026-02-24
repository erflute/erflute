import type { TableResponse } from "@/types/api/diagramWalkers";
import type { Column } from "@/types/domain/column";
import { ColumnType } from "@/types/domain/columnType";
import { mapTablesFrom } from "./tableMapper";

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
  indexes: [],
  compoundUniqueKeyList: {},
  ...overrides,
});

describe("with populated columns", () => {
  it("maps table properties and preserves column attributes", () => {
    const result = mapTablesFrom([
      createTableResponse({
        width: 140,
        height: 90,
        compoundUniqueKeyList: {
          compoundUniqueKeys: [
            {
              name: "users_unique",
              columns: [
                { columnId: "table.users.id" },
                { columnId: "table.users.email" },
              ],
            },
          ],
        },
        columns: {
          items: [
            {
              physicalName: "id",
              logicalName: "ID",
              description: "Identifier",
              columnType: ColumnType.Int,
              length: 11,
              decimal: 2,
              unsigned: true,
              notNull: true,
              uniqueKey: true,
              defaultValue: "0",
              primaryKey: true,
              autoIncrement: true,
              referredColumn: "users.id",
            },
            "COMMON",
          ],
        },
      }),
    ]);

    expect(result).toEqual([
      {
        color: { r: 10, g: 20, b: 30 },
        x: 10,
        y: 20,
        width: 140,
        height: 90,
        physicalName: "users",
        logicalName: "Users",
        description: "User table",
        tableConstraint: undefined,
        primaryKeyName: undefined,
        option: undefined,
        compoundUniqueKeys: [
          {
            name: "users_unique",
            columns: ["table.users.id", "table.users.email"],
          },
        ],
        indexes: [],
        columns: [
          {
            physicalName: "id",
            logicalName: "ID",
            description: "Identifier",
            columnType: ColumnType.Int,
            length: 11,
            decimal: 2,
            enumArgs: undefined,
            unsigned: true,
            notNull: true,
            unique: true,
            defaultValue: "0",
            primaryKey: true,
            autoIncrement: true,
            referredColumn: "users.id",
          },
          "COMMON",
        ],
      },
    ]);
  });

  it("parses labels into column types when mapping", () => {
    const [table] = mapTablesFrom([
      createTableResponse({
        columns: {
          items: [
            {
              physicalName: "email",
              columnType: "varchar(n)",
              length: 255,
              notNull: true,
            },
          ],
        },
      }),
    ]);

    expect((table.columns?.[0] as Column)?.columnType).toBe(
      ColumnType.VarCharN,
    );
  });

  it("uses the referred column type when the column type is omitted", () => {
    const [referencedTable, referencingTable] = mapTablesFrom([
      createTableResponse({
        physicalName: "users",
        columns: {
          items: [
            {
              physicalName: "id",
              columnType: "int",
              notNull: true,
            },
          ],
        },
      }),
      createTableResponse({
        physicalName: "posts",
        columns: {
          items: [
            {
              physicalName: "user_id",
              referredColumn: "table.users.id",
              notNull: true,
            },
          ],
        },
      }),
    ]);

    expect((referencedTable.columns?.[0] as Column)?.columnType).toBe(
      ColumnType.Int,
    );
    expect((referencingTable.columns?.[0] as Column)?.columnType).toBe(
      ColumnType.Int,
    );
  });
});

describe("without normal columns", () => {
  it("omits columns when none are provided", () => {
    const [table] = mapTablesFrom([
      createTableResponse({
        columns: {},
      }),
    ]);

    expect(table.columns).toBeUndefined();
  });

  it("sets column type to undefined when the value is unknown", () => {
    const [table] = mapTablesFrom([
      createTableResponse({
        columns: {
          items: [
            {
              physicalName: "mystery",
              columnType: "unknown",
              notNull: false,
            },
          ],
        },
      }),
    ]);

    expect((table.columns?.[0] as Column)?.columnType).toBeUndefined();
  });
});
