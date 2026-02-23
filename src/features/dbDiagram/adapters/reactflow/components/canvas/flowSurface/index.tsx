import { Background, BackgroundVariant, ReactFlow } from "@xyflow/react";
import { RelationInfoDialog } from "@/features/dbDiagram/components/relationInfoDialog";
import { TableInfoDialog } from "@/features/dbDiagram/components/tableInfoDialog";
import { cn } from "@/lib/utils";
import { useDiagramStore } from "@/stores/diagramStore";
import {
  useRelationInfoDialogController,
  useTableInfoDialogController,
} from "../dialogControllers";
import { useCanvasEdgeTypes, useCanvasNodeTypes } from "../flowTypes";
import type { FlowSurfaceProps } from "./types";

export const FlowSurface = ({
  nodes,
  edges,
  setNodes,
  setEdges,
  cursorClass,
  nodesDraggable,
  nodesConnectable,
  elementsSelectable,
  selectionOnDrag,
  onPaneClick,
  onNodesChange,
  onEdgesChange,
}: FlowSurfaceProps) => {
  const updateTable = useDiagramStore((state) => state.updateTable);
  const updateRelationship = useDiagramStore(
    (state) => state.updateRelationship,
  );
  const {
    tidNode,
    tableInfoDialogOpen,
    openTableInfoDialog,
    tableInfoDialogHandlers,
  } = useTableInfoDialogController({
    nodes,
    setNodes,
    setEdges,
    updateTable,
  });
  const {
    ridEdge,
    relationInfoDialogOpen,
    openRelationInfoDialog,
    relationInfoDialogHandlers,
  } = useRelationInfoDialogController({
    edges,
    setEdges,
    updateRelationship,
  });
  const nodeTypes = useCanvasNodeTypes({
    onOpenTableInfoDialog: openTableInfoDialog,
  });
  const edgeTypes = useCanvasEdgeTypes({
    onOpenRelationInfoDialog: openRelationInfoDialog,
  });
  return (
    <div className="relative flex h-full w-full">
      <ReactFlow
        className={cn("flex-1", cursorClass)}
        style={{ width: "100%", height: "100%" }}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
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
      {tidNode && (
        <TableInfoDialog
          data={tidNode.data}
          open={tableInfoDialogOpen}
          onOpenChange={tableInfoDialogHandlers?.handleOpenChange}
          onApply={tableInfoDialogHandlers?.handleApply}
          onCancel={tableInfoDialogHandlers?.handleCancel}
        />
      )}
      {ridEdge?.data && (
        <RelationInfoDialog
          data={ridEdge.data}
          open={relationInfoDialogOpen}
          onOpenChange={relationInfoDialogHandlers?.handleOpenChange}
          onApply={relationInfoDialogHandlers?.handleApply}
          onCancel={relationInfoDialogHandlers?.handleCancel}
        />
      )}
    </div>
  );
};
