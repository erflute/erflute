import { type Edge, type Node } from "@xyflow/react";
import { stringifyReference } from "@/domain/parsers/referenceParser";
import type { Relationship } from "@/types/domain/relationship";
import { type Table } from "@/types/domain/table";

export function createNodes(tables: Table[]): Node<Table>[] {
  return tables.map((table) => {
    return {
      id: stringifyReference({ tableName: table.physicalName }),
      type: "table",
      position: {
        x: table.x,
        y: table.y,
      },
      width: table.width,
      height: table.height,
      data: table,
    } satisfies Node<Table>;
  });
}

export function createEdges(
  relationships: Relationship[],
): Edge<Relationship>[] {
  return relationships.map((relationship) => {
    return {
      id: relationship.name,
      type: "cardinality",
      source: relationship.source,
      target: relationship.target,
      data: relationship,
    } satisfies Edge<Relationship>;
  });
}
