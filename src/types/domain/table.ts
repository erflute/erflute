import type { Column } from "./column";

export type ColumnGroupName = string;

export function isColumnGroupName(
  value: Column | ColumnGroupName,
): value is ColumnGroupName {
  return typeof value === "string";
}

type Color = {
  r: number;
  g: number;
  b: number;
};

export type CompoundUniqueKey = {
  name: string;
  columns: string[];
};

export type Table = {
  color: Color;
  x: number;
  y: number;
  width: number;
  height: number;
  physicalName: string;
  logicalName: string;
  description: string;
  tableConstraint?: string;
  primaryKeyName?: string;
  option?: string;
  columns?: (Column | ColumnGroupName)[];
  compoundUniqueKeys?: CompoundUniqueKey[];
};
