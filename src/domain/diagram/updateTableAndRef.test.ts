import { Cardinality } from "@/types/domain/relationship";
import type { Relationship } from "@/types/domain/relationship";
import type { Table } from "@/types/domain/table";
import { updateTableAndRef } from "./updateTable";

const createTable = (overrides: Partial<Table> = {}): Table => ({
  color: { r: 0, g: 0, b: 0 },
  x: 0,
  y: 0,
  width: 120,
  height: 80,
  physicalName: "TABLE_A",
  logicalName: "Table A",
  description: "",
  ...overrides,
});

const createRelationship = (
  overrides: Partial<Relationship> = {},
): Relationship => ({
  name: "RELATIONSHIP_A",
  source: "table.TABLE_A",
  target: "table.TABLE_B",
  fkColumnNames: ["id"],
  parentCardinality: Cardinality.One,
  childCardinality: Cardinality.ZeroN,
  referredColumn: "id",
  referredColumnOptions: ["id"],
  ...overrides,
});

it("returns null when the previous table name does not exist", () => {
  const tables = [createTable({ physicalName: "TABLE_A" })];
  const relationships = [createRelationship()];

  const result = updateTableAndRef({
    tables,
    relationships,
    table: createTable({ physicalName: "TABLE_B" }),
    previousPhysicalName: "MISSING_TABLE",
  });

  expect(result).toBeNull();
});

it("replaces the table without changing relationships when the name is unchanged", () => {
  const tables = [
    createTable({ physicalName: "TABLE_A", logicalName: "Old Name" }),
    createTable({ physicalName: "TABLE_B" }),
  ];
  const relationships = [createRelationship()];

  const result = updateTableAndRef({
    tables,
    relationships,
    table: createTable({ physicalName: "TABLE_A", logicalName: "New Name" }),
    previousPhysicalName: "TABLE_A",
  });

  expect(result).toEqual({
    tables: [
      createTable({ physicalName: "TABLE_A", logicalName: "New Name" }),
      createTable({ physicalName: "TABLE_B" }),
    ],
    relationships,
  });
});

it("renames references that use the previous table name", () => {
  const tables = [createTable({ physicalName: "OLD_TABLE" })];
  const relationships = [
    createRelationship({
      name: "REL_SOURCE",
      source: "table.OLD_TABLE",
      target: "table.OTHER_TABLE",
    }),
    createRelationship({
      name: "REL_TARGET",
      source: "table.OTHER_TABLE",
      target: "table.OLD_TABLE",
    }),
  ];

  const result = updateTableAndRef({
    tables,
    relationships,
    table: createTable({ physicalName: "NEW_TABLE" }),
    previousPhysicalName: "OLD_TABLE",
  });

  expect(result).toEqual({
    tables: [createTable({ physicalName: "NEW_TABLE" })],
    relationships: [
      createRelationship({
        name: "REL_SOURCE",
        source: "table.NEW_TABLE",
        target: "table.OTHER_TABLE",
      }),
      createRelationship({
        name: "REL_TARGET",
        source: "table.OTHER_TABLE",
        target: "table.NEW_TABLE",
      }),
    ],
  });
});
