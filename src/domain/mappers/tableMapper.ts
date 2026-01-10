import { parseReference } from "@/domain/parsers/referenceParser";
import type { TableResponse } from "@/types/api/diagramWalkers";
import type { Column } from "@/types/domain/column";
import { parseColumnType } from "@/types/domain/columnType";
import type { Relationship } from "@/types/domain/relationship";
import type {
  CompoundUniqueKey,
  Index,
  IndexColumn,
  Table,
} from "@/types/domain/table";

export function mapTablesFrom(tableResponses: TableResponse[]): Table[] {
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
          columnType: item.columnType
            ? parseColumnType(item.columnType)
            : undefined,
          length: item.length,
          decimal: item.decimal,
          unsigned: item.unsigned,
          notNull: item.notNull,
          unique: item.uniqueKey,
          defaultValue: item.defaultValue,
          primaryKey: item.primaryKey,
          autoIncrement: item.autoIncrement,
          referredColumn: item.referredColumn,
        } satisfies Column;
      }),
      indexes: table.indexes.indexes?.map((index) => {
        return {
          name: index.name,
          indexType: index.indexType,
          description: index.description,
          fullText: index.fullText,
          nonUnique: index.nonUnique,
          columns: index.columns.columns.map((column) => {
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
            columns: uniqueKey.columns.columns.map((column) => {
              const { columnName } = parseReference(column.columnId);
              return columnName ?? "";
            }),
          } satisfies CompoundUniqueKey;
        },
      ),
    } satisfies Table;
  });
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
        parentCardinality: relationship.parentCardinality,
        childCardinality: relationship.childCardinality,
      } satisfies Relationship;
    });
}
