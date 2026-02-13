import type { Color } from "./diagramWalkers";

export type VTableResponse = {
  tableId: string;
  x: number;
  y: number;
  fontName: string;
  fontSize: number;
};

export type VTablesResponse = {
  vtables?: VTableResponse[];
};

export type VDiagramResponse = {
  vdiagramName: string;
  color?: Color;
  vtables: VTablesResponse;
  walkerNotes: Record<string, never>;
  walkerGroups: Record<string, never>;
};

export type VDiagramsResponse = {
  vdiagrams: VDiagramResponse[];
};
