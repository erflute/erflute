import type { ColumnGroupsResponse } from "./columnGroups";
import { type DiagramSettingsResponse } from "./diagramSettings";
import type { DiagramWalkersResponse } from "./diagramWalkers";

export type DiagramResponse = {
  diagramSettings: DiagramSettingsResponse;
  diagramWalkers: DiagramWalkersResponse;
  columnGroups?: ColumnGroupsResponse["columnGroups"];
};
