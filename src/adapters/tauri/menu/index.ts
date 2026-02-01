import { Menu } from "@tauri-apps/api/menu";
import { fileMenu } from "./file";
import { viewMenu } from "./view";

// Although Tauri provides PredefinedMenuItem, its behavior is inconsistent on Linux.
// To ensure consistent cross-platform behavior, an equivalent menu item is implemented manually.
export async function setupWindowMenu() {
  const menu = await Menu.new({
    items: [fileMenu, viewMenu],
  });
  await menu.setAsAppMenu();
}
