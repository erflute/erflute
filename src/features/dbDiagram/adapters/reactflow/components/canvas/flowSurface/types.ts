import type { Dispatch, MouseEvent, SetStateAction } from "react";
import type { Edge, Node, OnEdgesChange, OnNodesChange } from "@xyflow/react";
import type { Relationship } from "@/types/domain/relationship";
import type { Table } from "@/types/domain/table";

type TableNode = Node<Table>;
type RelationshipEdge = Edge<Relationship>;

export type FlowSurfaceProps = {
  nodes: Node<Table>[];
  edges: Edge<Relationship>[];
  setNodes: Dispatch<SetStateAction<TableNode[]>>;
  setEdges: Dispatch<SetStateAction<RelationshipEdge[]>>;
  cursorClass: string;
  nodesDraggable: boolean;
  nodesConnectable: boolean;
  elementsSelectable: boolean;
  selectionOnDrag: boolean;
  onPaneClick?: (event: MouseEvent) => void;
  onNodesChange: OnNodesChange<Node<Table>>;
  onEdgesChange: OnEdgesChange<Edge<Relationship>>;
};
