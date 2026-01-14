import { useViewModeStore } from "@/stores/viewModeStore";
import { Textarea } from "@/components/ui/textarea";
import type { DescriptionContentProps } from "./types";

export function DescriptionContent({
  description,
  setDescription,
}: DescriptionContentProps) {
  const { isReadOnly } = useViewModeStore();
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-slate-600">Table Description</span>
      <Textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        readOnly={isReadOnly}
        className="min-h-[150px]"
      />
    </label>
  );
}
