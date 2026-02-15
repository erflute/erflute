import type { Column } from "./column";

export type ColumnGroupName = string;

export function isColumnGroupName(
  value: Column | ColumnGroupName,
): value is ColumnGroupName {
  return typeof value === "string";
}

export type Color = {
  r: number;
  g: number;
  b: number;
};

export type IndexColumn = {
  columnId: string;
  desc?: boolean;
};

export type Index = {
  name: string;
  indexType: string;
  description?: string;
  fullText?: boolean;
  nonUnique?: boolean;
  columns: IndexColumn[];
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
  indexes?: Index[];
  compoundUniqueKeys?: CompoundUniqueKey[];
};
