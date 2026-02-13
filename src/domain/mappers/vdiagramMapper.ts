import type { VDiagramResponse } from "@/types/api/vdiagrams";
import type { VirtualDiagram, VirtualTable } from "@/types/domain/vdiagram";

export function mapVDiagramsFrom(
  vdiagramResponses: VDiagramResponse[],
): VirtualDiagram[] {
  return vdiagramResponses.map((vdiagram) => {
    return {
      vdiagramName: vdiagram.vdiagramName,
      color: vdiagram.color,
      vtables: (vdiagram.vtables.vtables ?? []).map((vtable) => {
        return {
          tableId: vtable.tableId,
          x: vtable.x,
          y: vtable.y,
          fontName: vtable.fontName,
          fontSize: vtable.fontSize,
        } satisfies VirtualTable;
      }),
      walkerNotes: vdiagram.walkerNotes,
      walkerGroups: vdiagram.walkerGroups,
    } satisfies VirtualDiagram;
  });
}
