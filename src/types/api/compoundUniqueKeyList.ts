type Column = {
  columnId: string;
};

type CompoundUniqueKey = {
  name: string;
  columns: Column[];
};

export type CompoundUniqueKeyList = {
  compoundUniqueKeys?: CompoundUniqueKey[];
};
