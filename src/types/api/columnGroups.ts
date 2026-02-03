type NormalColumn = {
  physicalName: string;
  logicalName?: string;
  description?: string;
  columnType: string;
  length?: number;
  decimal?: number;
  args?: string;
  notNull?: boolean;
  uniqueKey?: boolean;
  unsigned?: boolean;
  defaultValue?: string;
};

type Columns = {
  normalColumns?: NormalColumn[];
};

export type ColumnGroupResponse = {
  columnGroupName: string;
  columns: Columns;
};

export type ColumnGroupsResponse = {
  columnGroups?: ColumnGroupResponse[];
};
