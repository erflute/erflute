import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useDiagramStore } from "@/stores/diagramStore";
import { useViewModeStore } from "@/stores/viewModeStore";
import { ColumnType } from "@/types/domain/columnType";
import type { Table } from "@/types/domain/table";
import { TableInfoDialog } from ".";

const initialDiagramState = useDiagramStore.getState();
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
    ...overrides,
  };
}

function renderTableInfoDialog(overrides?: Partial<Table>) {
  const onApply = jest.fn();
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

function seedColumnGroups() {
  const columnGroupName = "PROFILE_GROUP";
  useDiagramStore.setState({
    ...initialDiagramState,
    columnGroups: [
      {
        columnGroupName,
        columns: [
          {
            physicalName: "PROFILE_ID",
            logicalName: "Profile Id",
            columnType: ColumnType.Int,
            notNull: true,
            primaryKey: true,
            unique: true,
          },
          {
            physicalName: "PROFILE_TYPE",
            logicalName: "Profile Type",
            columnType: ColumnType.VarCharN,
            length: 80,
            notNull: false,
            primaryKey: false,
            unique: false,
          },
        ],
      },
    ],
  });
  return columnGroupName;
}

function getColumnRow(physicalName: string): HTMLTableRowElement {
  return screen.getByRole("row", {
    name: (_name, element) =>
      element instanceof HTMLElement &&
      element.tagName === "TR" &&
      within(element).queryByText(physicalName, { exact: true }) != null,
  });
}

async function openDetailFor(
  user: ReturnType<typeof userEvent.setup>,
  physicalName: string,
) {
  await user.dblClick(getColumnRow(physicalName));
  return screen.findByRole("region", { name: "Column Details" });
}

beforeEach(() => {
  useDiagramStore.setState(initialDiagramState);
  useViewModeStore.setState(initialViewModeState);
});

describe("when editing is allowed", () => {
  it("renders the Attribute tab content with table metadata and columns", () => {
    renderEditableTableInfoDialog();

    const physicalNameInput = screen.getByLabelText("Physical Name");
    expect(physicalNameInput).toHaveValue("MEMBERS");
    expect(physicalNameInput).not.toHaveAttribute("readonly");

    const logicalNameInput = screen.getByLabelText("Logical Name");
    expect(logicalNameInput).toHaveValue("Members");
    expect(logicalNameInput).not.toHaveAttribute("readonly");

    const idRow = getColumnRow("ID");
    expect(idRow).toBeInTheDocument();
    expect(within(idRow).getByText("int")).toBeInTheDocument();
    expect(within(idRow).getByLabelText("Primary key")).toBeInTheDocument();
    expect(
      within(idRow).getByRole("checkbox", {
        name: "Column ID is not null",
      }),
    ).toBeChecked();
    expect(
      within(idRow).getByRole("checkbox", {
        name: "Column ID is unique",
      }),
    ).toBeChecked();

    const emailRow = getColumnRow("EMAIL");
    expect(emailRow).toBeInTheDocument();
    expect(
      within(emailRow).queryByLabelText("Primary key"),
    ).not.toBeInTheDocument();
    expect(within(emailRow).getByText("varchar(150)")).toBeInTheDocument();
    expect(
      within(emailRow).getByRole("checkbox", {
        name: "Column EMAIL is not null",
      }),
    ).not.toBeChecked();
    expect(
      within(emailRow).getByRole("checkbox", {
        name: "Column EMAIL is unique",
      }),
    ).not.toBeChecked();
  });

  it("opens the column detail view on double-click", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();

    const detailRegion = await openDetailFor(user, "EMAIL");

    expect(within(detailRegion).getByLabelText("Physical Name")).toHaveValue(
      "EMAIL",
    );
  });

  it("returns to the list when back is clicked from the detail view", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();
    await openDetailFor(user, "EMAIL");

    await user.click(screen.getByRole("button", { name: "Back to Columns" }));

    expect(
      screen.queryByRole("region", { name: "Column Details" }),
    ).not.toBeInTheDocument();
    expect(getColumnRow("EMAIL")).toBeInTheDocument();
  });

  it("shows a placeholder message when no columns are defined", () => {
    renderEditableTableInfoDialog({ columns: [] });

    expect(
      screen.getByText("Columns will appear here once added."),
    ).toBeInTheDocument();
  });

  it("shows a foreign key indicator when a referred column is set", () => {
    renderEditableTableInfoDialog({
      columns: [
        {
          physicalName: "PROFILE_ID",
          logicalName: "Profile Id",
          columnType: ColumnType.Int,
          referredColumn: "PROFILES.ID",
          notNull: false,
          primaryKey: false,
          unique: false,
        },
        {
          physicalName: "EMAIL",
          logicalName: "Email",
          columnType: ColumnType.VarCharN,
          length: 150,
          notNull: false,
          primaryKey: false,
          unique: false,
        },
      ],
    });

    const profileRow = getColumnRow("PROFILE_ID");
    expect(
      within(profileRow).getByLabelText("Foreign key"),
    ).toBeInTheDocument();

    const emailRow = getColumnRow("EMAIL");
    expect(
      within(emailRow).queryByLabelText("Foreign key"),
    ).not.toBeInTheDocument();
  });

  it("renders a column group row", () => {
    renderEditableTableInfoDialog({
      columns: [seedColumnGroups(), createTableData().columns![0]],
    });

    const groupRow = screen.getByRole("button", { name: "PROFILE_GROUP" });
    expect(groupRow).toBeInTheDocument();
    expect(screen.queryByText("PROFILE_ID")).not.toBeInTheDocument();
  });

  it("expands a column group to show grouped columns", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog({
      columns: [seedColumnGroups(), createTableData().columns![0]],
    });

    const groupRow = screen.getByRole("button", { name: "PROFILE_GROUP" });
    await user.click(groupRow);

    const profileIdRow = getColumnRow("PROFILE_ID");
    expect(profileIdRow).toBeInTheDocument();
    expect(within(profileIdRow).getByText("int")).toBeInTheDocument();
    expect(
      within(profileIdRow).getByRole("checkbox", {
        name: "Column PROFILE_ID is not null",
      }),
    ).toBeChecked();
    expect(
      within(profileIdRow).getByRole("checkbox", {
        name: "Column PROFILE_ID is unique",
      }),
    ).toBeChecked();

    const profileTypeRow = getColumnRow("PROFILE_TYPE");
    expect(profileTypeRow).toBeInTheDocument();
    expect(within(profileTypeRow).getByText("varchar(80)")).toBeInTheDocument();
  });

  it("collapses a column group to hide grouped columns", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog({
      columns: [seedColumnGroups(), createTableData().columns![0]],
    });

    const groupRow = screen.getByRole("button", { name: "PROFILE_GROUP" });
    await user.click(groupRow);
    expect(screen.getByText("PROFILE_ID")).toBeInTheDocument();

    await user.click(groupRow);

    expect(screen.queryByText("PROFILE_ID")).not.toBeInTheDocument();
    expect(screen.queryByText("PROFILE_TYPE")).not.toBeInTheDocument();
  });

  it("keeps Edit/Delete disabled before any row is selected", () => {
    renderEditableTableInfoDialog();

    expect(screen.getByRole("button", { name: "Add" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Edit" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("enables Edit/Delete after a row is selected", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();

    await user.click(getColumnRow("EMAIL"));

    expect(screen.getByRole("button", { name: "Edit" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();
  });

  it("opens the detail view when Add is clicked", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();

    await user.click(screen.getByRole("button", { name: "Add" }));

    const detailRegion = await screen.findByRole("region", {
      name: "Column Details",
    });
    expect(within(detailRegion).getByLabelText("Physical Name")).toHaveValue(
      "",
    );
  });

  it("opens the detail view for the selected row when Edit is clicked", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();
    await user.click(getColumnRow("EMAIL"));

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const detailRegion = await screen.findByRole("region", {
      name: "Column Details",
    });
    expect(within(detailRegion).getByLabelText("Physical Name")).toHaveValue(
      "EMAIL",
    );
  });

  // This scenario performs many sequential user interactions and can exceed
  // Jest's default timeout during full-suite runs under load.
  it("updates column details and persists them after returning to the list", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();

    const detailRegion = await openDetailFor(user, "EMAIL");

    await user.clear(within(detailRegion).getByLabelText("Physical Name"));
    await user.type(
      within(detailRegion).getByLabelText("Physical Name"),
      "EMAIL_ADDRESS",
    );
    await user.clear(within(detailRegion).getByLabelText("Logical Name"));
    await user.type(
      within(detailRegion).getByLabelText("Logical Name"),
      "Email Address",
    );
    await user.selectOptions(
      within(detailRegion).getByLabelText("Type"),
      ColumnType.DoubleMD,
    );
    await user.clear(within(detailRegion).getByLabelText("Length"));
    await user.type(within(detailRegion).getByLabelText("Length"), "12");
    await user.clear(within(detailRegion).getByLabelText("Decimal"));
    await user.type(within(detailRegion).getByLabelText("Decimal"), "2");
    await user.click(within(detailRegion).getByLabelText("Unsigned"));
    await user.click(within(detailRegion).getByLabelText("Primary Key"));
    await user.click(within(detailRegion).getByLabelText("Not Null"));
    await user.click(within(detailRegion).getByLabelText("Unique"));
    await user.click(within(detailRegion).getByLabelText("Auto Increment"));
    await user.clear(within(detailRegion).getByLabelText("Default Value"));
    await user.type(within(detailRegion).getByLabelText("Default Value"), "0");
    await user.clear(within(detailRegion).getByLabelText("Description"));
    await user.type(
      within(detailRegion).getByLabelText("Description"),
      "Billing amount",
    );

    await user.click(screen.getByRole("button", { name: "Back to Columns" }));

    const updatedDetailRegion = await openDetailFor(user, "EMAIL_ADDRESS");

    expect(
      within(updatedDetailRegion).getByLabelText("Physical Name"),
    ).toHaveValue("EMAIL_ADDRESS");
    expect(
      within(updatedDetailRegion).getByLabelText("Logical Name"),
    ).toHaveValue("Email Address");
    expect(within(updatedDetailRegion).getByLabelText("Type")).toHaveValue(
      ColumnType.DoubleMD,
    );
    expect(within(updatedDetailRegion).getByLabelText("Length")).toHaveValue(
      12,
    );
    expect(within(updatedDetailRegion).getByLabelText("Decimal")).toHaveValue(
      2,
    );
    expect(
      within(updatedDetailRegion).getByLabelText("Unsigned"),
    ).toBeChecked();
    expect(
      within(updatedDetailRegion).getByLabelText("Primary Key"),
    ).toBeChecked();
    expect(
      within(updatedDetailRegion).getByLabelText("Not Null"),
    ).toBeChecked();
    expect(within(updatedDetailRegion).getByLabelText("Unique")).toBeChecked();
    expect(
      within(updatedDetailRegion).getByLabelText("Auto Increment"),
    ).toBeChecked();
    expect(
      within(updatedDetailRegion).getByLabelText("Default Value"),
    ).toHaveValue("0");
    expect(
      within(updatedDetailRegion).getByLabelText("Description"),
    ).toHaveValue("Billing amount");
  }, 15000);

  it("updates enum args when the column type supports it", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();

    const detailRegion = await openDetailFor(user, "EMAIL");

    await user.selectOptions(
      within(detailRegion).getByLabelText("Type"),
      ColumnType.Enum,
    );
    await user.clear(
      within(detailRegion).getByLabelText("Args of enum/set Type"),
    );
    await user.type(
      within(detailRegion).getByLabelText("Args of enum/set Type"),
      "active,inactive,pending",
    );

    await user.click(screen.getByRole("button", { name: "Back to Columns" }));

    const updatedDetailRegion = await openDetailFor(user, "EMAIL");

    expect(within(updatedDetailRegion).getByLabelText("Type")).toHaveValue(
      ColumnType.Enum,
    );
    expect(
      within(updatedDetailRegion).getByLabelText("Args of enum/set Type"),
    ).toHaveValue("active,inactive,pending");
  });

  it("deletes the selected row when Delete is clicked", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();
    await user.click(getColumnRow("EMAIL"));

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.queryByText("EMAIL")).not.toBeInTheDocument();
    expect(getColumnRow("ID")).toBeInTheDocument();
  });
});

describe("in read-only mode", () => {
  it("renders the Attribute tab content with table metadata and columns", () => {
    renderReadOnlyTableInfoDialog();

    const physicalNameInput = screen.getByLabelText("Physical Name");
    expect(physicalNameInput).toHaveValue("MEMBERS");
    expect(physicalNameInput).toHaveAttribute("readonly");

    const logicalNameInput = screen.getByLabelText("Logical Name");
    expect(logicalNameInput).toHaveValue("Members");
    expect(logicalNameInput).toHaveAttribute("readonly");

    const idRow = getColumnRow("ID");
    expect(idRow).toBeInTheDocument();
    expect(within(idRow).getByText("int")).toBeInTheDocument();
    expect(
      within(idRow).getByLabelText("Column ID is not null"),
    ).toBeInTheDocument();
    expect(
      within(idRow).getByLabelText("Column ID is unique"),
    ).toBeInTheDocument();

    const emailRow = getColumnRow("EMAIL");
    expect(emailRow).toBeInTheDocument();
    expect(within(emailRow).getByText("varchar(150)")).toBeInTheDocument();
    expect(
      within(emailRow).queryByLabelText("Column EMAIL is not null"),
    ).not.toBeInTheDocument();
    expect(
      within(emailRow).queryByLabelText("Column EMAIL is unique"),
    ).not.toBeInTheDocument();
  });

  it("keeps Add/Delete disabled while enabling Edit after selection", async () => {
    const user = userEvent.setup();
    renderReadOnlyTableInfoDialog();

    await user.click(getColumnRow("EMAIL"));

    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Edit" })).toBeEnabled();
  });

  it("opens the detail view for the selected row when Edit is clicked", async () => {
    const user = userEvent.setup();
    renderReadOnlyTableInfoDialog();
    await user.click(getColumnRow("EMAIL"));

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const detailRegion = await screen.findByRole("region", {
      name: "Column Details",
    });
    expect(within(detailRegion).getByLabelText("Physical Name")).toHaveValue(
      "EMAIL",
    );
  });
});
