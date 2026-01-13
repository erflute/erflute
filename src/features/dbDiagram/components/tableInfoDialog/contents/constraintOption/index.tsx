import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useViewModeStore } from "@/stores/viewModeStore";
import type { ConstraintOptionContentProps } from "./types";

export function ConstraintOptionContent({
  tableConstraint,
  primaryKeyName,
  option,
  setTableConstraint,
  setPrimaryKeyName,
  setOption,
}: ConstraintOptionContentProps) {
  const { isReadOnly } = useViewModeStore();

  return (
    <div className="flex h-full flex-col gap-6 text-sm text-slate-700">
      <label className="flex flex-col gap-2" htmlFor="table-info-constraint">
        <span className="font-medium text-slate-600">Constraint of Table</span>
        <Textarea
          id="table-info-constraint"
          value={tableConstraint ?? ""}
          readOnly={isReadOnly}
          onChange={(event) => setTableConstraint?.(event.target.value)}
          className="min-h-[140px] resize-none"
        />
      </label>

      <label
        className="flex flex-col gap-2"
        htmlFor="table-info-primary-key-name"
      >
        <span className="font-medium text-slate-600">
          Constraint Name for Primary Key
        </span>
        <Input
          id="table-info-primary-key-name"
          type="text"
          value={primaryKeyName ?? ""}
          readOnly={isReadOnly}
          onChange={(event) => setPrimaryKeyName?.(event.target.value)}
          className="h-8 px-2 text-sm"
        />
      </label>

      <label className="flex flex-col gap-2" htmlFor="table-info-option">
        <span className="font-medium text-slate-600">Option</span>
        <Textarea
          id="table-info-option"
          value={option ?? ""}
          readOnly={isReadOnly}
          onChange={(event) => setOption?.(event.target.value)}
          className="min-h-[120px] resize-none"
        />
      </label>
    </div>
  );
}
