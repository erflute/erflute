import type { DialogProps } from "@/components/ui/dialog";
import type { Relationship } from "@/types/domain/relationship";

export type RelationInfoDialogProps = DialogProps & {
  data: Relationship;
  // Handlers run after the close animation to keep transitions smooth.
  onApply?: (data: Relationship) => void;
  // Handlers run after the close animation to keep transitions smooth.
  onCancel?: () => void;
};
