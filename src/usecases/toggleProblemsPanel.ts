import { useViewModeStore } from "@/stores/viewModeStore";

export function toggleProblemsPanel() {
  const { isProblemsPanelVisible, setProblemsPanelVisible } =
    useViewModeStore.getState();

  setProblemsPanelVisible(!isProblemsPanelVisible);
}
