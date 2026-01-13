import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { parseReference } from "@/domain/parsers/referenceParser";
import { findGroupFromName } from "@/features/dbDiagram/domain/findGroupFromName";
import { cn } from "@/lib/utils";
import { useDiagramStore } from "@/stores/diagramStore";
import { useViewModeStore } from "@/stores/viewModeStore";
import { isColumnGroupName, type Index } from "@/types/domain/table";
import { createIndexContentHandlers } from "./handlers";
import { type IndexContentProps } from "./types";

const NEW_KEY_VALUE = "new";
const SELECT_KEY_VALUE = "select";
const INDEX_TYPE_OPTIONS = ["BTREE"];

function createInitialIndex(tableName: string): Index {
  return {
    name: `IX_${tableName.toUpperCase()}_XXX`,
    indexType: INDEX_TYPE_OPTIONS[0],
    nonUnique: true,
    columns: [],
  };
}

function getDefaultIndexValue(isReadOnly: boolean) {
  return isReadOnly ? SELECT_KEY_VALUE : NEW_KEY_VALUE;
}

export function IndexContent({ data, setData }: IndexContentProps) {
  const { isReadOnly } = useViewModeStore();
  const columnGroups = useDiagramStore((state) => state.columnGroups);
  const [selectedIndexIndex, setSelectedIndexIndex] = useState<number | null>(
    null,
  );
  const [selectedIndex, setSelectedIndex] = useState<Index | null>(null);
  const [selectedAvailableColumnIndex, setSelectedAvailableColumnIndex] =
    useState<number | null>(null);
  const [selectedIndexColumnIndex, setSelectedIndexColumnIndex] = useState<
    number | null
  >(null);

  const indexes = useMemo(() => data.indexes ?? [], [data.indexes]);

  useEffect(() => {
    const index =
      selectedIndexIndex !== null
        ? indexes[selectedIndexIndex]
        : createInitialIndex(data.physicalName);
    setSelectedIndex(index);
  }, [indexes, selectedIndexIndex]);

  const availableColumns: string[] = useMemo(() => {
    const indexColumnNames =
      selectedIndex?.columns.map((column) => {
        const { columnName } = parseReference(column.columnId);
        return columnName;
      }) ?? [];
    return (data.columns ?? [])
      .flatMap((column) => {
        if (isColumnGroupName(column)) {
          const group = findGroupFromName(column, columnGroups);
          if (!group) {
            return [];
          }
          return group.columns.map((groupColumn) => groupColumn.physicalName);
        }
        return [column.physicalName];
      })
      .filter((column) => !indexColumnNames.includes(column));
  }, [columnGroups, data.columns, selectedIndex]);

  const {
    handleSelectIndex,
    handleAddIndex,
    handleUpdateIndex,
    handleDeleteIndex,
    handleAddIndexColumn,
    handleRemoveIndexColumn,
    handleMoveIndexColumnUp,
    handleMoveIndexColumnDown,
  } = createIndexContentHandlers({
    defaultIndexValue: getDefaultIndexValue(isReadOnly),
    selectedIndex,
    selectedIndexIndex,
    setSelectedIndexIndex,
    setSelectedIndex,
    selectedAvailableColumnIndex,
    selectedIndexColumnIndex,
    setSelectedIndexColumnIndex,
    data,
    setData,
  });

  return (
    <section className="flex h-full flex-col gap-4 text-sm text-slate-700">
      <label className="flex flex-col gap-2" htmlFor="index-select">
        <span className="font-medium text-slate-600">Index</span>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <select
            id="index-select"
            value={
              selectedIndexIndex == null
                ? getDefaultIndexValue(isReadOnly)
                : String(selectedIndexIndex)
            }
            onChange={(event) => handleSelectIndex(event.target.value)}
            className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm shadow-xs focus-visible:border-blue-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-200 md:flex-1"
          >
            {isReadOnly ? (
              <option value={SELECT_KEY_VALUE}>Select index</option>
            ) : (
              <option value={NEW_KEY_VALUE}>New index</option>
            )}
            {indexes.map((index, indexPosition) => (
              <option
                key={`${index.name}-${indexPosition}`}
                value={String(indexPosition)}
              >
                {index.name}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isReadOnly || selectedIndexIndex !== null}
              onClick={handleAddIndex}
            >
              Add
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isReadOnly || selectedIndexIndex === null}
              onClick={handleUpdateIndex}
            >
              Update
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isReadOnly || selectedIndexIndex === null}
              onClick={handleDeleteIndex}
            >
              Delete
            </Button>
          </div>
        </div>
      </label>

      <div className="flex justify-between">
        <div className="flex gap-4 items-center">
          <label className="font-medium text-slate-600" htmlFor="index-name">
            Index Name
          </label>
          <Input
            id="index-name"
            value={selectedIndex?.name ?? ""}
            readOnly={isReadOnly}
            onChange={(event) => {
              if (selectedIndex === null) {
                return;
              }
              setSelectedIndex({
                ...selectedIndex,
                name: event.target.value,
              });
            }}
            className="h-8 text-sm w-60"
          />
        </div>

        <div className="flex gap-4 items-center">
          <label className="font-medium text-slate-600" htmlFor="index-type">
            Index Type
          </label>
          <select
            id="index-type"
            value={selectedIndex?.indexType ?? ""}
            disabled={isReadOnly}
            onChange={(event) => {
              if (selectedIndex === null) {
                return;
              }
              setSelectedIndex({
                ...selectedIndex,
                indexType: event.target.value,
              });
            }}
            className="h-8 w-60 rounded-md border border-slate-300 bg-white text-sm shadow-xs focus-visible:border-blue-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-200 disabled:bg-slate-100"
          >
            <option value="" disabled>
              Select index type
            </option>
            {INDEX_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <Checkbox
            checked={!(selectedIndex?.nonUnique ?? true)}
            onCheckedChange={(value) => {
              if (selectedIndex === null) {
                return;
              }
              setSelectedIndex({
                ...selectedIndex,
                nonUnique: !value,
              });
            }}
            disabled={isReadOnly}
            aria-label="Mark index as unique"
          />
          UNIQUE
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <Checkbox
            checked={selectedIndex?.fullText ? true : false}
            onCheckedChange={(value) => {
              if (selectedIndex === null) {
                return;
              }
              setSelectedIndex({
                ...selectedIndex,
                fullText: value ? true : false,
              });
            }}
            disabled={isReadOnly}
            aria-label="Mark index as full text"
          />
          FULL TEXT
        </label>
      </div>

      <label className="flex flex-col gap-2" htmlFor="index-description">
        <span className="font-medium text-slate-600">Description</span>
        <Textarea
          id="index-description"
          value={selectedIndex?.description ?? ""}
          readOnly={isReadOnly}
          onChange={(event) => {
            if (selectedIndex === null) {
              return;
            }
            setSelectedIndex({
              ...selectedIndex,
              description: event.target.value,
            });
          }}
          className="min-h-[64px] resize-none"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-[minmax(0,320px)_auto_minmax(0,320px)_auto]">
        <div className="flex flex-col gap-2">
          <span className="font-medium text-slate-600">Available columns</span>
          <div className="h-40 overflow-hidden rounded-md border border-slate-200 bg-white">
            <div className="h-full overflow-y-auto">
              <table className="min-w-full table-fixed divide-y divide-slate-200 text-sm">
                <colgroup>
                  <col className="w-full" />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-2 py-2 text-left">Column Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                  {availableColumns.map((column, columnIndex) => (
                    <tr
                      key={column}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-blue-50",
                        selectedAvailableColumnIndex === columnIndex &&
                          "bg-blue-100/70",
                      )}
                      onClick={() => {
                        setSelectedAvailableColumnIndex(columnIndex);
                      }}
                    >
                      <td className="px-2 py-2">{column}</td>
                    </tr>
                  ))}
                  {availableColumns.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-center text-slate-400">
                        Columns will appear here once added.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isReadOnly || selectedAvailableColumnIndex == null}
            onClick={() => {
              if (selectedAvailableColumnIndex !== null) {
                handleAddIndexColumn(
                  availableColumns[selectedAvailableColumnIndex],
                );
              }
            }}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isReadOnly || selectedIndexColumnIndex == null}
            onClick={handleRemoveIndexColumn}
          >
            Remove
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-medium text-slate-600">Index Column</span>
          <div className="flex gap-2">
            <div className="h-40 flex-1 overflow-hidden rounded-md border border-slate-200 bg-white">
              <div className="h-full overflow-y-auto">
                <table className="min-w-full table-fixed divide-y divide-slate-200 text-sm">
                  <colgroup>
                    <col className="w-4/5" />
                    <col className="w-1/5" />
                  </colgroup>
                  <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="sticky top-0 bg-slate-100 px-3 py-2 text-left">
                        Column Name
                      </th>
                      <th className="sticky top-0 bg-slate-100 px-3 py-2 text-center">
                        Desc
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                    {(selectedIndex?.columns ?? []).map(
                      (column, indexPosition) => {
                        const { columnName } = parseReference(column.columnId);
                        return (
                          <tr
                            key={`${column.columnId}-${indexPosition}`}
                            className={cn(
                              "cursor-pointer transition-colors hover:bg-blue-50",
                              selectedIndexColumnIndex === indexPosition &&
                                "bg-blue-100/70",
                            )}
                            onClick={() => {
                              setSelectedIndexColumnIndex(indexPosition);
                            }}
                          >
                            <td className="px-3 py-2">{columnName ?? ""}</td>
                            <td className="px-3 py-2 text-center">
                              <Checkbox
                                checked={column.desc ? true : false}
                                onCheckedChange={(value) => {
                                  if (selectedIndex === null) {
                                    return;
                                  }
                                  setSelectedIndex({
                                    ...selectedIndex,
                                    columns: selectedIndex.columns.map(
                                      (targetColumn, targetIndex) => {
                                        if (targetIndex !== indexPosition) {
                                          return targetColumn;
                                        }
                                        return {
                                          ...targetColumn,
                                          desc: value ? true : false,
                                        };
                                      },
                                    ),
                                  });
                                }}
                                disabled={isReadOnly}
                                aria-label="Sort descending"
                              />
                            </td>
                          </tr>
                        );
                      },
                    )}
                    {(!selectedIndex || selectedIndex.columns.length === 0) && (
                      <tr>
                        <td
                          className="px-3 py-6 text-center text-slate-400"
                          colSpan={2}
                        >
                          Select an index to see its columns.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isReadOnly || selectedIndexColumnIndex == null}
            onClick={handleMoveIndexColumnUp}
          >
            Up
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isReadOnly || selectedIndexColumnIndex == null}
            onClick={handleMoveIndexColumnDown}
          >
            Down
          </Button>
        </div>
      </div>
    </section>
  );
}
