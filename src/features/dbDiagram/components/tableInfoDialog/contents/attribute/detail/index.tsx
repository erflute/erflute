import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useViewModeStore } from "@/stores/viewModeStore";
import type { Column } from "@/types/domain/column";
import {
  ColumnType,
  ColumnTypeConfigMap,
  parseColumnType,
} from "@/types/domain/columnType";
import { type AttributeDetailProps } from "./types";

const COLUMN_TYPE_LIST: ColumnType[] = [
  ColumnType.BigInt,
  ColumnType.BigIntN,
  ColumnType.Binary,
  ColumnType.BinaryN,
  ColumnType.BitN,
  ColumnType.Blob,
  ColumnType.Boolean,
  ColumnType.Char,
  ColumnType.CharN,
  ColumnType.Date,
  ColumnType.Datetime,
  ColumnType.Decimal,
  ColumnType.DecimalP,
  ColumnType.DecimalPS,
  ColumnType.Double,
  ColumnType.DoubleMD,
  ColumnType.Enum,
  ColumnType.Float,
  ColumnType.FloatMD,
  ColumnType.FloatP,
  ColumnType.Geometry,
  ColumnType.Int,
  ColumnType.IntN,
  ColumnType.Json,
  ColumnType.LongBlob,
  ColumnType.LongText,
  ColumnType.MediumBlob,
  ColumnType.MediumInt,
  ColumnType.MediumIntN,
  ColumnType.MediumText,
  ColumnType.Numeric,
  ColumnType.NumericP,
  ColumnType.NumericPS,
  ColumnType.Real,
  ColumnType.RealMD,
  ColumnType.Set,
  ColumnType.SmallInt,
  ColumnType.SmallIntN,
  ColumnType.Text,
  ColumnType.Time,
  ColumnType.Timestamp,
  ColumnType.TinyBlob,
  ColumnType.TinyInt,
  ColumnType.TinyIntN,
  ColumnType.TinyText,
  ColumnType.VarBinaryN,
  ColumnType.VarCharN,
  ColumnType.Year2,
  ColumnType.Year4,
];

const initialColumn = {
  physicalName: "",
  notNull: true,
};

export function AttributeDetail({ column, onBack }: AttributeDetailProps) {
  const { isReadOnly } = useViewModeStore();
  const [currentColumn, setCurrentColumn] = useState<Column>(
    column ? column : initialColumn,
  );
  const columnType = currentColumn?.columnType;
  const typeSupportsLength = useMemo(
    () =>
      columnType
        ? ColumnTypeConfigMap[columnType].supportsLength !== false
        : false,
    [columnType],
  );
  const typeSupportsDecimal = useMemo(
    () =>
      columnType
        ? ColumnTypeConfigMap[columnType].supportsDecimal !== false
        : false,
    [columnType],
  );
  const typeSupportsUnsigned = useMemo(
    () =>
      columnType
        ? ColumnTypeConfigMap[columnType].supportsUnsigned !== false
        : false,
    [columnType],
  );
  const typeSupportsEnumArgs = useMemo(
    () =>
      columnType
        ? ColumnTypeConfigMap[columnType].supportsEnumArgs !== false
        : false,
    [columnType],
  );

  const physicalNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (physicalNameInputRef.current) {
      physicalNameInputRef.current.focus();
      physicalNameInputRef.current.select();
    }
  }, []);

  return (
    <section
      role="region"
      aria-labelledby="table-info-column-details-heading"
      className="flex flex-1 flex-col h-95 overflow-hidden rounded-md border border-slate-200 bg-white px-4 py-4 text-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Back to Columns"
            onClick={() => {
              onBack(currentColumn);
            }}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <h3
            id="table-info-column-details-heading"
            className="text-base font-semibold text-slate-600"
          >
            Column Details
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
          <label
            className="flex items-center gap-2"
            htmlFor="table-info-column-primary-key"
          >
            {isReadOnly ? (
              <div className="h-4 w-4">
                {currentColumn.primaryKey && (
                  <CheckIcon
                    aria-label={`Column ${currentColumn.physicalName} is primary key`}
                    id="table-info-column-primary-key"
                    className="text-blue-500"
                  />
                )}
              </div>
            ) : (
              <Checkbox
                aria-label={`Column ${currentColumn.physicalName} is primary key`}
                id="table-info-column-primary-key"
                checked={currentColumn.primaryKey ?? false}
                onCheckedChange={(checked) =>
                  setCurrentColumn({
                    ...currentColumn,
                    primaryKey: checked === true,
                  })
                }
                className="data-[state=checked]:border-blue-500"
              />
            )}
            <span>Primary Key</span>
          </label>
          <label
            className="flex items-center gap-2"
            htmlFor="table-info-column-not-null"
          >
            {isReadOnly ? (
              <div className="h-4 w-4">
                {currentColumn.notNull && (
                  <CheckIcon
                    aria-label={`Column ${currentColumn.physicalName} is not null`}
                    id="table-info-column-not-null"
                    className="text-blue-500"
                  />
                )}
              </div>
            ) : (
              <Checkbox
                aria-label={`Column ${currentColumn.physicalName} is not null`}
                id="table-info-column-not-null"
                checked={currentColumn.notNull ?? false}
                onCheckedChange={(checked) =>
                  setCurrentColumn({
                    ...currentColumn,
                    notNull: checked === true,
                  })
                }
                className="data-[state=checked]:border-blue-500"
              />
            )}
            <span>Not Null</span>
          </label>
          <label
            className="flex items-center gap-2"
            htmlFor="table-info-column-unique"
          >
            {isReadOnly ? (
              <div className="h-4 w-4">
                {currentColumn.unique && (
                  <CheckIcon
                    aria-label={`Column ${currentColumn.physicalName} is unique`}
                    id="table-info-column-unique"
                    className="text-blue-500"
                  />
                )}
              </div>
            ) : (
              <Checkbox
                aria-label={`Column ${currentColumn.physicalName} is unique`}
                id="table-info-column-unique"
                checked={currentColumn.unique ?? false}
                onCheckedChange={(checked) =>
                  setCurrentColumn({
                    ...currentColumn,
                    unique: checked === true,
                  })
                }
                className="data-[state=checked]:border-blue-500"
              />
            )}
            <span>Unique</span>
          </label>
          <label
            className="flex items-center gap-2"
            htmlFor="table-info-column-auto-increment"
          >
            {isReadOnly ? (
              <div className="h-4 w-4">
                {currentColumn.autoIncrement && (
                  <CheckIcon
                    aria-label={`Column ${currentColumn.physicalName} is auto increment`}
                    id="table-info-column-auto-increment"
                    className="text-blue-500"
                  />
                )}
              </div>
            ) : (
              <Checkbox
                aria-label={`Column ${currentColumn.physicalName} is auto increment`}
                id="table-info-column-auto-increment"
                checked={currentColumn.autoIncrement ?? false}
                onCheckedChange={(checked) =>
                  setCurrentColumn({
                    ...currentColumn,
                    autoIncrement: checked === true,
                  })
                }
                className="data-[state=checked]:border-blue-500"
              />
            )}
            <span>Auto Increment</span>
          </label>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto pr-1">
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <label
              className="flex flex-col gap-1"
              htmlFor="table-info-column-physical-name"
            >
              <span className="font-medium text-slate-600">Physical Name</span>
              <Input
                id="table-info-column-physical-name"
                ref={physicalNameInputRef}
                className="h-8 px-2"
                type="text"
                value={currentColumn.physicalName}
                readOnly={isReadOnly}
                onChange={(event) =>
                  setCurrentColumn({
                    ...currentColumn,
                    physicalName: event.target.value,
                  })
                }
              />
            </label>
            <label
              className="flex flex-col gap-1"
              htmlFor="table-info-column-logical-name"
            >
              <span className="font-medium text-slate-600">Logical Name</span>
              <Input
                id="table-info-column-logical-name"
                className="h-8 px-2"
                type="text"
                value={currentColumn.logicalName ?? ""}
                readOnly={isReadOnly}
                onChange={(event) =>
                  setCurrentColumn({
                    ...currentColumn,
                    logicalName:
                      event.target.value === ""
                        ? undefined
                        : event.target.value,
                  })
                }
              />
            </label>
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <label
                className="flex flex-col w-30 gap-1"
                htmlFor="table-info-column-type"
              >
                <span className="font-medium text-slate-600">Type</span>
                {isReadOnly ? (
                  <p id="table-info-column-type" className="px-2 h-8 text-sm">
                    {currentColumn.columnType
                      ? ColumnTypeConfigMap[currentColumn.columnType].label
                      : "-"}
                  </p>
                ) : (
                  <select
                    id="table-info-column-type"
                    className="h-8 rounded border border-slate-300 px-2 shadow-inner focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-200"
                    value={currentColumn.columnType}
                    onChange={(event) => {
                      const columnType =
                        event.target.value === ""
                          ? undefined
                          : parseColumnType(event.target.value);
                      const length =
                        columnType &&
                        ColumnTypeConfigMap[columnType].supportsLength
                          ? currentColumn.length
                          : undefined;
                      const decimal =
                        columnType &&
                        ColumnTypeConfigMap[columnType].supportsDecimal
                          ? currentColumn.decimal
                          : undefined;
                      const unsigned =
                        columnType &&
                        ColumnTypeConfigMap[columnType].supportsUnsigned
                          ? currentColumn.unsigned
                          : undefined;
                      const enumArgs =
                        columnType &&
                        ColumnTypeConfigMap[columnType].supportsEnumArgs
                          ? currentColumn.enumArgs
                          : undefined;
                      setCurrentColumn({
                        ...currentColumn,
                        columnType,
                        length,
                        decimal,
                        unsigned,
                        enumArgs,
                      });
                    }}
                  >
                    {COLUMN_TYPE_LIST.map((columnType) => (
                      <option key={columnType} value={columnType}>
                        {ColumnTypeConfigMap[columnType].label}
                      </option>
                    ))}
                  </select>
                )}
              </label>
              <label
                className="flex flex-col w-30 gap-1"
                htmlFor="table-info-column-length"
              >
                <span className="font-medium text-slate-600">Length</span>
                <Input
                  id="table-info-column-length"
                  className="h-8 px-2"
                  type="number"
                  value={currentColumn.length ?? ""}
                  disabled={!typeSupportsLength}
                  readOnly={isReadOnly}
                  onChange={(event) =>
                    setCurrentColumn({
                      ...currentColumn,
                      length:
                        event.target.value === ""
                          ? undefined
                          : Number(event.target.value),
                    })
                  }
                />
              </label>
              <label
                className="flex flex-col w-30 gap-1"
                htmlFor="table-info-column-decimal"
              >
                <span className="font-medium text-slate-600">Decimal</span>
                <Input
                  id="table-info-column-decimal"
                  className="h-8 px-2"
                  type="number"
                  value={currentColumn.decimal ?? ""}
                  disabled={!typeSupportsDecimal}
                  readOnly={isReadOnly}
                  onChange={(event) =>
                    setCurrentColumn({
                      ...currentColumn,
                      decimal:
                        event.target.value === ""
                          ? undefined
                          : Number(event.target.value),
                    })
                  }
                />
              </label>
              <label
                className="flex items-center gap-2 pb-1"
                htmlFor="table-info-column-unsigned"
              >
                {isReadOnly ? (
                  <div className="w-4 h-4">
                    {currentColumn.unsigned && (
                      <CheckIcon
                        id="table-info-column-unsigned"
                        className="text-blue-500"
                      />
                    )}
                  </div>
                ) : (
                  <Checkbox
                    id="table-info-column-unsigned"
                    className="border-slate-300"
                    checked={currentColumn.unsigned ?? false}
                    disabled={!typeSupportsUnsigned}
                    onCheckedChange={(checked) =>
                      setCurrentColumn({
                        ...currentColumn,
                        unsigned: checked === true,
                      })
                    }
                  />
                )}
                <span className="text-sm font-medium text-slate-600">
                  Unsigned
                </span>
              </label>
            </div>
            <label
              className="flex flex-col gap-1 sm:col-span-1"
              htmlFor="table-info-column-enum-args"
            >
              <span className="font-medium text-slate-600">
                Args of enum/set Type
              </span>
              <Input
                id="table-info-column-enum-args"
                className="h-8 px-2"
                type="text"
                value={currentColumn.enumArgs ?? ""}
                disabled={!typeSupportsEnumArgs}
                readOnly={isReadOnly}
                onChange={(event) =>
                  setCurrentColumn({
                    ...currentColumn,
                    enumArgs:
                      event.target.value === ""
                        ? undefined
                        : event.target.value,
                  })
                }
              />
            </label>
            <label
              className="flex flex-col gap-1 sm:col-span-1"
              htmlFor="table-info-column-default-value"
            >
              <span className="font-medium text-slate-600">Default Value</span>
              <Input
                id="table-info-column-default-value"
                className="h-8 px-2"
                type="text"
                value={currentColumn.defaultValue ?? ""}
                readOnly={isReadOnly}
                onChange={(event) =>
                  setCurrentColumn({
                    ...currentColumn,
                    defaultValue:
                      event.target.value === ""
                        ? undefined
                        : event.target.value,
                  })
                }
              />
            </label>
            <label
              className="flex flex-col gap-1 sm:col-span-2"
              htmlFor="table-info-column-description"
            >
              <span className="font-medium text-slate-600">Description</span>
              <Textarea
                id="table-info-column-description"
                className="min-h-18 px-2 py-2"
                value={currentColumn.description ?? ""}
                readOnly={isReadOnly}
                onChange={(event) =>
                  setCurrentColumn({
                    ...currentColumn,
                    description:
                      event.target.value === ""
                        ? undefined
                        : event.target.value,
                  })
                }
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
