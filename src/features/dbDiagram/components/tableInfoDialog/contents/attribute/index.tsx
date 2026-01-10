import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useViewModeStore } from "@/stores/viewModeStore";
import { isColumnGroupName } from "@/types/domain/table";
import { AttributeDetail } from "./detail";
import { createAttributeContentHandlers } from "./handlers";
import { AttributeList } from "./list";
import { type AttributeContentProps } from "./types";

export function AttributeContent({ data, setData }: AttributeContentProps) {
  const { isReadOnly } = useViewModeStore();
  const [attributeView, setAttributeView] = useState<"list" | "detail">("list");
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(
    null,
  );
  const [selectedInGroupIndex, setSelectedInGroupIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    setSelectedColumnIndex(null);
    setAttributeView("list");
  }, []);

  const columns = useMemo(() => data.columns ?? [], [data.columns]);

  const selectedColumn = useMemo(
    () =>
      selectedColumnIndex != null ? columns[selectedColumnIndex] : undefined,
    [columns, selectedColumnIndex],
  );

  const {
    handleSelectColumn,
    handleSelectColumnGroup,
    handleOpenDetail,
    handleAddColumn,
    handleEditColumn,
    handleDeleteColumn,
    handleBackToColumnList,
  } = createAttributeContentHandlers({
    columns,
    selectedColumnIndex,
    selectedInGroupIndex,
    setSelectedColumnIndex,
    setSelectedInGroupIndex,
    setAttributeView,
    setData,
  });

  return (
    <>
      <section className="flex-none rounded-md border border-slate-200 bg-white">
        <div className="grid grid-cols-[140px_1fr_140px_1fr] items-center gap-3 border-b border-slate-200 px-4 py-3 text-sm">
          <label
            className="font-medium text-slate-600"
            htmlFor="table-info-physical-name"
          >
            Physical Name
          </label>
          <Input
            id="table-info-physical-name"
            className="h-8 rounded px-2 text-sm"
            type="text"
            value={data.physicalName}
            readOnly={isReadOnly}
            onChange={(event) =>
              setData({
                ...data,
                physicalName: event.target.value,
              })
            }
          />
          <label
            className="font-medium text-slate-600"
            htmlFor="table-info-logical-name"
          >
            Logical Name
          </label>
          <Input
            id="table-info-logical-name"
            className="h-8 rounded px-2 text-sm"
            type="text"
            value={data.logicalName ?? ""}
            readOnly={isReadOnly}
            onChange={(event) =>
              setData({
                ...data,
                logicalName: event.target.value,
              })
            }
          />
        </div>
      </section>

      {attributeView === "list" ? (
        <AttributeList
          columns={columns}
          selectedColumnIndex={selectedColumnIndex}
          selectedInGroupIndex={selectedInGroupIndex}
          onSelectColumn={handleSelectColumn}
          onSelectColumnGroup={handleSelectColumnGroup}
          onOpenDetail={handleOpenDetail}
          onAddColumn={handleAddColumn}
          onEditColumn={handleEditColumn}
          onDeleteColumn={handleDeleteColumn}
        />
      ) : (
        <AttributeDetail
          column={
            selectedColumn && !isColumnGroupName(selectedColumn)
              ? selectedColumn
              : undefined
          }
          onBack={handleBackToColumnList}
        />
      )}
    </>
  );
}
