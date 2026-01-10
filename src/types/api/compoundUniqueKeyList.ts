type Column = {
  columnId: string;
};

type Columns = {
  columns: Column[];
};

type CompoundUniqueKey = {
  name: string;
  columns: Columns;
};

export type CompoundUniqueKeyList = {
  compoundUniqueKeys?: CompoundUniqueKey[];
};
