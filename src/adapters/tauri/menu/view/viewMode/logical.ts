import { MenuItem } from "@tauri-apps/api/menu";
import { ViewMode } from "@/types/domain/settings";
import { updateViewMode } from "@/usecases/updateViewMode";

export const logicalMenu = await MenuItem.new({
  id: "logical",
  text: "Logical",
  action: () => updateViewMode(ViewMode.Logical),
});
