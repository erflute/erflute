import { type DiagramSettingsResponse } from "@/types/api/diagramSettings";
import { type Settings } from "@/types/domain/settings";

export function mapSettingsFrom(
  diagramSettings: DiagramSettingsResponse,
): Settings {
  return {
    database: diagramSettings.database,
    viewMode: diagramSettings.viewMode,
  } satisfies Settings;
}
