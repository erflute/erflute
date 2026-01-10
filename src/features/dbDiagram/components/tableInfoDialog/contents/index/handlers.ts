import { stringifyReference } from "@/domain/parsers/referenceParser";
import type { Index } from "@/types/domain/table";
import type { IndexContentProps } from "./types";

type IndexContentHandlers = {
  handleSelectIndex: (value: string) => void;
  handleAddIndex: () => void;
  handleUpdateIndex: () => void;
  handleDeleteIndex: () => void;
  handleAddIndexColumn: (columnName: string) => void;
  handleRemoveIndexColumn: () => void;
  handleMoveIndexColumnUp: () => void;
  handleMoveIndexColumnDown: () => void;
};

type IndexContentHandlerArgs = {
  defaultIndexValue: string;
  selectedIndex: Index | null;
  setSelectedIndex: (value: Index | null) => void;
  selectedIndexIndex: number | null;
  setSelectedIndexIndex: (value: number | null) => void;
  selectedAvailableColumnIndex: number | null;
  selectedIndexColumnIndex: number | null;
  setSelectedIndexColumnIndex: (value: number | null) => void;
  data: IndexContentProps["data"];
  setData: IndexContentProps["setData"];
};

export function createIndexContentHandlers({
  defaultIndexValue,
  selectedIndex,
  setSelectedIndex,
  selectedIndexIndex,
  setSelectedIndexIndex,
  selectedAvailableColumnIndex,
  selectedIndexColumnIndex,
  setSelectedIndexColumnIndex,
  data,
  setData,
}: IndexContentHandlerArgs): IndexContentHandlers {
  const handleSelectIndex = (value: string) => {
    if (value === defaultIndexValue) {
      setSelectedIndexIndex(null);
      return;
    }
    const index = Number(value);
    setSelectedIndexIndex(Number.isNaN(index) ? null : index);
  };

  const handleAddIndex = () => {
    if (selectedIndex === null) {
      return;
    }
    const indexes = data.indexes ?? [];
    setData({
      ...data,
      indexes: [...indexes, selectedIndex],
    });
    setSelectedIndexIndex(indexes.length);
  };

  const handleUpdateIndex = () => {
    if (selectedIndex === null) {
      return;
    }
    const indexes = data.indexes
      ? data.indexes.map((index, i) => {
          if (i === selectedIndexIndex) {
            return selectedIndex;
          }
          return index;
        })
      : [];
    setData({
      ...data,
      indexes: [...indexes, selectedIndex],
    });
  };

  const handleDeleteIndex = () => {
    if (selectedIndexIndex == null) {
      return;
    }

    const indexLength = data.indexes?.length ?? 0;
    if (indexLength == 1) {
      setSelectedIndexIndex(null);
    } else if (selectedIndexIndex >= indexLength - 1) {
      setSelectedIndexIndex(selectedIndexIndex - 1);
    }
    setData((prev) => {
      const currentIndexes = prev.indexes ?? [];
      if (!currentIndexes[selectedIndexIndex]) {
        return prev;
      }
      const nextIndexes = currentIndexes.filter(
        (_, index) => index !== selectedIndexIndex,
      );
      return {
        ...prev,
        indexes: nextIndexes,
      };
    });
  };

  const handleAddIndexColumn = (columnName: string) => {
    if (selectedIndex === null || selectedAvailableColumnIndex == null) {
      return;
    }
    const nextColumns = [
      ...selectedIndex.columns,
      {
        columnId: stringifyReference({
          tableName: data.physicalName,
          columnName: columnName,
        }),
      },
    ];
    setSelectedIndex({
      ...selectedIndex,
      columns: nextColumns,
    });
    setSelectedIndexColumnIndex(nextColumns.length - 1);
  };

  const handleRemoveIndexColumn = () => {
    if (selectedIndex === null || selectedIndexColumnIndex == null) {
      return;
    }
    const nextColumns = selectedIndex.columns.filter(
      (_, index) => index !== selectedIndexColumnIndex,
    );
    setSelectedIndex({
      ...selectedIndex,
      columns: nextColumns,
    });
    setSelectedIndexColumnIndex(
      nextColumns.length > 0 ? nextColumns.length - 1 : null,
    );
  };

  const handleMoveIndexColumnUp = () => {
    if (
      selectedIndex === null ||
      selectedIndexColumnIndex == null ||
      selectedIndexColumnIndex === 0
    ) {
      return;
    }
    const nextColumns = [...selectedIndex.columns];
    const swapIndex = selectedIndexColumnIndex - 1;
    [nextColumns[swapIndex], nextColumns[selectedIndexColumnIndex]] = [
      nextColumns[selectedIndexColumnIndex],
      nextColumns[swapIndex],
    ];
    setSelectedIndex({
      ...selectedIndex,
      columns: nextColumns,
    });
    setSelectedIndexColumnIndex(swapIndex);
  };

  const handleMoveIndexColumnDown = () => {
    if (
      selectedIndex === null ||
      selectedIndexColumnIndex == null ||
      selectedIndexColumnIndex >= selectedIndex.columns.length - 1
    ) {
      return;
    }
    const nextColumns = [...selectedIndex.columns];
    const swapIndex = selectedIndexColumnIndex + 1;
    [nextColumns[swapIndex], nextColumns[selectedIndexColumnIndex]] = [
      nextColumns[selectedIndexColumnIndex],
      nextColumns[swapIndex],
    ];
    setSelectedIndex({
      ...selectedIndex,
      columns: nextColumns,
    });
    setSelectedIndexColumnIndex(swapIndex);
  };

  return {
    handleSelectIndex,
    handleAddIndex,
    handleUpdateIndex,
    handleDeleteIndex,
    handleAddIndexColumn,
    handleRemoveIndexColumn,
    handleMoveIndexColumnUp,
    handleMoveIndexColumnDown,
  };
}
