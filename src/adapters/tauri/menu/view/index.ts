import { PredefinedMenuItem, Submenu } from "@tauri-apps/api/menu";
import { problemsMenu } from "./problems";
import { viewModeMenu } from "./viewMode";

const separator = await PredefinedMenuItem.new({
  item: "Separator",
});

export const viewMenu = await Submenu.new({
  text: "View",
  items: [viewModeMenu, separator, problemsMenu],
});
