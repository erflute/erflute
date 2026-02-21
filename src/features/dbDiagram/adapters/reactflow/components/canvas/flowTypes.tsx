import { useMemo } from "react";
import type { Edge, EdgeProps, Node, NodeProps } from "@xyflow/react";
import type { Relationship } from "@/types/domain/relationship";
import type { Table } from "@/types/domain/table";
import { CardinalityEdge } from "../cardinalityEdge";
import { TableNode } from "../tableNode";

type UseCanvasNodeTypesArgs = {
  onOpenTableInfoDialog: (tableNodeId: string) => void;
};

export function useCanvasNodeTypes({
  onOpenTableInfoDialog,
}: UseCanvasNodeTypesArgs) {
  return useMemo(
    () => ({
      table: (props: NodeProps<Node<Table>>) => (
        <TableNode {...props} onOpenTableInfoDialog={onOpenTableInfoDialog} />
      ),
    }),
    [onOpenTableInfoDialog],
  );
}

type UseCanvasEdgeTypesArgs = {
  onOpenRelationInfoDialog: (edgeId: string) => void;
};

export function useCanvasEdgeTypes({
  onOpenRelationInfoDialog,
}: UseCanvasEdgeTypesArgs) {
  return useMemo(
    () => ({
      cardinality: (props: EdgeProps<Edge<Relationship>>) => (
        <CardinalityEdge
          {...props}
          onOpenRelationInfoDialog={() => onOpenRelationInfoDialog(props.id)}
        />
      ),
    }),
    [onOpenRelationInfoDialog],
  );
}
