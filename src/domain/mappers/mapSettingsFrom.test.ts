import type { DiagramSettingsResponse } from "@/types/api/diagramSettings";
import { ViewMode } from "@/types/domain/settings";
import { mapSettingsFrom } from "./settingsMapper";

const createDiagramSettingsResponse = (
  overrides: Partial<DiagramSettingsResponse> = {},
): DiagramSettingsResponse => ({
  database: "postgresql",
  viewMode: ViewMode.LogicalPhysical,
  ...overrides,
});

it("maps database and view mode from diagram settings response", () => {
  const result = mapSettingsFrom(
    createDiagramSettingsResponse({
      database: "mysql",
      viewMode: ViewMode.Physical,
    }),
  );

  expect(result).toEqual({
    database: "mysql",
    viewMode: ViewMode.Physical,
  });
});
