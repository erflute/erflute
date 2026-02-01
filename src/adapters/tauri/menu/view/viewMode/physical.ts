import { MenuItem } from "@tauri-apps/api/menu";
import { ViewMode } from "@/types/domain/settings";
import { updateViewMode } from "@/usecases/updateViewMode";

export const physicalMenu = await MenuItem.new({
  id: "physical",
  text: "Physical",
  action: () => updateViewMode(ViewMode.Physical),
});
