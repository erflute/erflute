import { useDiagramStore } from "@/stores/diagramStore";
import { type ViewMode } from "@/types/domain/settings";

export function updateViewMode(viewMode: ViewMode) {
  const { settings, setSettings } = useDiagramStore.getState();
  setSettings({
    ...settings,
    viewMode,
  });
}
