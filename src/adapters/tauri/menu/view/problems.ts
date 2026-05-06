import { MenuItem } from "@tauri-apps/api/menu";
import { toggleProblemsPanel } from "@/usecases/toggleProblemsPanel";

export const problemsMenu = await MenuItem.new({
  id: "problems",
  text: "Problems",
  accelerator: "CmdOrCtrl+Shift+M",
  action: toggleProblemsPanel,
});
