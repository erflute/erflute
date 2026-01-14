import type { Dispatch, SetStateAction } from "react";
import { stringifyReference } from "@/domain/parsers/referenceParser";
import type { CompoundUniqueKey } from "@/types/domain/table";
import type { CompoundUniqueKeyProps } from "./types";

type CompoundUniqueKeyHandlers = {
  uniqueKeyName: string;
  defaultUniqueKeyValue: string;
  selectedColumnIds: string[];
  setSelectedColumns: Dispatch<SetStateAction<Set<string>>>;
  selectedKeyIndex: number | null;
  setSelectedKeyIndex: Dispatch<SetStateAction<number | null>>;
  data: CompoundUniqueKeyProps["data"];
  setData: CompoundUniqueKeyProps["setData"];
};

export function createCompoundUniqueKeyHandlers({
  uniqueKeyName,
  defaultUniqueKeyValue,
  selectedColumnIds,
  setSelectedColumns,
  selectedKeyIndex,
  setSelectedKeyIndex,
  data,
  setData,
}: CompoundUniqueKeyHandlers) {
  const handleSelectKey = (value: string) => {
    if (value === defaultUniqueKeyValue) {
      setSelectedKeyIndex(null);
      return;
    }
    const index = Number(value);
    setSelectedKeyIndex(Number.isNaN(index) ? null : index);
  };

  const handleToggleColumn = (columnId: string) => (checked: boolean) => {
    setSelectedColumns((prev) => {
      const next = new Set(prev);
      if (checked === true) {
        next.add(columnId);
      } else {
        next.delete(columnId);
      }
      return next;
    });
  };

  const handleAdd = () => {
    const trimmedName = uniqueKeyName.trim();
    if (!trimmedName || selectedColumnIds.length === 0) {
      return;
    }

    const nextKey: CompoundUniqueKey = {
      name: trimmedName,
      columns: selectedColumnIds.map((columnId) =>
        stringifyReference({
          tableName: data.physicalName,
          columnName: columnId,
        }),
      ),
    };

    setData((prev) => {
      const nextKeys = [...(prev.compoundUniqueKeys ?? []), nextKey];
      return {
        ...prev,
        compoundUniqueKeys: nextKeys,
      };
    });
    setSelectedKeyIndex(data.compoundUniqueKeys?.length ?? 0);
  };

  const handleUpdate = () => {
    if (selectedKeyIndex == null) {
      return;
    }
    const trimmedName = uniqueKeyName.trim();
    if (!trimmedName || selectedColumnIds.length === 0) {
      return;
    }
    setData((prev) => {
      const nextKeys = [...(prev.compoundUniqueKeys ?? [])];
      if (!nextKeys[selectedKeyIndex]) {
        return prev;
      }
      nextKeys[selectedKeyIndex] = {
        name: trimmedName,
        columns: selectedColumnIds.map((columnId) =>
          stringifyReference({
            tableName: data.physicalName,
            columnName: columnId,
          }),
        ),
      };
      return {
        ...prev,
        compoundUniqueKeys: nextKeys,
      };
    });
  };

  const handleDelete = () => {
    if (selectedKeyIndex == null) {
      return;
    }
    setData((prev) => {
      const nextKeys = [...(prev.compoundUniqueKeys ?? [])];
      if (!nextKeys[selectedKeyIndex]) {
        return prev;
      }
      nextKeys.splice(selectedKeyIndex, 1);
      return {
        ...prev,
        compoundUniqueKeys: nextKeys,
      };
    });
    setSelectedKeyIndex((prevIndex) => {
      if (prevIndex == null) {
        return null;
      }
      if (
        data.compoundUniqueKeys?.length &&
        data.compoundUniqueKeys.length <= 1
      ) {
        return null;
      }
      return Math.max(0, prevIndex - 1);
    });
  };

  return {
    handleSelectKey,
    handleToggleColumn,
    handleAdd,
    handleUpdate,
    handleDelete,
  };
}
