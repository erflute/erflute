import { useMemo, useRef } from "react";
import { CheckCircleIcon, KeyIcon } from "@heroicons/react/16/solid";
import { findGroupFromName } from "@/features/dbDiagram/domain/findGroupFromName";
import { formatColumnType } from "@/features/dbDiagram/domain/formatColumnType";
import { cn } from "@/lib/utils";
import { useDiagramStore } from "@/stores/diagramStore";
import { useViewModeStore } from "@/stores/viewModeStore";
import type { Column } from "@/types/domain/column";
import type { ColumnGroup } from "@/types/domain/columnGroup";
import { isColumnGroupName, type ColumnGroupName } from "@/types/domain/table";
import type { TableCardProps } from "./types";
import { useMinTableSize } from "./useMinTableSize";

function formatColumnLabel(column: Column) {
  if (column.columnType) {
    return `${column.physicalName}: ${formatColumnType(column)}`;
  }
  return column.physicalName;
}

function flatColumnsFrom(
  columns: (Column | ColumnGroupName)[],
  columnGroups: ColumnGroup[],
): Column[] {
  return columns.flatMap((column) => {
    if (isColumnGroupName(column)) {
      const group = findGroupFromName(column, columnGroups);
      return group ? group.columns : [];
    }
    return [column];
  });
}

export function TableCard({
  width,
  height,
  setWidth,
  setHeight,
  data,
  onHeaderDoubleClick,
}: TableCardProps) {
  const { isReadOnly } = useViewModeStore();
  const columnGroups = useDiagramStore((state) => state.columnGroups);
  const flatColumns = useMemo(
    () => flatColumnsFrom(data.columns ?? [], columnGroups),
    [columnGroups, data.columns],
  );
  const indexes = useMemo(() => data.indexes ?? [], [data.indexes]);

  // Ref to the variable table content used to determine the TableCard size.
  // Only the content area is measured to keep the TableCard dimensions
  // in sync with the rendered layout.
  const contentRef = useRef<HTMLDivElement>(null);
  useMinTableSize(contentRef, width, height, setWidth, setHeight);
  return (
    <div
      className={cn(
        "flex flex-col min-h-0 rounded-sm",
        isReadOnly && "nopan nodrag cursor-default",
      )}
      style={{
        width,
        height,
        background: `rgb(${data.color.r}, ${data.color.g}, ${data.color.b})`,
      }}
    >
      <div
        onDoubleClick={onHeaderDoubleClick}
        className="flex items-center justify-center h-5 cursor-pointer"
      >
        <h1 className="text-sm">{data.physicalName}</h1>
      </div>
      <div className="nodrag flex-1 w-full h-full px-1 pb-1">
        <div className="w-full h-full bg-white">
          <div ref={contentRef} className="w-fit h-fit">
            {flatColumns.map((column) => (
              <p
                key={column.physicalName}
                className="flex items-center text-[0.625rem] leading-5 whitespace-nowrap"
              >
                <span className="flex items-center justify-center w-4 h-4">
                  {column.primaryKey && (
                    <KeyIcon
                      aria-label={`Column ${column.physicalName} is primary key`}
                      width={10}
                      height={10}
                      className="text-yellow-500"
                    />
                  )}
                  {!!column.referredColumn && (
                    <KeyIcon
                      aria-label={`Column ${column.physicalName} is foreign key`}
                      width={10}
                      height={10}
                      className="text-gray-400"
                    />
                  )}
                </span>
                <span className="flex items-center justify-center w-4 h-4">
                  {column.notNull && (
                    <CheckCircleIcon
                      aria-label={`Column ${column.physicalName} is not null`}
                      width={10}
                      height={10}
                      className="text-green-400"
                    />
                  )}
                </span>
                <span>{formatColumnLabel(column)}</span>
              </p>
            ))}
            {indexes.length > 0 && (
              <div className="mt-1 border-t border-dashed border-slate-300 pt-1 text-[0.625rem] leading-4 text-slate-700">
                <p className="whitespace-nowrap pl-2">
                  &lt;&lt; index &gt;&gt;
                </p>
                {indexes.map((index, indexPosition) => (
                  <p
                    key={`${index.name}-${indexPosition}`}
                    className="whitespace-nowrap pl-5"
                  >
                    {index.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
