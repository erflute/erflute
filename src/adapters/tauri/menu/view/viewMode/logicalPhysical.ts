import { MenuItem } from "@tauri-apps/api/menu";
import { ViewMode } from "@/types/domain/settings";
import { updateViewMode } from "@/usecases/updateViewMode";

export const logicalPhysicalMenu = await MenuItem.new({
  id: "logicalPhysical",
  text: "Logical/Physical",
  action: () => updateViewMode(ViewMode.LogicalPhysical),
});
