import type { VDiagramResponse } from "@/types/api/vdiagrams";
import { mapVDiagramsFrom } from "./vdiagramMapper";

const createVDiagramResponse = (
  overrides: Partial<VDiagramResponse> = {},
): VDiagramResponse => ({
  vdiagramName: "default",
  vtables: {
    vtables: [
      {
        tableId: "table.USERS",
        x: 10,
        y: 20,
        fontName: "Ubuntu",
        fontSize: 9,
      },
    ],
  },
  walkerNotes: {},
  walkerGroups: {},
  ...overrides,
});

it("maps virtual diagram properties and nested virtual tables", () => {
  const result = mapVDiagramsFrom([
    createVDiagramResponse({
      vdiagramName: "main",
      color: { r: 255, g: 255, b: 255 },
      vtables: {
        vtables: [
          {
            tableId: "table.MEMBER",
            x: 52,
            y: 86,
            fontName: "Ubuntu",
            fontSize: 9,
          },
          {
            tableId: "table.MEMBER_FOLLOWING",
            x: 492,
            y: 445,
            fontName: "Ubuntu",
            fontSize: 9,
          },
        ],
      },
    }),
  ]);

  expect(result).toEqual([
    {
      vdiagramName: "main",
      color: { r: 255, g: 255, b: 255 },
      vtables: [
        {
          tableId: "table.MEMBER",
          x: 52,
          y: 86,
          fontName: "Ubuntu",
          fontSize: 9,
        },
        {
          tableId: "table.MEMBER_FOLLOWING",
          x: 492,
          y: 445,
          fontName: "Ubuntu",
          fontSize: 9,
        },
      ],
      walkerNotes: {},
      walkerGroups: {},
    },
  ]);
});
