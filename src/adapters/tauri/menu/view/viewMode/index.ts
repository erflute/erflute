import { Submenu } from "@tauri-apps/api/menu";
import { logicalMenu } from "./logical";
import { logicalPhysicalMenu } from "./logicalPhysical";
import { physicalMenu } from "./physical";

export const viewModeMenu = await Submenu.new({
  text: "ViewMode",
  items: [physicalMenu, logicalMenu, logicalPhysicalMenu],
});
