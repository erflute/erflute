import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Column } from "@/types/domain/column";
import {
  isColumnGroupName,
  type ColumnGroupName,
  type Table,
} from "@/types/domain/table";
import { AttributeContent } from "./contents/attribute";
import { CompoundUniqueKeyContent } from "./contents/compoundUniqueKey";
import { ConstraintOptionContent } from "./contents/constraintOption";
import { DescriptionContent } from "./contents/description";
import { IndexContent } from "./contents/index";
import { type TableInfoDialogProps } from "./types";

export function TableInfoDialog({
  data,
  onApply,
  onCancel,
  ...props
}: TableInfoDialogProps) {
  const { open, onOpenChange, ...dialogProps } = props;
  const [tableData, setTableData] = useState<Table>(data);
  const deferredActionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    if (open) {
      setTableData(data);
    }
  }, [open, data]);

  useEffect(() => {
    return () => {
      if (deferredActionTimeoutRef.current) {
        clearTimeout(deferredActionTimeoutRef.current);
      }
    };
  }, []);

  const handleApply = () => {
    const columns = tableData.columns || [];
    const preparedColumns = columns.map<Column | ColumnGroupName>((column) => {
      if (isColumnGroupName(column)) {
        return column;
      }
      return {
        ...column,
        physicalName: column.physicalName.trim(),
        logicalName: column.logicalName ? column.logicalName.trim() : undefined,
        description: column.description ? column.description.trim() : undefined,
        defaultValue: column.defaultValue
          ? column.defaultValue.trim()
          : undefined,
        referredColumn: column.referredColumn?.trim()
          ? column.referredColumn.trim()
          : undefined,
        enumArgs: column.enumArgs ? column.enumArgs.trim() : undefined,
      };
    });
    const preparedCompoundUniqueKeys = tableData.compoundUniqueKeys
      ?.map((key) => {
        return {
          name: key.name.trim(),
          columns: key.columns.map((column) => column.trim()).filter(Boolean),
        };
      })
      .filter((key) => key.name.length > 0 && key.columns.length > 0);
    const preparedIndexes = tableData.indexes?.map((index) => {
      return {
        ...index,
        name: index.name.trim(),
        indexType: index.indexType.trim(),
        description: index.description ? index.description.trim() : undefined,
        columns: index.columns.map((column) => {
          return {
            ...column,
            columnId: column.columnId.trim(),
          };
        }),
      };
    });

    const preparedTable = {
      ...data,
      physicalName: tableData.physicalName.trim(),
      logicalName: tableData.logicalName.trim(),
      description: tableData.description.trim(),
      tableConstraint: tableData.tableConstraint
        ? tableData.tableConstraint.trim()
        : undefined,
      primaryKeyName: tableData.primaryKeyName
        ? tableData.primaryKeyName.trim()
        : undefined,
      option: tableData.option ? tableData.option.trim() : undefined,
      columns: preparedColumns,
      indexes: preparedIndexes,
      compoundUniqueKeys: preparedCompoundUniqueKeys,
    };
    onOpenChange?.(false);
    if (deferredActionTimeoutRef.current) {
      clearTimeout(deferredActionTimeoutRef.current);
    }
    deferredActionTimeoutRef.current = setTimeout(() => {
      onApply?.(preparedTable);
    }, 0);
  };

  const handleCancel = () => {
    onOpenChange?.(false);
    if (deferredActionTimeoutRef.current) {
      clearTimeout(deferredActionTimeoutRef.current);
    }
    deferredActionTimeoutRef.current = setTimeout(() => {
      onCancel?.();
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...dialogProps}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[1000px] sm:max-w-[1000px] sm:h-[650px] sm:max-h-[80vh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle>Table Information</DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="attribute"
          className="flex h-full flex-col gap-2 overflow-hidden"
        >
          <TabsList className="rounded-md border border-slate-200 bg-white p-0.5">
            <TabsTrigger className="px-3" value="attribute">
              Attribute
            </TabsTrigger>
            <TabsTrigger className="px-3" value="description">
              Description
            </TabsTrigger>
            <TabsTrigger className="px-3" value="constraint-option">
              Constraint/Option
            </TabsTrigger>
            <TabsTrigger className="px-3" value="compound-unique-key">
              Compound Unique Key
            </TabsTrigger>
            <TabsTrigger className="px-3" value="index">
              Index
            </TabsTrigger>
            <TabsTrigger className="px-3" value="advanced-settings">
              Advanced Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="attribute"
            className="flex flex-1 flex-col gap-1 overflow-y-auto pr-2"
          >
            <AttributeContent data={tableData} setData={setTableData} />
          </TabsContent>
          <TabsContent
            value="description"
            className="rounded-md border border-slate-200 bg-white p-4"
          >
            <DescriptionContent
              description={tableData.description}
              setDescription={(description: string) =>
                setTableData({
                  ...tableData,
                  description,
                })
              }
            />
          </TabsContent>
          <TabsContent
            value="constraint-option"
            className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500"
          >
            <ConstraintOptionContent
              tableConstraint={tableData.tableConstraint}
              primaryKeyName={tableData.primaryKeyName}
              option={tableData.option}
              setTableConstraint={(tableConstraint) =>
                setTableData({
                  ...tableData,
                  tableConstraint,
                })
              }
              setPrimaryKeyName={(primaryKeyName) =>
                setTableData({
                  ...tableData,
                  primaryKeyName,
                })
              }
              setOption={(option) =>
                setTableData({
                  ...tableData,
                  option,
                })
              }
            />
          </TabsContent>
          <TabsContent
            value="compound-unique-key"
            className="flex min-h-0 flex-col rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500"
          >
            <CompoundUniqueKeyContent data={tableData} setData={setTableData} />
          </TabsContent>
          <TabsContent
            value="index"
            className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500"
          >
            <IndexContent data={tableData} setData={setTableData} />
          </TabsContent>
          <TabsContent
            value="advanced-settings"
            className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500"
          >
            Advanced settings are not yet available for this table.
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleApply}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
