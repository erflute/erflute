import { useCallback } from "react";
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
  const handleWidthChange = useCallback(
    (nextWidth: number) => {
      setNodes((currentNodes) => {
        let hasChanges = false;
        const nextNodes = currentNodes.map((node) => {
          if (node.id !== id) {
            return node;
          }
          if (node.width === nextWidth && node.data.width === nextWidth) {
            return node;
          }
          hasChanges = true;
          return {
            ...node,
            width: nextWidth,
            data: { ...node.data, width: nextWidth },
          };
        });
        return hasChanges ? nextNodes : currentNodes;
      });
    },
    [id, setNodes],
  );
  const handleHeightChange = useCallback(
    (nextHeight: number) => {
      setNodes((currentNodes) => {
        let hasChanges = false;
        const nextNodes = currentNodes.map((node) => {
          if (node.id !== id) {
            return node;
          }
          if (node.height === nextHeight && node.data.height === nextHeight) {
            return node;
          }
          hasChanges = true;
          return {
            ...node,
            height: nextHeight,
            data: { ...node.data, height: nextHeight },
          };
        });
        return hasChanges ? nextNodes : currentNodes;
      });
    },
    [id, setNodes],
  );

  return (
    <>
      <TableCard
        width={width}
        height={height}
        setWidth={handleWidthChange}
        setHeight={handleHeightChange}
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
