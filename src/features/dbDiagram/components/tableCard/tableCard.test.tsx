import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useViewModeStore } from "@/stores/viewModeStore";
import { ColumnType } from "@/types/domain/columnType";
import type { Table } from "@/types/domain/table";
import { TableCard } from ".";

const initialState = useViewModeStore.getState();

const createTable = (overrides?: Partial<Table>): Table => ({
  color: { r: 10, g: 20, b: 30, ...(overrides?.color ?? {}) },
  x: 0,
  y: 0,
  width: 180,
  height: 120,
  physicalName: "users",
  logicalName: "",
  description: "",
  columns: [
    {
      physicalName: "id",
      columnType: ColumnType.IntN,
      length: 11,
      notNull: true,
      primaryKey: true,
    },
    {
      physicalName: "companyId",
      columnType: undefined,
      notNull: false,
      referredColumn: "companies.id",
    },
  ],
  ...overrides,
});

beforeEach(() => {
  useViewModeStore.setState(initialState);
});

it("renders the table header and columns with formatted types", () => {
  const table = createTable();

  render(<TableCard width={200} height={140} data={table} />);

  expect(screen.getByRole("heading", { name: "users" })).toBeInTheDocument();
  expect(screen.getByText("id: int(11)")).toBeInTheDocument();
  expect(screen.getByText("companyId")).toBeInTheDocument();
});

it("shows primary key, foreign key and not-null indicators for flagged columns", () => {
  const table = createTable();

  render(<TableCard data={table} />);

  expect(screen.getByLabelText("Column id is primary key")).toBeInTheDocument();
  expect(
    screen.queryByLabelText("Column id is foreigin key"),
  ).not.toBeInTheDocument();
  expect(screen.getByLabelText("Column id is not null")).toBeInTheDocument();
  expect(
    screen.queryByLabelText("Column companyId is primary key"),
  ).not.toBeInTheDocument();
  expect(
    screen.getByLabelText("Column companyId is foreign key"),
  ).toBeInTheDocument();
  expect(
    screen.queryByLabelText("Column companyId is not null"),
  ).not.toBeInTheDocument();
});

it("calls the header double-click handler", async () => {
  const table = createTable();
  const handleHeaderDoubleClick = jest.fn();
  const user = userEvent.setup();
  render(
    <TableCard data={table} onHeaderDoubleClick={handleHeaderDoubleClick} />,
  );

  await user.dblClick(screen.getByRole("heading", { name: "users" }));

  expect(handleHeaderDoubleClick).toHaveBeenCalledTimes(1);
});

it("renders index names when indexes exist", () => {
  const table = createTable({
    indexes: [
      {
        name: "IX_users_test",
        indexType: "BTREE",
        nonUnique: true,
        columns: [],
      },
      {
        name: "IX_users_test2",
        indexType: "BTREE",
        nonUnique: true,
        columns: [],
      },
    ],
  });

  render(<TableCard data={table} />);

  expect(screen.getByText("<< index >>")).toBeInTheDocument();
  expect(screen.getByText("IX_users_test")).toBeInTheDocument();
  expect(screen.getByText("IX_users_test2")).toBeInTheDocument();
});
