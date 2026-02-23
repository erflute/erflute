import type { Color } from "./table";

export type VirtualTable = {
  tableId: string;
  x: number;
  y: number;
  fontName: string;
  fontSize: number;
};

export type VirtualDiagram = {
  vdiagramName: string;
  color?: Color;
  vtables: VirtualTable[];
  walkerNotes: Record<string, never>;
  walkerGroups: Record<string, never>;
};
