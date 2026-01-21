import { updateRelationshipBy } from "./updateRelationshipBy";
import { Cardinality } from "@/types/domain/relationship";
import type { Relationship } from "@/types/domain/relationship";

const createRelationship = (
  overrides: Partial<Relationship> = {},
): Relationship => ({
  name: "RELATIONSHIP_A",
  source: "table.TABLE_A.id",
  target: "table.TABLE_B.id",
  fkColumnNames: ["id"],
  parentCardinality: Cardinality.One,
  childCardinality: Cardinality.ZeroN,
  referredColumn: "id",
  referredColumnOptions: ["id"],
  ...overrides,
});

it("returns null when the target relationship name does not exist", () => {
  const relationships = [createRelationship()];

  const result = updateRelationshipBy({
    relationships,
    relationship: createRelationship({ name: "RELATIONSHIP_B" }),
    previousName: "MISSING_RELATIONSHIP",
  });

  expect(result).toBeNull();
});

it("replaces the relationship with the matching name", () => {
  const relationships = [
    createRelationship({ name: "RELATIONSHIP_A" }),
    createRelationship({ name: "RELATIONSHIP_B" }),
  ];
  const nextRelationship = createRelationship({
    name: "RELATIONSHIP_A",
    source: "table.TABLE_C.id",
  });

  const result = updateRelationshipBy({
    relationships,
    relationship: nextRelationship,
    previousName: "RELATIONSHIP_A",
  });

  expect(result).toEqual([nextRelationship, relationships[1]]);
});
