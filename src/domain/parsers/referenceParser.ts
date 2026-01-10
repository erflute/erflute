export type Reference = {
  prefix?: string;
  tableName?: string;
  columnName?: string;
};

export function parseReference(input: string): Reference {
  const parts = input.split(".");
  return {
    prefix: parts?.[0],
    tableName: parts?.[1],
    columnName: parts?.[2],
  };
}
