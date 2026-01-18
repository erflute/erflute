import { create } from "zustand";
import {
  parseReference,
  stringifyReference,
} from "@/domain/parsers/referenceParser";
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
  updateTable: (table: Table, previousPhysicalName?: string) => void;
  setRelationships: (relationships: Relationship[]) => void;
  updateRelationship: (
    relationship: Relationship,
    previousName?: string,
  ) => void;
  setColumnGroups: (columnGroups: ColumnGroup[]) => void;
};

export const useDiagramStore = create<DiagramStore>((set) => ({
  tables: [],
  relationships: [],
  columnGroups: [],
  tablesVersion: 0,
  relationshipsVersion: 0,
  setTables: (tables: Table[]) =>
    set((state) => ({ tables, tablesVersion: state.tablesVersion + 1 })),
  updateTable: (table: Table, previousPhysicalName?: string) =>
    set((state) => {
      const targetName = previousPhysicalName ?? table.physicalName;
      const tableIndex = state.tables.findIndex(
        (item) => item.physicalName === targetName,
      );
      if (tableIndex === -1) {
        return state;
      }
      const nextTables = state.tables.slice();
      nextTables[tableIndex] = table;
      if (
        !previousPhysicalName ||
        previousPhysicalName === table.physicalName
      ) {
        return { tables: nextTables };
      }
      const renameReference = (reference: string) => {
        const { prefix, tableName, columnName } = parseReference(reference);
        if (tableName !== previousPhysicalName) {
          return reference;
        }
        return stringifyReference({
          prefix,
          tableName: table.physicalName,
          columnName,
        });
      };
      const nextRelationships = state.relationships.map((relationship) => {
        const source = renameReference(relationship.source);
        const target = renameReference(relationship.target);
        if (source === relationship.source && target === relationship.target) {
          return relationship;
        }
        return { ...relationship, source, target };
      });
      return {
        tables: nextTables,
        relationships: nextRelationships,
      };
    }),
  setRelationships: (relationships: Relationship[]) =>
    set((state) => ({
      relationships,
      relationshipsVersion: state.relationshipsVersion + 1,
    })),
  updateRelationship: (relationship: Relationship, previousName?: string) =>
    set((state) => {
      const targetName = previousName ?? relationship.name;
      const relationshipIndex = state.relationships.findIndex(
        (item) => item.name === targetName,
      );
      if (relationshipIndex === -1) {
        return state;
      }
      const nextRelationships = state.relationships.slice();
      nextRelationships[relationshipIndex] = relationship;
      return { relationships: nextRelationships };
    }),
  setColumnGroups: (columnGroups: ColumnGroup[]) => set({ columnGroups }),
}));
