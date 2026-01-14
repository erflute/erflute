import type { Cardinality, ReferenceOperation } from "../domain/relationship";
import type { CompoundUniqueKeyList } from "./compoundUniqueKeyList";
import type { Indexes } from "./indexes";

export type Color = {
  r: number;
  g: number;
  b: number;
};

type FkColumn = {
  fkColumnName: string;
};

type FkColumns = {
  fkColumn: FkColumn[];
};

type Relationship = {
  name: string;
  source: string;
  target: string;
  fkColumns: FkColumns;
  parentCardinality: Cardinality;
  childCardinality: Cardinality;
  referenceForPk: boolean;
  onDeleteAction?: ReferenceOperation;
  onUpdateAction?: ReferenceOperation;
  referredSimpleUniqueColumn?: string;
  referredCompoundUniqueKey?: string;
};

type Connections = {
  relationships: Relationship[];
};

type NormalColumn = {
  physicalName: string;
  logicalName?: string;
  description?: string;
  columnType?: string;
  length?: number;
  decimal?: number;
  unsigned?: boolean;
  notNull?: boolean;
  uniqueKey?: boolean;
  defaultValue?: string;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  referredColumn?: string;
  relationship?: string;
};

type Columns = {
  items?: (NormalColumn | string)[];
};

export type TableResponse = {
  physicalName: string;
  logicalName: string;
  description: string;
  height: number;
  width: number;
  fontName: string;
  fontSize: number;
  x: number;
  y: number;
  color: Color;
  connections: Connections;
  tableConstraint?: string;
  primaryKeyName?: string;
  option?: string;
  columns: Columns;
  indexes: Indexes;
  compoundUniqueKeyList: CompoundUniqueKeyList;
};

export type DiagramWalkersResponse = {
  tables?: TableResponse[];
};
