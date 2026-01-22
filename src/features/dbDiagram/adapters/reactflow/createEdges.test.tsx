import type { Relationship } from "@/types/domain/relationship";
import { createEdges } from "./mappers";

function createRelationship(overrides?: Partial<Relationship>): Relationship {
  return {
    name: "fk_orders_users",
    source: "ORDERS",
    target: "USERS",
    fkColumnNames: [],
    parentCardinality: "1",
    childCardinality: "0..n",
    referredColumn: "ID",
    referredColumnOptions: ["ID"],
    ...overrides,
  };
}

it("creates a cardinality edge with identifiers and metadata intact", () => {
  const relationship = createRelationship({
    name: "fk_invoices_customers",
    source: "INVOICES",
    target: "CUSTOMERS",
    parentCardinality: "0..1",
    childCardinality: "1",
  });

  const [edge] = createEdges([relationship]);

  expect(edge).toMatchObject({
    id: "fk_invoices_customers",
    type: "cardinality",
    source: "INVOICES",
    target: "CUSTOMERS",
    data: relationship,
  });
});

it("returns an empty array when no relationships are provided", () => {
  expect(createEdges([])).toEqual([]);
});
