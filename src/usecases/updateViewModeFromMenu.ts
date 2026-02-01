import { useDiagramStore } from "@/stores/diagramStore";
import { useErmFileStore } from "@/stores/ermFileStore";

export async function updateViewMode(filePath: string) {
  const { settings, tables, relationships, columnGroups } =
    await loadDiagram(filePath);
  const { setSettings, setTables, setRelationships, setColumnGroups } =
    useDiagramStore.getState();
  setSettings(settings);
  setTables(tables);
  setRelationships(relationships);
  setColumnGroups(columnGroups);
  const { setLoaded, setFilePath } = useErmFileStore.getState();
  setLoaded(true);
  setFilePath(filePath);
}
