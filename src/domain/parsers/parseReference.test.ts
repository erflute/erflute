import { parseReference } from "./referenceParser";

it("parses prefix, table name, and column name from a three-part reference", () => {
  const result = parseReference("public.users.id");

  expect(result).toEqual({
    prefix: "public",
    tableName: "users",
    columnName: "id",
  });
});

it("returns only available parts when the reference has two segments", () => {
  const result = parseReference("users.id");

  expect(result).toEqual({
    prefix: "users",
    tableName: "id",
    columnName: undefined,
  });
});

it("returns undefined values when no segments are provided", () => {
  const result = parseReference("");

  expect(result).toEqual({
    prefix: "",
    tableName: undefined,
    columnName: undefined,
  });
});
