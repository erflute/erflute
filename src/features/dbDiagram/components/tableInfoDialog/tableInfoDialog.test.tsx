import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useViewModeStore } from "@/stores/viewModeStore";
import { ColumnType } from "@/types/domain/columnType";
import type { Table } from "@/types/domain/table";
import { TableInfoDialog } from ".";

const initialViewModeState = useViewModeStore.getState();

function createTableData(overrides?: Partial<Table>): Table {
  return {
    x: 0,
    y: 0,
    width: 240,
    height: 120,
    physicalName: "MEMBERS",
    logicalName: "Members",
    description: "",
    color: { r: 80, g: 120, b: 200 },
    columns: [
      {
        physicalName: "ID",
        logicalName: "Id",
        columnType: ColumnType.Int,
        notNull: true,
        primaryKey: true,
        unique: true,
      },
    ],
    ...overrides,
  };
}

function renderTableInfoDialog(overrides?: Partial<Table>) {
  const onApply = jest.fn<
    ReturnType<(data: Table) => void>,
    Parameters<(data: Table) => void>
  >();
  const onCancel = jest.fn();
  const onOpenChange = jest.fn();
  render(
    <TableInfoDialog
      open
      data={createTableData(overrides)}
      onApply={onApply}
      onCancel={onCancel}
      onOpenChange={onOpenChange}
    />,
  );
  return { onApply, onCancel, onOpenChange };
}

beforeEach(() => {
  useViewModeStore.setState(initialViewModeState);
});

it("applies the current table data and closes when OK is clicked", async () => {
  const user = userEvent.setup();
  const { onApply } = renderTableInfoDialog({
    physicalName: "  MEMBERS  ",
    logicalName: "  Members  ",
    description: "  This is Member table   ",
    tableConstraint: "  constraint_a\nconstraint_b  ",
    primaryKeyName: "  PK_MEMBERS  ",
    option: "  option_a\noption_b  ",
    compoundUniqueKeys: [
      {
        name: "  MEMBERS_NAME  ",
        columns: ["  FIRST_NAME  ", "  LAST_NAME  ", "   "],
      },
      {
        name: "   ",
        columns: ["MEMBER_NO"],
      },
    ],
    columns: [
      {
        physicalName: "  AMOUNT  ",
        logicalName: "  Amount  ",
        description: "  Amount descirption    ",
        columnType: ColumnType.DecimalPS,
        length: 10,
        decimal: 2,
        notNull: true,
        unique: false,
        defaultValue: "0.00",
        primaryKey: false,
        autoIncrement: false,
        referredColumn: "  PROFILES.AMOUNT  ",
        enumArgs: undefined,
      },
    ],
  });

  await user.click(screen.getByRole("button", { name: "OK" }));

  expect(onApply).toHaveBeenCalledTimes(1);
  const appliedTable = onApply.mock.calls[0][0];
  expect(appliedTable).toMatchObject({
    physicalName: "MEMBERS",
    logicalName: "Members",
    description: "This is Member table",
    tableConstraint: "constraint_a\nconstraint_b",
    primaryKeyName: "PK_MEMBERS",
    option: "option_a\noption_b",
    compoundUniqueKeys: [
      {
        name: "MEMBERS_NAME",
        columns: ["FIRST_NAME", "LAST_NAME"],
      },
    ],
    columns: [
      expect.objectContaining({
        physicalName: "AMOUNT",
        logicalName: "Amount",
        columnType: ColumnType.DecimalPS,
        length: 10,
        decimal: 2,
        notNull: true,
        unique: false,
        defaultValue: "0.00",
        primaryKey: false,
        autoIncrement: false,
        referredColumn: "PROFILES.AMOUNT",
        enumArgs: undefined,
      }),
    ],
  });
});

it("cancels and closes when Cancel is clicked", async () => {
  const user = userEvent.setup();
  const { onApply, onCancel, onOpenChange } = renderTableInfoDialog();

  await user.click(screen.getByRole("button", { name: "Cancel" }));

  expect(onApply).not.toHaveBeenCalled();
  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onOpenChange).toHaveBeenCalledWith(false);
});
