import type {
  Edge,
  Node,
  OnEdgesChange,
  OnNodesChange,
} from "@xyflow/react";
import type { MouseEvent } from "react";
import type { Relationship } from "@/types/domain/relationship";
import type { Table } from "@/types/domain/table";

export type FlowSurfaceProps = {
  nodes: Node<Table>[];
  edges: Edge<Relationship>[];
  cursorClass: string;
  nodesDraggable: boolean;
  nodesConnectable: boolean;
  elementsSelectable: boolean;
  selectionOnDrag: boolean;
  onPaneClick?: (event: MouseEvent) => void;
  onNodesChange?: OnNodesChange<Node<Table>>;
  onEdgesChange?: OnEdgesChange<Edge<Relationship>>;
};
