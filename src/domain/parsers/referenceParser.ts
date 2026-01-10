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

export function stringifyReference({
  prefix = "table",
  tableName,
  columnName,
}: Reference): string {
  const parts = [];
  for (const obj of [prefix, tableName, columnName]) {
    if (obj) {
      parts.push(obj);
    }
  }
  return parts.join(".");
}
