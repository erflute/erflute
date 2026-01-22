export const Cardinality = {
  One: "1",
  ZeroOne: "0..1",
  OneN: "1..n",
  ZeroN: "0..n",
} as const;

export type Cardinality = (typeof Cardinality)[keyof typeof Cardinality];

export const ReferenceOperation = {
  Restrict: "RESTRICT",
  Cascade: "CASCADE",
  SetNull: "SET NULL",
  SetDefault: "SET DEFAULT",
};

export type ReferenceOperation =
  (typeof ReferenceOperation)[keyof typeof ReferenceOperation];

export type Relationship = {
  name: string;
  source: string;
  target: string;
  fkColumnNames: string[];
  parentCardinality: Cardinality;
  childCardinality: Cardinality;
  referredColumn: string;
  referredColumnOptions: string[];
  onDeleteAction?: ReferenceOperation;
  onUpdateAction?: ReferenceOperation;
};
