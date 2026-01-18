import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { parseReference } from "@/domain/parsers/referenceParser";
import { useViewModeStore } from "@/stores/viewModeStore";
import {
  Cardinality,
  ReferenceOperation,
  type Relationship,
} from "@/types/domain/relationship";
import { type RelationInfoDialogProps } from "./types";

const NO_ACTION = "NO ACTION";
const REFERENCE_OPERATION_OPTIONS = [
  ReferenceOperation.Restrict,
  ReferenceOperation.Cascade,
  NO_ACTION,
  ReferenceOperation.SetNull,
  ReferenceOperation.SetDefault,
];

const PARENT_CARDINALITY_OPTIONS = [Cardinality.One, Cardinality.ZeroOne];

const CHILD_CARDINALITY_OPTIONS = [
  Cardinality.One,
  Cardinality.ZeroOne,
  Cardinality.OneN,
  Cardinality.ZeroN,
];

function getReferenceTable(data: Relationship) {
  const { tableName } = parseReference(data.source);
  return tableName ?? "";
}

export function RelationInfoDialog({
  data,
  onApply,
  onCancel,
  ...props
}: RelationInfoDialogProps) {
  const { open, onOpenChange, ...dialogProps } = props;
  const { isReadOnly } = useViewModeStore();
  const [constName, setConstName] = useState<string>("");
  const [referenceOperation, setReferenceOperation] = useState({
    onUpdate: NO_ACTION,
    onDelete: NO_ACTION,
  });
  const [referredColumn, setReferredColumn] = useState("");
  const [multiplicity, setMultiplicity] = useState<{
    parent: Cardinality;
    child: Cardinality;
  }>({
    parent: Cardinality.One,
    child: Cardinality.One,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setConstName(data.name);
    setReferenceOperation({
      onDelete: data.onDeleteAction ?? NO_ACTION,
      onUpdate: data.onUpdateAction ?? NO_ACTION,
    });
    setReferredColumn(data.referredColumn);
    setMultiplicity({
      parent: data.parentCardinality,
      child: data.childCardinality,
    });
  }, [data, open]);

  const handleApply = () => {
    onApply?.({
      ...data,
      name: constName.trim(),
      onUpdateAction:
        referenceOperation.onUpdate === NO_ACTION
          ? undefined
          : referenceOperation.onUpdate,
      onDeleteAction:
        referenceOperation.onDelete === NO_ACTION
          ? undefined
          : referenceOperation.onDelete,
      referredColumn,
      parentCardinality: multiplicity.parent,
      childCardinality: multiplicity.child,
    });
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...dialogProps}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[520px] sm:max-w-[520px] sm:h-[620px] sm:max-h-[80vh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle>Relation Information</DialogTitle>
        </DialogHeader>
        <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1 text-sm text-slate-700">
          <label className="flex flex-col gap-2">
            <span className="font-medium text-slate-600">Constraint Name</span>
            <Input
              value={constName}
              readOnly={isReadOnly}
              onChange={(event) => setConstName(event.target.value)}
              className="h-9"
            />
          </label>

          <section className="flex flex-col gap-2">
            <span className="font-medium text-slate-600">
              Reference operation
            </span>
            <div className="grid grid-cols-[auto_1fr] items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">
                ON UPDATE
              </label>
              <select
                value={referenceOperation.onUpdate}
                disabled={isReadOnly}
                onChange={(event) =>
                  setReferenceOperation((prev) => ({
                    ...prev,
                    onUpdate: event.target.value,
                  }))
                }
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm shadow-xs focus-visible:border-blue-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                {REFERENCE_OPERATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <label className="text-xs font-semibold text-slate-500">
                ON DELETE
              </label>
              <select
                value={referenceOperation.onDelete}
                disabled={isReadOnly}
                onChange={(event) =>
                  setReferenceOperation((prev) => ({
                    ...prev,
                    onDelete: event.target.value,
                  }))
                }
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm shadow-xs focus-visible:border-blue-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                {REFERENCE_OPERATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <div className="grid gap-3 md:grid-cols-2">
            <section className="flex flex-col gap-3 rounded-md border border-slate-200 p-3">
              <span className="font-medium text-slate-600">Parent</span>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-slate-600">Reference Table</span>
                <Input
                  value={getReferenceTable(data)}
                  readOnly
                  className="h-9"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-slate-600">Referred Column</span>
                <select
                  value={referredColumn}
                  disabled={isReadOnly}
                  onChange={(event) => setReferredColumn(event.target.value)}
                  className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm shadow-xs focus-visible:border-blue-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-200"
                >
                  {data.referredColumnOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-slate-600">Multiplicity</span>
                <select
                  value={multiplicity.parent}
                  disabled={isReadOnly}
                  onChange={(event) =>
                    setMultiplicity((prev) => ({
                      ...prev,
                      parent: event.target.value as Cardinality,
                    }))
                  }
                  className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm shadow-xs focus-visible:border-blue-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-200"
                >
                  {PARENT_CARDINALITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className="flex flex-col gap-3 rounded-md border border-slate-200 p-3">
              <span className="font-medium text-slate-600">Child</span>
              <div
                className="min-h-[136px] rounded-md border border-slate-200 bg-white"
                aria-hidden="true"
              />
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-slate-600">Multiplicity</span>
                <select
                  value={multiplicity.child}
                  disabled={isReadOnly}
                  onChange={(event) =>
                    setMultiplicity((prev) => ({
                      ...prev,
                      child: event.target.value as Cardinality,
                    }))
                  }
                  className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm shadow-xs focus-visible:border-blue-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-200"
                >
                  {CHILD_CARDINALITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </section>
          </div>
        </div>
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
