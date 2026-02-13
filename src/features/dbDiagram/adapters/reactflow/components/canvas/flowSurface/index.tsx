import {
  Background,
  BackgroundVariant,
  ReactFlow,
} from "@xyflow/react";
import { cn } from "@/lib/utils";
import { CardinalityEdge } from "../../cardinalityEdge";
import { TableNode } from "../../tableNode";
import type { FlowSurfaceProps } from "./types";

export const FlowSurface = ({
  nodes,
  edges,
  cursorClass,
  nodesDraggable,
  nodesConnectable,
  elementsSelectable,
  selectionOnDrag,
  onPaneClick,
  onNodesChange,
  onEdgesChange,
}: FlowSurfaceProps) => {
  return (
    <div className="relative flex h-full w-full">
      <ReactFlow
        className={cn("flex-1", cursorClass)}
        style={{ width: "100%", height: "100%" }}
        nodes={nodes}
        edges={edges}
        nodeTypes={{
          table: TableNode,
        }}
        edgeTypes={{
          cardinality: CardinalityEdge,
        }}
        onPaneClick={onPaneClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable={nodesDraggable}
        nodesConnectable={nodesConnectable}
        elementsSelectable={elementsSelectable}
        selectionOnDrag={selectionOnDrag}
        fitView
      >
        <Background variant={BackgroundVariant.Lines} gap={16} size={1} />
      </ReactFlow>
    </div>
  );
};
