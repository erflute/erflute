import { Cardinality } from "@/types/domain/relationship";
import type { Relationship } from "@/types/domain/relationship";
import { updateRelationAndRefs } from "./updateRelation";

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

it("returns the same relationship when references do not match the previous table name", () => {
  const relationship = createRelationship({
    source: "table.TABLE_A",
    target: "table.TABLE_B",
  });

  const result = updateRelationAndRefs({
    relationship,
    previousTableName: "TABLE_X",
    nextTableName: "TABLE_Y",
  });

  expect(result).toBe(relationship);
});

it("updates the source reference when it matches the previous table name", () => {
  const relationship = createRelationship({
    source: "table.OLD_TABLE",
    target: "table.TABLE_B",
  });

  const result = updateRelationAndRefs({
    relationship,
    previousTableName: "OLD_TABLE",
    nextTableName: "NEW_TABLE",
  });

  expect(result).toEqual(
    createRelationship({
      source: "table.NEW_TABLE",
      target: "table.TABLE_B",
    }),
  );
});

it("updates the target reference when it matches the previous table name", () => {
  const relationship = createRelationship({
    source: "table.TABLE_A",
    target: "table.OLD_TABLE",
  });

  const result = updateRelationAndRefs({
    relationship,
    previousTableName: "OLD_TABLE",
    nextTableName: "NEW_TABLE",
  });

  expect(result).toEqual(
    createRelationship({
      source: "table.TABLE_A",
      target: "table.NEW_TABLE",
    }),
  );
});
