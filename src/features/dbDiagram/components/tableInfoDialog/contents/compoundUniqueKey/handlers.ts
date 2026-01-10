import type { Dispatch, SetStateAction } from "react";
import type { CompoundUniqueKey } from "@/types/domain/table";
import type { CompoundUniqueKeyProps } from "./types";

type CompoundUniqueKeyHandlers = {
  compoundUniqueKeys: CompoundUniqueKey[];
  uniqueKeyName: string;
  selectedColumnIds: string[];
  selectedKeyIndex: number | null;
  defaultUniqueKeyValue: string;
  setData: CompoundUniqueKeyProps["setData"];
  setSelectedKeyIndex: Dispatch<SetStateAction<number | null>>;
  setSelectedColumns: Dispatch<SetStateAction<Set<string>>>;
};

export function createCompoundUniqueKeyHandlers({
  compoundUniqueKeys,
  uniqueKeyName,
  selectedColumnIds,
  selectedKeyIndex,
  defaultUniqueKeyValue,
  setData,
  setSelectedKeyIndex,
  setSelectedColumns,
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
      columns: selectedColumnIds,
    };

    setData((prev) => {
      const nextKeys = [...(prev.compoundUniqueKeys ?? []), nextKey];
      return {
        ...prev,
        compoundUniqueKeys: nextKeys,
      };
    });
    setSelectedKeyIndex(compoundUniqueKeys.length);
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
        columns: selectedColumnIds,
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
      if (compoundUniqueKeys.length <= 1) {
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
