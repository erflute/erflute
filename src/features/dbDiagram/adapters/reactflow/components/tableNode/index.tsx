import {
  Handle,
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { TableCard } from "@/features/dbDiagram/components/tableCard";
import type { Table } from "@/types/domain/table";

type TableNodeProps = NodeProps<Node<Table>> & {
  onOpenTableInfoDialog: (tableNodeId: string) => void;
};

export function TableNode({
  id,
  width,
  height,
  data,
  onOpenTableInfoDialog,
}: TableNodeProps) {
  const { setNodes } = useReactFlow<Node<Table>>();
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
        onHeaderDoubleClick={() => onOpenTableInfoDialog(id)}
      />
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Right} />
      <Handle type="target" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
    </>
  );
}
