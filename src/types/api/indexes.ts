type Column = {
  columnId: string;
  desc?: boolean;
};

type Columns = {
  columns: Column[];
};

type Index = {
  name: string;
  indexType: string;
  description?: string;
  fullText?: boolean;
  nonUnique?: boolean;
  columns: Columns;
};

export type Indexes = {
  indexes?: Index[];
};
