import { Submenu } from "@tauri-apps/api/menu";
import { viewModeMenu } from "./viewMode";

export const viewMenu = await Submenu.new({
  text: "View",
  items: [viewModeMenu],
});
