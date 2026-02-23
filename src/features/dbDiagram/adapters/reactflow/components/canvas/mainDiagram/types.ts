import type { DiagramMode } from "@/types/domain/diagramMode";

export type MainDiagramSettings = {
  cursorClass: string;
  nodesDraggable: boolean;
  nodesConnectable: boolean;
  elementsSelectable: boolean;
  selectionOnDrag: boolean;
};

export function getSettings(
  isReadOnly: boolean,
  diagramMode: DiagramMode | null,
  settingsByMode: Record<DiagramMode, MainDiagramSettings>,
): MainDiagramSettings {
  if (isReadOnly || !diagramMode) {
    return {
      cursorClass: "cursor-default",
      nodesDraggable: true,
      nodesConnectable: false,
      elementsSelectable: false,
      selectionOnDrag: false,
    };
  }
  return settingsByMode[diagramMode];
}
