import { create } from "zustand";
import { updateRelation } from "@/domain/diagram/updateRelation";
import { updateTableAndRef } from "@/domain/diagram/updateTable";
import type { ColumnGroup } from "@/types/domain/columnGroup";
import type { Relationship } from "@/types/domain/relationship";
import type { Table } from "@/types/domain/table";

type DiagramStore = {
  tables: Table[];
  relationships: Relationship[];
  columnGroups: ColumnGroup[];
  tablesVersion: number;
  relationshipsVersion: number;
  setTables: (tables: Table[]) => void;
  updateTable: (table: Table, previousPhysicalName: string) => void;
  setRelationships: (relationships: Relationship[]) => void;
  updateRelationship: (relationship: Relationship, previousName: string) => void;
  setColumnGroups: (columnGroups: ColumnGroup[]) => void;
};

export const useDiagramStore = create<DiagramStore>((set) => ({
  tables: [],
  relationships: [],
  columnGroups: [],
  // Version counters are reserved for full list replacements (setTables/setRelationships),
  // so incremental updates do not trigger expensive full refreshes.
  tablesVersion: 0,
  relationshipsVersion: 0,
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
}));
