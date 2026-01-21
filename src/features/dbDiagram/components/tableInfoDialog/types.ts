import { type DialogProps } from "@/components/ui/dialog";
import { type Table } from "@/types/domain/table";

export type TableInfoDialogProps = DialogProps & {
  data: Table;
  // Handlers run after the close animation to keep transitions smooth.
  onApply?: (data: Table) => void;
  // Handlers run after the close animation to keep transitions smooth.
  onCancel?: () => void;
};
