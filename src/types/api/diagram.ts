import type { ColumnGroupsResponse } from "./columnGroups";
import { type DiagramSettingsResponse } from "./diagramSettings";
import type { DiagramWalkersResponse } from "./diagramWalkers";
import type { VDiagramsResponse } from "./vdiagrams";

export type DiagramResponse = {
  diagramSettings: DiagramSettingsResponse;
  diagramWalkers: DiagramWalkersResponse;
  vdiagrams: VDiagramsResponse;
  columnGroups: ColumnGroupsResponse;
};
