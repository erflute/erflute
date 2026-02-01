import { type ViewMode } from "@/types/domain/settings";

export type DiagramSettingsResponse = {
  database: string;
  viewMode: ViewMode;
};
