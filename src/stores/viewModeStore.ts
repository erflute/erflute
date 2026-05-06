import { create } from "zustand";
import type { DiagramMode } from "@/types/domain/diagramMode";

type ViewModeStore = {
  isReadOnly: boolean;
  setReadOnly: (value: boolean) => void;
  diagramMode: DiagramMode | null;
  setDiagramMode: (mode: DiagramMode | null) => void;
  isProblemsPanelVisible: boolean;
  setProblemsPanelVisible: (value: boolean) => void;
};

export const useViewModeStore = create<ViewModeStore>((set) => ({
  // First release ships in view-only mode, so this stays true until editing features call setReadOnly(false) in the future.
  isReadOnly: true,
  setReadOnly: (value) => set({ isReadOnly: value }),
  diagramMode: null,
  setDiagramMode: (mode) => set({ diagramMode: mode }),
  isProblemsPanelVisible: false,
  setProblemsPanelVisible: (value) => set({ isProblemsPanelVisible: value }),
}));
