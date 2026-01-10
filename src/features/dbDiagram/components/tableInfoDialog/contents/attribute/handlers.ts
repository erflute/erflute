import type { Column } from "@/types/domain/column";
import { isColumnGroupName, type ColumnGroupName } from "@/types/domain/table";
import type { AttributeContentProps } from "./types";

type AttributeContentHandlers = {
  columns: (Column | ColumnGroupName)[];
  selectedColumnIndex: number | null;
  selectedInGroupIndex: number | null;
  setSelectedColumnIndex: (index: number | null) => void;
  setSelectedInGroupIndex: (index: number | null) => void;
  setAttributeView: (view: "list" | "detail") => void;
  setData: AttributeContentProps["setData"];
};

export function createAttributeContentHandlers({
  columns,
  selectedColumnIndex,
  selectedInGroupIndex,
  setSelectedColumnIndex,
  setSelectedInGroupIndex,
  setAttributeView,
  setData,
}: AttributeContentHandlers) {
  const handleSelectColumn = (index: number | null) => {
    setSelectedColumnIndex(index);
    setSelectedInGroupIndex(null);
  };

  const handleSelectColumnGroup = (
    columnIndex: number | null,
    inGroupIndex: number | null,
  ) => {
    setSelectedColumnIndex(columnIndex);
    setSelectedInGroupIndex(inGroupIndex);
  };

  const handleOpenDetail = (index: number) => {
    // Just in case of normal column selected, move to detail view
    if (!isColumnGroupName(columns[index])) {
      setSelectedColumnIndex(index);
      setAttributeView("detail");
    }
  };

  const handleAddColumn = () => {
    const newColumn: Column = {
      physicalName: "",
      notNull: false,
    };
    const nextColumns = [...columns, newColumn];

    setData((current) => ({
      ...current,
      columns: nextColumns,
    }));

    setSelectedColumnIndex(nextColumns.length - 1);
    setAttributeView("detail");
  };

  const handleEditColumn = () => {
    const isEditingColumnGroup =
      selectedColumnIndex !== null && selectedInGroupIndex !== null;
    if (isEditingColumnGroup) {
      return;
    }
    if (selectedColumnIndex == null) {
      return;
    }
    setAttributeView("detail");
  };

  const handleDeleteColumn = () => {
    if (selectedColumnIndex == null) {
      return;
    }

    const columnIndex = selectedColumnIndex;
    const nextColumns = columns.filter((_, index) => index !== columnIndex);
    setData((current) => ({
      ...current,
      columns: nextColumns,
    }));

    if (nextColumns.length === 0) {
      setSelectedColumnIndex(null);
    } else {
      const nextIndex = Math.min(columnIndex, nextColumns.length - 1);
      setSelectedColumnIndex(nextIndex);
    }
    setAttributeView("list");
  };

  const handleBackToColumnList = (column: Column) => {
    setData((current) => {
      const nextColumns = current.columns?.map((col, index) => {
        if (index === selectedColumnIndex) {
          return column;
        }
        return col;
      });
      return {
        ...current,
        columns: nextColumns,
      };
    });
    setAttributeView("list");
  };

  return {
    handleSelectColumn,
    handleSelectColumnGroup,
    handleOpenDetail,
    handleAddColumn,
    handleEditColumn,
    handleDeleteColumn,
    handleBackToColumnList,
  };
}
