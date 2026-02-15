import { create } from "zustand";
import { updateRelation } from "@/domain/diagram/updateRelation";
import { updateTableAndRef } from "@/domain/diagram/updateTable";
import type { ColumnGroup } from "@/types/domain/columnGroup";
import type { Relationship } from "@/types/domain/relationship";
import { ViewMode, type Settings } from "@/types/domain/settings";
import type { Table } from "@/types/domain/table";
import type { VirtualDiagram } from "@/types/domain/vdiagram";

const initialSettings: Settings = {
  database: "",
  viewMode: ViewMode.Logical,
};

type DiagramStore = {
  settings: Settings;
  tables: Table[];
  relationships: Relationship[];
  columnGroups: ColumnGroup[];
  vdiagrams: VirtualDiagram[];
  tablesVersion: number;
  relationshipsVersion: number;
  setSettings: (settings: Settings) => void;
  setTables: (tables: Table[]) => void;
  updateTable: (table: Table, previousPhysicalName: string) => void;
  setRelationships: (relationships: Relationship[]) => void;
  updateRelationship: (
    relationship: Relationship,
    previousName: string,
  ) => void;
  setColumnGroups: (columnGroups: ColumnGroup[]) => void;
  setVDiagrams: (vdiagrams: VirtualDiagram[]) => void;
};

export const useDiagramStore = create<DiagramStore>((set) => ({
  settings: initialSettings,
  tables: [],
  relationships: [],
  columnGroups: [],
  vdiagrams: [],
  // Version counters are reserved for full list replacements (setTables/setRelationships),
  // so incremental updates do not trigger expensive full refreshes.
  tablesVersion: 0,
  relationshipsVersion: 0,
  setSettings: (settings: Settings) => set({ settings }),
  setTables: (tables: Table[]) =>
    set((state) => ({ tables, tablesVersion: state.tablesVersion + 1 })),
  updateTable: (table: Table, previousPhysicalName: string) =>
    set((state) => {
      const result = updateTableAndRef({
        tables: state.tables,
        relationships: state.relationships,
        table,
        previousPhysicalName,
      });
      if (!result) {
        return state;
      }
      return {
        tables: result.tables,
        relationships: result.relationships,
      };
    }),
  setRelationships: (relationships: Relationship[]) =>
    set((state) => ({
      relationships,
      relationshipsVersion: state.relationshipsVersion + 1,
    })),
  updateRelationship: (relationship: Relationship, previousName: string) =>
    set((state) => {
      const nextRelationships = updateRelation({
        relationships: state.relationships,
        relationship,
        previousName,
      });
      if (!nextRelationships) {
        return state;
      }
      return { relationships: nextRelationships };
    }),
  setColumnGroups: (columnGroups: ColumnGroup[]) => set({ columnGroups }),
  setVDiagrams: (vdiagrams: VirtualDiagram[]) => set({ vdiagrams }),
}));
