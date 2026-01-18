import { useState } from "react";
import {
  Handle,
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { stringifyReference } from "@/domain/parsers/referenceParser";
import { TableCard } from "@/features/dbDiagram/components/tableCard";
import { TableInfoDialog } from "@/features/dbDiagram/components/tableInfoDialog";
import { useDiagramStore } from "@/stores/diagramStore";
import type { Table } from "@/types/domain/table";

export function TableNode({ id, width, height, data }: NodeProps<Node<Table>>) {
  const { setEdges, setNodes } = useReactFlow();
  const updateTable = useDiagramStore((state) => state.updateTable);
  const [tableInfoDialogOpen, setTableInfoDialogOpen] = useState(false);
  const tablePhysicalName = data.physicalName;
  return (
    <>
      <TableCard
        width={width}
        height={height}
        setWidth={(width) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === id
                ? { ...node, width, data: { ...data, width } }
                : node,
            ),
          );
        }}
        setHeight={(height) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === id
                ? { ...node, height, data: { ...data, height } }
                : node,
            ),
          );
        }}
        data={data}
        onHeaderDoubleClick={() => setTableInfoDialogOpen(true)}
      />
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Right} />
      <Handle type="target" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <TableInfoDialog
        data={data}
        open={tableInfoDialogOpen}
        onOpenChange={setTableInfoDialogOpen}
        onApply={(updatedTable) => {
          updateTable(updatedTable, tablePhysicalName);
          const currentNodeId = stringifyReference({
            tableName: tablePhysicalName,
          });
          const nextNodeId = stringifyReference({
            tableName: updatedTable.physicalName,
          });
          setNodes((nodes) =>
            nodes.map((node) => {
              if (node.id !== currentNodeId) {
                return node;
              }
              return {
                ...node,
                id: nextNodeId,
                width: updatedTable.width,
                height: updatedTable.height,
                data: updatedTable,
              };
            }),
          );
          if (currentNodeId !== nextNodeId) {
            setEdges((edges) =>
              edges.map((edge) => {
                const source =
                  edge.source === currentNodeId ? nextNodeId : edge.source;
                const target =
                  edge.target === currentNodeId ? nextNodeId : edge.target;
                if (source === edge.source && target === edge.target) {
                  return edge;
                }
                return { ...edge, source, target };
              }),
            );
          }
        }}
      />
    </>
  );
}
