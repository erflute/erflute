import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { parseReference } from "@/domain/parsers/referenceParser";
import { useViewModeStore } from "@/stores/viewModeStore";
import type { Column } from "@/types/domain/column";
import { isColumnGroupName } from "@/types/domain/table";
import { createCompoundUniqueKeyHandlers } from "./handlers";
import { type CompoundUniqueKeyProps } from "./types";

const NEW_KEY_VALUE = "new";
const SELECT_KEY_VALUE = "select";

function getDefaultUniqueKeyValue(isReadOnly: boolean) {
  return isReadOnly ? SELECT_KEY_VALUE : NEW_KEY_VALUE;
}

export function CompoundUniqueKeyContent({
  data,
  setData,
}: CompoundUniqueKeyProps) {
  const { isReadOnly } = useViewModeStore();
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number | null>(null);
  const [uniqueKeyName, setUniqueKeyName] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    () => new Set(),
  );

  const availableColumns = useMemo(
    () =>
      (data.columns ?? [])
        .filter((column): column is Column => !isColumnGroupName(column))
        .map((column) => ({
          id: column.physicalName,
        })),
    [data.columns],
  );

  const compoundUniqueKeys = useMemo(
    () => data.compoundUniqueKeys ?? [],
    [data.compoundUniqueKeys],
  );

  useEffect(() => {
    if (selectedKeyIndex == null) {
      setUniqueKeyName("");
      setSelectedColumns(new Set());
      return;
    }

    const selectedKey = compoundUniqueKeys[selectedKeyIndex];
    if (!selectedKey) {
      setSelectedKeyIndex(
        compoundUniqueKeys.length > 0 ? compoundUniqueKeys.length - 1 : null,
      );
      return;
    }

    setUniqueKeyName(selectedKey.name);
    setSelectedColumns(
      new Set(
        selectedKey.columns
          .map((column) => {
            const { columnName } = parseReference(column);
            return columnName;
          })
          .filter((columnName) => columnName !== undefined),
      ),
    );
  }, [compoundUniqueKeys, selectedKeyIndex]);

  const selectedColumnIds = useMemo(() => {
    const selected = new Set(selectedColumns);
    return availableColumns
      .filter((column) => selected.has(column.id))
      .map((column) => column.id);
  }, [availableColumns, selectedColumns]);

  const {
    handleSelectKey,
    handleToggleColumn,
    handleAdd,
    handleUpdate,
    handleDelete,
  } = createCompoundUniqueKeyHandlers({
    uniqueKeyName,
    defaultUniqueKeyValue: getDefaultUniqueKeyValue(isReadOnly),
    selectedColumnIds,
    setSelectedColumns,
    selectedKeyIndex,
    setSelectedKeyIndex,
    data,
    setData,
  });

  const addDisabled =
    isReadOnly ||
    selectedKeyIndex != null ||
    uniqueKeyName.trim().length === 0 ||
    selectedColumnIds.length === 0;
  const updateDisabled =
    isReadOnly ||
    selectedKeyIndex == null ||
    uniqueKeyName.trim().length === 0 ||
    selectedColumnIds.length === 0;
  const deleteDisabled = isReadOnly || selectedKeyIndex == null;

  return (
    <section className="flex h-full min-h-0 flex-col gap-5 text-sm text-slate-700">
      <label
        className="flex flex-col gap-2"
        htmlFor="compound-unique-key-select"
      >
        <span className="font-medium text-slate-600">Compound Unique Key</span>
        <select
          id="compound-unique-key-select"
          value={
            selectedKeyIndex == null
              ? getDefaultUniqueKeyValue(isReadOnly)
              : String(selectedKeyIndex)
          }
          onChange={(event) => handleSelectKey(event.target.value)}
          className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm shadow-xs focus-visible:border-blue-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-200"
        >
          {isReadOnly ? (
            <option value={SELECT_KEY_VALUE}>Select unique key</option>
          ) : (
            <option value={NEW_KEY_VALUE}>New unique key</option>
          )}
          {compoundUniqueKeys.map((key, index) => {
            return (
              <option key={`${key.name}-${index}`} value={String(index)}>
                {key.name}
              </option>
            );
          })}
        </select>
      </label>

      <label className="flex flex-col gap-2" htmlFor="compound-unique-key-name">
        <span className="font-medium text-slate-600">
          Constraint Name for UNIQUE KEY
        </span>
        <Input
          id="compound-unique-key-name"
          value={uniqueKeyName}
          readOnly={isReadOnly}
          onChange={(event) => setUniqueKeyName(event.target.value)}
          className="h-9 px-2"
        />
      </label>

      <div className="flex min-h-0 flex-1 flex-col rounded-md border border-slate-200">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <table className="min-w-full table-fixed divide-y divide-slate-200 text-sm">
            <colgroup>
              <col className="w-4/5" />
              <col className="w-1/5" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left">Physical Name</th>
                <th className="px-3 py-2 text-center">Unique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
              {availableColumns.map((column) => (
                <tr key={column.id}>
                  <td className="px-3 py-2">{column.id}</td>
                  <td className="px-3 py-2 text-center">
                    <Checkbox
                      checked={selectedColumns.has(column.id)}
                      onCheckedChange={handleToggleColumn(column.id)}
                      disabled={isReadOnly}
                      aria-label={`Mark ${column.id} as unique`}
                    />
                  </td>
                </tr>
              ))}
              {availableColumns.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-sm text-slate-400"
                    colSpan={2}
                  >
                    Columns will appear here once added.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="shrink-0 border-t border-slate-200 px-3 py-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={addDisabled}
              onClick={handleAdd}
            >
              Add
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={updateDisabled}
              onClick={handleUpdate}
            >
              Update
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deleteDisabled}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
