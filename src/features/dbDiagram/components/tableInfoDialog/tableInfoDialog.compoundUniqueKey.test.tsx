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
    description: "This is Member table",
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
      {
        physicalName: "EMAIL",
        logicalName: "Email",
        columnType: ColumnType.VarCharN,
        length: 150,
        notNull: false,
        unique: false,
      },
    ],
    compoundUniqueKeys: [],
    ...overrides,
  };
}

function renderTableInfoDialog(overrides?: Partial<Table>) {
  const onApply = jest.fn<
    ReturnType<(data: Table) => void>,
    Parameters<(data: Table) => void>
  >();
  const onOpenChange = jest.fn();
  render(
    <TableInfoDialog
      open
      data={createTableData(overrides)}
      onApply={onApply}
      onOpenChange={onOpenChange}
    />,
  );
  return { onApply, onOpenChange };
}

function renderEditableTableInfoDialog(overrides?: Partial<Table>) {
  useViewModeStore.setState({ ...initialViewModeState, isReadOnly: false });
  return renderTableInfoDialog(overrides);
}

function renderReadOnlyTableInfoDialog(overrides?: Partial<Table>) {
  useViewModeStore.setState({ ...initialViewModeState, isReadOnly: true });
  return renderTableInfoDialog(overrides);
}

async function openCompoundUniqueKeyTab(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.click(screen.getByRole("tab", { name: "Compound Unique Key" }));
  return {
    select: screen.getByRole("combobox", { name: "Compound Unique Key" }),
    nameInput: screen.getByLabelText("Constraint Name for UNIQUE KEY"),
  };
}

function getColumnCheckbox(columnId: string) {
  return screen.getByRole("checkbox", {
    name: `Mark ${columnId} as unique`,
  });
}

beforeEach(() => {
  useViewModeStore.setState(initialViewModeState);
});

describe("when editing is allowed", () => {
  it("shows available columns and disables actions before selection", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog({
      columns: [
        "PROFILE_GROUP",
        {
          physicalName: "ID",
          logicalName: "Id",
          columnType: ColumnType.Int,
          notNull: true,
          primaryKey: true,
          unique: true,
        },
        {
          physicalName: "EMAIL",
          logicalName: "Email",
          columnType: ColumnType.VarCharN,
          length: 150,
          notNull: false,
          unique: false,
        },
      ],
    });

    const { nameInput } = await openCompoundUniqueKeyTab(user);

    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("EMAIL")).toBeInTheDocument();
    expect(screen.queryByText("PROFILE_GROUP")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Update" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();

    await user.type(nameInput, "UK_MEMBERS_EMAIL");
  });

  it("enables Add once the name and a column are selected", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog({
      columns: [
        "PROFILE_GROUP",
        {
          physicalName: "ID",
          logicalName: "Id",
          columnType: ColumnType.Int,
          notNull: true,
          primaryKey: true,
          unique: true,
        },
        {
          physicalName: "EMAIL",
          logicalName: "Email",
          columnType: ColumnType.VarCharN,
          length: 150,
          notNull: false,
          unique: false,
        },
      ],
    });

    const { nameInput } = await openCompoundUniqueKeyTab(user);

    await user.type(nameInput, "UK_MEMBERS_EMAIL");
    await user.click(getColumnCheckbox("EMAIL"));

    expect(screen.getByRole("button", { name: "Add" })).toBeEnabled();
  });

  it("adds a new compound unique key from the name and selected columns", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();

    const { select, nameInput } = await openCompoundUniqueKeyTab(user);

    await user.type(nameInput, "UK_MEMBERS_EMAIL");
    await user.click(getColumnCheckbox("ID"));
    await user.click(getColumnCheckbox("EMAIL"));

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(
      screen.getByRole("option", { name: "UK_MEMBERS_EMAIL" }),
    ).toBeInTheDocument();
    expect(select).toHaveValue("0");
    expect(screen.getByRole("button", { name: "Update" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();
  });

  it("updates the selected unique key name and columns", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog({
      compoundUniqueKeys: [
        { name: "UK_MEMBERS", columns: ["table.MEMBERS.ID"] },
      ],
    });

    const { select, nameInput } = await openCompoundUniqueKeyTab(user);

    await user.selectOptions(select, "0");

    expect(nameInput).toHaveValue("UK_MEMBERS");
    expect(getColumnCheckbox("ID")).toBeChecked();
    expect(getColumnCheckbox("EMAIL")).not.toBeChecked();

    await user.clear(nameInput);
    await user.type(nameInput, "UK_MEMBERS_EMAIL");
    await user.click(getColumnCheckbox("ID"));
    await user.click(getColumnCheckbox("EMAIL"));

    await user.click(screen.getByRole("button", { name: "Update" }));

    expect(
      screen.getByRole("option", { name: "UK_MEMBERS_EMAIL" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "UK_MEMBERS" })).toBeNull();
    expect(getColumnCheckbox("ID")).not.toBeChecked();
    expect(getColumnCheckbox("EMAIL")).toBeChecked();
  });

  it("removes the selected unique key and clears the selection", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog({
      compoundUniqueKeys: [{ name: "UK_MEMBERS", columns: ["ID"] }],
    });

    const { nameInput, select } = await openCompoundUniqueKeyTab(user);

    await user.selectOptions(select, "0");

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.queryByRole("option", { name: "UK_MEMBERS" })).toBeNull();
    expect(select).toHaveValue("new");
    expect(nameInput).toHaveValue("");
    expect(getColumnCheckbox("ID")).not.toBeChecked();
    expect(getColumnCheckbox("EMAIL")).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Update" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("shows a placeholder when no columns are available", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog({ columns: [] });

    await openCompoundUniqueKeyTab(user);

    expect(
      screen.getByText("Columns will appear here once added."),
    ).toBeInTheDocument();
  });
});

describe("in read-only mode", () => {
  it("renders unique key inputs as read-only and disables actions", async () => {
    const user = userEvent.setup();
    renderReadOnlyTableInfoDialog({
      compoundUniqueKeys: [{ name: "UK_MEMBERS", columns: ["ID"] }],
    });

    const { nameInput } = await openCompoundUniqueKeyTab(user);

    expect(nameInput).toHaveAttribute("readonly");
    expect(
      screen.getByRole("option", { name: "Select unique key" }),
    ).toBeInTheDocument();
    expect(getColumnCheckbox("ID")).toBeDisabled();
    expect(getColumnCheckbox("EMAIL")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Update" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });
});
