import { useMemo } from "react";
import { useEdgesState, useNodesState } from "@xyflow/react";
import { stringifyReference } from "@/domain/parsers/referenceParser";
import {
  createEdges,
  createNodes,
} from "@/features/dbDiagram/adapters/reactflow/mappers";
import { useDiagramStore } from "@/stores/diagramStore";
import type { Relationship } from "@/types/domain/relationship";
import type { Table } from "@/types/domain/table";
import type { VirtualDiagram as DomainVirtualDiagram } from "@/types/domain/vdiagram";
import { FlowSurface } from "../flowSurface";
import type { VirtualDiagramProps } from "./types";

function getVisibleTables(
  tables: Table[],
  vdiagrams: DomainVirtualDiagram[],
  vdiagramName: string,
): Table[] {
  const selectedDiagram = vdiagrams.find(
    (vdiagram) => vdiagram.vdiagramName === vdiagramName,
  );
  if (!selectedDiagram) {
    return [];
  }

  return selectedDiagram.vtables
    .map((vtable) => {
      const table = tables.find(
        (item) =>
          stringifyReference({
            tableName: item.physicalName,
          }) === vtable.tableId,
      );
      if (!table) {
        return undefined;
      }
      return {
        ...table,
        x: vtable.x,
        y: vtable.y,
      } satisfies Table;
    })
    .filter((table): table is Table => !!table);
}

function getVisibleRelationships(
  relationships: Relationship[],
  tables: Table[],
): Relationship[] {
  const tableIds = new Set(
    tables.map((table) =>
      stringifyReference({
        tableName: table.physicalName,
      }),
    ),
  );
  return relationships.filter(
    (relationship) =>
      tableIds.has(relationship.source) && tableIds.has(relationship.target),
  );
}

export const VirtualDiagram = ({ vdiagramName }: VirtualDiagramProps) => {
  const tables = useDiagramStore((state) => state.tables);
  const relationships = useDiagramStore((state) => state.relationships);
  const vdiagrams = useDiagramStore((state) => state.vdiagrams);

  const visibleTables = useMemo(
    () => getVisibleTables(tables, vdiagrams, vdiagramName),
    [tables, vdiagrams, vdiagramName],
  );
  const visibleRelationships = useMemo(
    () => getVisibleRelationships(relationships, visibleTables),
    [relationships, visibleTables],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(
    createNodes(visibleTables),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    createEdges(visibleRelationships),
  );

  return (
    <FlowSurface
      nodes={nodes}
      edges={edges}
      setNodes={setNodes}
      setEdges={setEdges}
      cursorClass="cursor-default"
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      selectionOnDrag={false}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    />
  );
};
