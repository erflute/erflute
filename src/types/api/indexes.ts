type Column = {
  columnId: string;
  desc?: boolean;
};

type Index = {
  name: string;
  indexType: string;
  description?: string;
  fullText?: boolean;
  nonUnique?: boolean;
  columns: Column[];
};

export type Indexes = Index[];
