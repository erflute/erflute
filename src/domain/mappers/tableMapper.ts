import type { NormalColumn, TableResponse } from "@/types/api/diagramWalkers";
import type { Column } from "@/types/domain/column";
import { parseColumnType, type ColumnType } from "@/types/domain/columnType";
import type { Relationship } from "@/types/domain/relationship";
import type {
  CompoundUniqueKey,
  Index,
  IndexColumn,
  Table,
} from "@/types/domain/table";
import { parseReference } from "../parsers/referenceParser";

function getColumnType(
  item: NormalColumn,
  tableResponses: TableResponse[],
): ColumnType | undefined {
  if (item.columnType) {
    return parseColumnType(item.columnType);
  }
  if (item.referredColumn) {
    const { tableName, columnName } = parseReference(item.referredColumn);
    if (!tableName || !columnName) {
      return undefined;
    }
    const table = tableResponses.find(
      (table) => tableName === table.physicalName,
    );
    if (!table) {
      return undefined;
    }
    const items = table.columns.items;
    if (!items) {
      return undefined;
    }
    const column = items
      .filter((clm) => typeof clm !== "string")
      .find((clm) => columnName === clm.physicalName);
    return column?.columnType ? parseColumnType(column.columnType) : undefined;
  }
  return undefined;
}

export function mapTablesFrom(tableResponses: TableResponse[]): Table[] {
  if (!tableResponses) {
    return [];
  }
  return tableResponses.map((table) => {
    return {
      color: {
        r: table.color.r,
        g: table.color.g,
        b: table.color.b,
      },
      x: table.x,
      y: table.y,
      width: table.width,
      height: table.height,
      physicalName: table.physicalName,
      logicalName: table.logicalName,
      description: table.description,
      tableConstraint: table.tableConstraint,
      primaryKeyName: table.primaryKeyName,
      option: table.option,
      columns: table.columns.items?.map((item) => {
        if (typeof item === "string") {
          return item;
        }
        return {
          physicalName: item.physicalName,
          logicalName: item.logicalName,
          description: item.description,
          columnType: getColumnType(item, tableResponses),
          length: item.length,
          decimal: item.decimal,
          enumArgs: item.args,
          unsigned: item.unsigned,
          notNull: item.notNull,
          unique: item.uniqueKey,
          defaultValue: item.defaultValue,
          primaryKey: item.primaryKey,
          autoIncrement: item.autoIncrement,
          referredColumn: item.referredColumn,
        } satisfies Column;
      }),
      indexes: table.indexes?.map((index) => {
        return {
          name: index.name,
          indexType: index.indexType,
          description: index.description,
          fullText: index.fullText,
          nonUnique: index.nonUnique,
          columns: index.columns.map((column) => {
            return {
              columnId: column.columnId,
              desc: column.desc,
            } satisfies IndexColumn;
          }),
        } satisfies Index;
      }),
      compoundUniqueKeys: table.compoundUniqueKeyList.compoundUniqueKeys?.map(
        (uniqueKey) => {
          return {
            name: uniqueKey.name,
            columns: uniqueKey.columns.map((column) => column.columnId),
          } satisfies CompoundUniqueKey;
        },
      ),
    } satisfies Table;
  });
}

function getPrimaryKey(source: string, tables: TableResponse[]): string {
  const { tableName } = parseReference(source);
  const sourceTable = tables.find((table) => table.physicalName === tableName)!;
  return sourceTable.columns
    .items!.filter((item) => typeof item !== "string")
    .find((item) => item.primaryKey)!.physicalName;
}

function getReferredColumnOptions(
  source: string,
  tables: TableResponse[],
): string[] {
  const { tableName } = parseReference(source);
  const sourceTable = tables.find((table) => table.physicalName === tableName)!;
  const columnNames =
    sourceTable.columns.items
      ?.filter((item) => typeof item !== "string")
      .filter((item) => item.primaryKey || item.uniqueKey)
      .map((item) => item.physicalName) ?? [];
  const coumpoundUniqueKeyNames =
    sourceTable.compoundUniqueKeyList.compoundUniqueKeys?.map(
      (uniqueKey) => uniqueKey.name,
    ) ?? [];
  return [...columnNames, ...coumpoundUniqueKeyNames];
}

export function mapRelationshipsFrom(
  tableResponses: TableResponse[],
): Relationship[] {
  return tableResponses
    .filter((table) => !!table.connections.relationships)
    .flatMap((table) => table.connections.relationships)
    .map((relationship) => {
      return {
        name: relationship.name,
        source: relationship.source,
        target: relationship.target,
        bendpoints: relationship.bendpoints,
        fkColumnNames: relationship.fkColumns.fkColumn.map(
          (column) => column.fkColumnName,
        ),
        parentCardinality: relationship.parentCardinality,
        childCardinality: relationship.childCardinality,
        referredColumn: relationship.referenceForPk
          ? getPrimaryKey(relationship.source, tableResponses)
          : (relationship.referredSimpleUniqueColumn ??
            relationship.referredCompoundUniqueKey!),
        referredColumnOptions: getReferredColumnOptions(
          relationship.source,
          tableResponses,
        ),
        onDeleteAction: relationship.onDeleteAction,
        onUpdateAction: relationship.onUpdateAction,
      } satisfies Relationship;
    });
}
