import { useEffect } from "react";
import type { MouseEvent } from "react";
import { useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import {
  createEdges,
  createNodes,
} from "@/features/dbDiagram/adapters/reactflow/mappers";
import { modeSettings } from "@/features/dbDiagram/adapters/reactflow/modeSettings";
import { useDiagramStore } from "@/stores/diagramStore";
import { useViewModeStore } from "@/stores/viewModeStore";
import { DiagramMode } from "@/types/domain/diagramMode";
import { FlowSurface } from "../flowSurface";
import { createClickInTableModeHandler } from "../handlers";
import { getSettings } from "./types";

export const MainDiagram = () => {
  const { isReadOnly, diagramMode } = useViewModeStore();
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
  const settings = getSettings(isReadOnly, diagramMode, modeSettings);
  const { addNodes, screenToFlowPosition } = useReactFlow();

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
    <FlowSurface
      nodes={nodes}
      edges={edges}
      setNodes={setNodes}
      setEdges={setEdges}
      cursorClass={settings.cursorClass}
      nodesDraggable={settings.nodesDraggable}
      nodesConnectable={settings.nodesConnectable}
      elementsSelectable={settings.elementsSelectable}
      selectionOnDrag={settings.selectionOnDrag}
      onPaneClick={handlePaneClick}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    />
  );
};
