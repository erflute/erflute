import { invoke } from "@tauri-apps/api/core";
import { mapColumnGroupsFrom } from "@/domain/mappers/columnGroupMapper";
import { mapSettingsFrom } from "@/domain/mappers/settingsMapper";
import {
  mapRelationshipsFrom,
  mapTablesFrom,
} from "@/domain/mappers/tableMapper";
import { mapVDiagramsFrom } from "@/domain/mappers/vdiagramMapper";
import type { DiagramResponse } from "@/types/api/diagram";
import type { ColumnGroup } from "@/types/domain/columnGroup";
import type { Relationship } from "@/types/domain/relationship";
import { type Settings } from "@/types/domain/settings";
import type { Table } from "@/types/domain/table";
import type { VirtualDiagram } from "@/types/domain/vdiagram";

export async function loadDiagram(filename: string): Promise<{
  settings: Settings;
  tables: Table[];
  relationships: Relationship[];
  columnGroups: ColumnGroup[];
  vdiagrams: VirtualDiagram[];
}> {
  const diagram = await invoke<DiagramResponse>("load_diagram", { filename });
  const settings = diagram.diagramSettings;
  const tables = diagram.diagramWalkers.tables ?? [];
  const columnGroups = diagram.columnGroups?.columnGroups ?? [];
  const vdiagrams = diagram.vdiagrams.vdiagrams ?? [];
  return {
    settings: mapSettingsFrom(settings),
    tables: mapTablesFrom(tables),
    relationships: mapRelationshipsFrom(tables),
    columnGroups: mapColumnGroupsFrom(columnGroups),
    vdiagrams: mapVDiagramsFrom(vdiagrams),
  };
}
