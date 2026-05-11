import { loadDiagram, validateDiagram } from "@/api/diagram";
import { useDiagramStore } from "@/stores/diagramStore";
import { useErmFileStore } from "@/stores/ermFileStore";
import { useProblemsStore } from "@/stores/problemsStore";

export async function applyDiagramFromFile(filePath: string) {
  const { clearProblems } = useProblemsStore.getState();
  clearProblems();

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
  void refreshProblems(filePath);
}

async function refreshProblems(filePath: string) {
  const problems = await validateDiagram(filePath).catch(() => []);
  const { filePath: currentFilePath } = useErmFileStore.getState();

  if (currentFilePath !== filePath) {
    return;
  }

  const { setProblems } = useProblemsStore.getState();
  setProblems(problems);
}
