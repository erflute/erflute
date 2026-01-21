import type { Relationship } from "@/types/domain/relationship";
import type { Table } from "@/types/domain/table";
import { parseReference, stringifyReference } from "../parsers/referenceParser";

type UpdateTableParams = {
  tables: Table[];
  relationships: Relationship[];
  table: Table;
  previousPhysicalName: string;
};

type UpdateTableResult = {
  tables: Table[];
  relationships: Relationship[];
};

const renameReference = (
  reference: string,
  previousPhysicalName: string,
  nextPhysicalName: string,
) => {
  const { prefix, tableName } = parseReference(reference);
  if (tableName !== previousPhysicalName) {
    return reference;
  }
  return stringifyReference({
    prefix,
    tableName: nextPhysicalName,
  });
};

export const updateTableAndRef = ({
  tables,
  relationships,
  table,
  previousPhysicalName,
}: UpdateTableParams): UpdateTableResult | null => {
  const tableIndex = tables.findIndex(
    (item) => item.physicalName === previousPhysicalName,
  );
  if (tableIndex === -1) {
    return null;
  }
  const nextTables = tables.slice();
  nextTables[tableIndex] = table;
  if (previousPhysicalName === table.physicalName) {
    return { tables: nextTables, relationships };
  }
  const nextRelationships = relationships.map((relationship) => {
    const source = renameReference(
      relationship.source,
      previousPhysicalName,
      table.physicalName,
    );
    const target = renameReference(
      relationship.target,
      previousPhysicalName,
      table.physicalName,
    );
    if (source === relationship.source && target === relationship.target) {
      return relationship;
    }
    return { ...relationship, source, target };
  });
  return { tables: nextTables, relationships: nextRelationships };
};
