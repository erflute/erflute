import type { TableResponse } from "@/types/api/diagramWalkers";
import { Cardinality } from "@/types/domain/relationship";
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
  compoundUniqueKeyList: {},
  ...overrides,
});

describe("when tables include relationships", () => {
  it("flattens relationships across tables and preserves fields", () => {
    const relationships = mapRelationshipsFrom([
      createTableResponse({
        connections: {
          relationships: [
            {
              name: "users_posts",
              source: "users",
              target: "posts",
              fkColumns: { fkColumn: [{ fkColumnName: "user_id" }] },
              parentCardinality: Cardinality.One,
              childCardinality: Cardinality.OneN,
              referenceForPk: false,
              onDeleteAction: "cascade",
              onUpdateAction: "restrict",
            },
          ],
        },
      }),
      createTableResponse({
        physicalName: "comments",
        connections: {
          relationships: [
            {
              name: "posts_comments",
              source: "posts",
              target: "comments",
              fkColumns: { fkColumn: [{ fkColumnName: "post_id" }] },
              parentCardinality: Cardinality.One,
              childCardinality: Cardinality.ZeroN,
              referenceForPk: true,
              onDeleteAction: "cascade",
              onUpdateAction: "cascade",
            },
          ],
        },
      }),
    ]);

    expect(relationships).toEqual([
      {
        name: "users_posts",
        source: "users",
        target: "posts",
        parentCardinality: Cardinality.One,
        childCardinality: Cardinality.OneN,
      },
      {
        name: "posts_comments",
        source: "posts",
        target: "comments",
        parentCardinality: Cardinality.One,
        childCardinality: Cardinality.ZeroN,
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
