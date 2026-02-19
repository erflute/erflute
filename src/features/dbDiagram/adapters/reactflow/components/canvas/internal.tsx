import "@xyflow/react/dist/style.css";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  createEdges,
  createNodes,
} from "@/features/dbDiagram/adapters/reactflow/mappers";
import { modeSettings } from "@/features/dbDiagram/adapters/reactflow/modeSettings";
import { TableInfoDialog } from "@/features/dbDiagram/components/tableInfoDialog";
import { cn } from "@/lib/utils";
import { useDiagramStore } from "@/stores/diagramStore";
import { useViewModeStore } from "@/stores/viewModeStore";
import { DiagramMode } from "@/types/domain/diagramMode";
import type { Table } from "@/types/domain/table";
import { CardinalityEdge } from "../cardinalityEdge";
import { TableNode } from "../tableNode";
import {
  createClickInTableModeHandler,
  createTableInfoDialogHandlers,
} from "./handlers";

function getSettings(isReadOnly: boolean, diagramMode: DiagramMode | null) {
  if (isReadOnly || !diagramMode) {
    return {
      cursorClass: "cursor-default",
      nodesDraggable: true,
      nodesConnectable: false,
      elementsSelectable: false,
      selectionOnDrag: false,
    };
  }
  return modeSettings[diagramMode];
}

export const Internal = () => {
  const { isReadOnly, diagramMode } = useViewModeStore();
  const updateTable = useDiagramStore((state) => state.updateTable);
  const tablesVersion = useDiagramStore((state) => state.tablesVersion);
  const relationshipsVersion = useDiagramStore(
    (state) => state.relationshipsVersion,
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(
    createNodes(useDiagramStore.getState().tables),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    createEdges(useDiagramStore.getState().relationships),
  );
  const settings = getSettings(isReadOnly, diagramMode);
  const { addNodes, screenToFlowPosition } = useReactFlow();
  const [tidNodeId, setTidNodeId] = useState<string | null>(null);
  const [tableInfoDialogOpen, setTableInfoDialogOpen] = useState(false);
  const dialogNodeClearTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const clearTidNode = () => {
    if (dialogNodeClearTimeoutRef.current) {
      clearTimeout(dialogNodeClearTimeoutRef.current);
      dialogNodeClearTimeoutRef.current = null;
    }
    setTidNodeId(null);
  };

  const scheduleTidNodeClear = () => {
    if (dialogNodeClearTimeoutRef.current) {
      clearTimeout(dialogNodeClearTimeoutRef.current);
    }
    // TableInfoDialog defers handlers after close animation, so keep context briefly.
    dialogNodeClearTimeoutRef.current = setTimeout(() => {
      setTidNodeId(null);
      dialogNodeClearTimeoutRef.current = null;
    }, 300);
  };

  const nodeTypes = useMemo(
    () => ({
      table: (props: NodeProps<Node<Table>>) => (
        <TableNode
          {...props}
          onOpenTableInfoDialog={(tableNodeId: string) => {
            if (dialogNodeClearTimeoutRef.current) {
              clearTimeout(dialogNodeClearTimeoutRef.current);
              dialogNodeClearTimeoutRef.current = null;
            }
            setTidNodeId(tableNodeId);
            setTableInfoDialogOpen(true);
          }}
        />
      ),
    }),
    [],
  );
  const tidNode = nodes.find((node) => node.id === tidNodeId);
  const tableInfoDialogHandlers = tidNode
    ? createTableInfoDialogHandlers({
        tidNode,
        updateTable,
        setNodes,
        setEdges,
        setTableInfoDialogOpen,
        clearTidNode,
        scheduleTidNodeClear,
      })
    : null;

  useEffect(() => {
    return () => {
      if (dialogNodeClearTimeoutRef.current) {
        clearTimeout(dialogNodeClearTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (tidNodeId && !tidNode) {
      setTableInfoDialogOpen(false);
      if (dialogNodeClearTimeoutRef.current) {
        clearTimeout(dialogNodeClearTimeoutRef.current);
        dialogNodeClearTimeoutRef.current = null;
      }
      setTidNodeId(null);
    }
  }, [tidNode, tidNodeId]);

  useEffect(() => {
    setNodes(createNodes(useDiagramStore.getState().tables));
  }, [setNodes, tablesVersion]);

  useEffect(() => {
    setEdges(createEdges(useDiagramStore.getState().relationships));
  }, [relationshipsVersion, setEdges]);

  const handleClickInTableMode = createClickInTableModeHandler(
    addNodes,
    screenToFlowPosition,
  );

  const handlePaneClick = (event: MouseEvent) => {
    if (isReadOnly) {
      return;
    }
    switch (diagramMode) {
      case DiagramMode.Table:
        handleClickInTableMode(event.clientX, event.clientY);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative flex h-full w-full">
      <ReactFlow
        className={cn("flex-1", settings.cursorClass)}
        style={{ width: "100%", height: "100%" }}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={{
          cardinality: CardinalityEdge,
        }}
        onPaneClick={handlePaneClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable={settings.nodesDraggable}
        nodesConnectable={settings.nodesConnectable}
        elementsSelectable={settings.elementsSelectable}
        selectionOnDrag={settings.selectionOnDrag}
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
    </div>
  );
};
