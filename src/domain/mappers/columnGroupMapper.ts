import type { ColumnGroupResponse } from "@/types/api/columnGroups";
import type { Column } from "@/types/domain/column";
import type { ColumnGroup } from "@/types/domain/columnGroup";
import { parseColumnType } from "@/types/domain/columnType";

export function mapColumnGroupsFrom(
  columnGroupResponses: ColumnGroupResponse[],
): ColumnGroup[] {
  return columnGroupResponses.map((columnGroup) => {
    const normalColumns = columnGroup.columns.normalColumns ?? [];
    return {
      columnGroupName: columnGroup.columnGroupName,
      columns: normalColumns.map((column) => {
        return {
          physicalName: column.physicalName,
          logicalName: column.logicalName,
          description: column.description,
          columnType: parseColumnType(column.columnType),
          length: column.length,
          decimal: column.decimal,
          enumArgs: column.args,
          notNull: column.notNull,
          unique: column.uniqueKey,
          unsigned: column.unsigned,
          defaultValue: column.defaultValue,
        } satisfies Column;
      }),
    } satisfies ColumnGroup;
  });
}
