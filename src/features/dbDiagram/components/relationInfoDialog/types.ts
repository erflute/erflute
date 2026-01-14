import type { DialogProps } from "@/components/ui/dialog";
import type { Relationship } from "@/types/domain/relationship";

export type RelationInfoDialogProps = DialogProps & {
  data: Relationship;
  onApply?: (data: Relationship) => void;
  onCancel?: () => void;
};
