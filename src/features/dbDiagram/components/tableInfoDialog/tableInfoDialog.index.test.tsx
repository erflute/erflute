import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stringifyReference } from "@/domain/parsers/referenceParser";
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
    indexes: [],
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

async function openIndexTab(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("tab", { name: "Index" }));
  const tabPanel = await screen.findByRole("tabpanel", { name: "Index" });
  return {
    tabPanel,
    indexSelect: within(tabPanel).getByLabelText("Index", {
      selector: "select",
    }),
  };
}

function getIndexActionButtons(container: HTMLElement) {
  const indexSelect = within(container).getByLabelText("Index", {
    selector: "select",
  });
  const actionContainer = indexSelect.parentElement;
  if (!actionContainer) {
    throw new Error("Index action container not found.");
  }
  return {
    add: within(actionContainer).getByRole("button", { name: "Add" }),
    update: within(actionContainer).getByRole("button", { name: "Update" }),
    delete: within(actionContainer).getByRole("button", { name: "Delete" }),
  };
}

function getAvailableColumnsSection(container: HTMLElement) {
  const heading = within(container).getByText("Available columns");
  const section = heading.parentElement;
  if (!section) {
    throw new Error("Available columns section not found.");
  }
  return section;
}

function getIndexColumnsSection(container: HTMLElement) {
  const heading = within(container).getByText("Index Column");
  const section = heading.parentElement;
  if (!section) {
    throw new Error("Index columns section not found.");
  }
  return section;
}

function getTableRowByColumnName(section: HTMLElement, columnName: string) {
  return within(section).getByRole("row", {
    name: (_name, element) =>
      element instanceof HTMLElement &&
      element.tagName === "TR" &&
      within(element).queryByText(columnName, { exact: true }) != null,
  });
}

function getIndexColumnNames(section: HTMLElement) {
  return within(section)
    .getAllByRole("row")
    .filter(
      (row) =>
        within(row).queryByRole("checkbox", { name: "Sort descending" }) !=
        null,
    )
    .map((row) => {
      const [nameCell] = within(row).getAllByRole("cell");
      return nameCell?.textContent?.trim() ?? "";
    });
}

function getColumnAddButton(container: HTMLElement) {
  const indexAddButton = getIndexActionButtons(container).add;
  const addButtons = within(container).getAllByRole("button", { name: "Add" });
  const columnAddButton = addButtons.find(
    (button) => button !== indexAddButton,
  );
  if (!columnAddButton) {
    throw new Error("Column add button not found.");
  }
  return columnAddButton;
}

beforeEach(() => {
  useDiagramStore.setState(initialDiagramState);
  useViewModeStore.setState(initialViewModeState);
});

describe("when editing is allowed", () => {
  it("renders the default new index state with available columns", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog({
      columns: [seedColumnGroups(), createTableData().columns![1]],
    });

    const { indexSelect, tabPanel } = await openIndexTab(user);
    const {
      add,
      update,
      delete: deleteButton,
    } = getIndexActionButtons(tabPanel);

    expect(indexSelect).toHaveValue("new");
    expect(add).toBeEnabled();
    expect(update).toBeDisabled();
    expect(deleteButton).toBeDisabled();
    expect(screen.getByLabelText("Table Name")).toHaveValue("MEMBERS");
    expect(screen.getByLabelText("Index Name")).toHaveValue("IX_MEMBERS_XXX");
    expect(screen.getByLabelText("Index Type")).toHaveValue("BTREE");
    expect(screen.getByLabelText("Mark index as unique")).not.toBeChecked();
    expect(screen.getByLabelText("Mark index as full text")).not.toBeChecked();

    const availableSection = getAvailableColumnsSection(tabPanel);
    expect(
      within(availableSection).getByText("PROFILE_ID"),
    ).toBeInTheDocument();
    expect(
      within(availableSection).getByText("PROFILE_TYPE"),
    ).toBeInTheDocument();
    expect(within(availableSection).getByText("EMAIL")).toBeInTheDocument();
    expect(
      within(availableSection).queryByText("PROFILE_GROUP"),
    ).not.toBeInTheDocument();
  });

  it("keeps column add disabled without selecting a column", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();

    const { tabPanel } = await openIndexTab(user);

    const availableSection = getAvailableColumnsSection(tabPanel);
    const columnAddButton = getColumnAddButton(tabPanel);

    expect(columnAddButton).toBeDisabled();
    expect(within(availableSection).getByText("ID")).toBeInTheDocument();
  });

  it("enables adding after selecting an available column", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();

    const { tabPanel } = await openIndexTab(user);

    const availableSection = getAvailableColumnsSection(tabPanel);
    const columnAddButton = getColumnAddButton(tabPanel);

    await user.click(getTableRowByColumnName(availableSection, "ID"));
    expect(columnAddButton).toBeEnabled();
  });

  it("adds the chosen column to the index list", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();

    const { tabPanel } = await openIndexTab(user);

    const availableSection = getAvailableColumnsSection(tabPanel);
    const indexSection = getIndexColumnsSection(tabPanel);
    const columnAddButton = getColumnAddButton(tabPanel);

    await user.click(getTableRowByColumnName(availableSection, "ID"));
    await user.click(columnAddButton);

    expect(within(indexSection).getByText("ID")).toBeInTheDocument();
    expect(within(availableSection).queryByText("ID")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Select an index to see its columns."),
    ).not.toBeInTheDocument();
  });

  it("updates index details and keeps them after reselecting", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog({
      indexes: [
        {
          name: "IX_MEMBERS_ID",
          indexType: "",
          nonUnique: true,
          columns: [
            {
              columnId: stringifyReference({
                tableName: "MEMBERS",
                columnName: "ID",
              }),
            },
          ],
        },
      ],
    });

    const { indexSelect, tabPanel } = await openIndexTab(user);
    await user.selectOptions(indexSelect, "0");

    const indexNameInput = within(tabPanel).getByLabelText("Index Name");
    const indexTypeSelect = within(tabPanel).getByLabelText("Index Type", {
      selector: "select",
    });
    const uniqueCheckbox = within(tabPanel).getByLabelText(
      "Mark index as unique",
    );
    const fullTextCheckbox = within(tabPanel).getByLabelText(
      "Mark index as full text",
    );
    const indexSection = getIndexColumnsSection(tabPanel);
    const descriptionInput = within(tabPanel).getByLabelText("Description", {
      selector: "textarea",
    });
    const indexRow = getTableRowByColumnName(indexSection, "ID");
    const sortDescendingCheckbox = within(indexRow).getByRole("checkbox", {
      name: "Sort descending",
    });

    await user.clear(indexNameInput);
    await user.type(indexNameInput, "IX_MEMBERS_EMAIL");
    await user.selectOptions(indexTypeSelect, "BTREE");
    await user.click(uniqueCheckbox);
    await user.click(fullTextCheckbox);
    await user.click(sortDescendingCheckbox);
    await user.type(descriptionInput, "Email index");
    await user.click(within(tabPanel).getByRole("button", { name: "Update" }));

    await user.selectOptions(indexSelect, "new");
    await user.selectOptions(indexSelect, "0");

    expect(indexNameInput).toHaveValue("IX_MEMBERS_EMAIL");
    expect(indexTypeSelect).toHaveValue("BTREE");
    expect(uniqueCheckbox).toBeChecked();
    expect(fullTextCheckbox).toBeChecked();
    expect(sortDescendingCheckbox).toBeChecked();
    expect(descriptionInput).toHaveValue("Email index");
  });

  it("removes a selected index column", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog({
      indexes: [
        {
          name: "IX_MEMBERS_ID",
          indexType: "BTREE",
          nonUnique: true,
          columns: [
            {
              columnId: stringifyReference({
                tableName: "MEMBERS",
                columnName: "ID",
              }),
            },
          ],
        },
      ],
    });

    const { indexSelect, tabPanel } = await openIndexTab(user);
    await user.selectOptions(indexSelect, "0");

    const availableSection = getAvailableColumnsSection(tabPanel);
    const indexSection = getIndexColumnsSection(tabPanel);

    await user.click(getTableRowByColumnName(indexSection, "ID"));
    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(within(availableSection).getByText("ID")).toBeInTheDocument();
    expect(
      screen.getByText("Select an index to see its columns."),
    ).toBeInTheDocument();
  });

  it("adds a new index to the selection list", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog();

    const { indexSelect, tabPanel } = await openIndexTab(user);
    const {
      add,
      update,
      delete: deleteButton,
    } = getIndexActionButtons(tabPanel);

    await user.click(add);

    expect(indexSelect).toHaveValue("0");
    expect(
      screen.getByRole("option", { name: "IX_MEMBERS_XXX" }),
    ).toBeInTheDocument();
    expect(add).toBeDisabled();
    expect(update).toBeEnabled();
    expect(deleteButton).toBeEnabled();
  });

  it("deletes the selected index", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog({
      indexes: [
        {
          name: "IX_MEMBERS_EMAIL",
          indexType: "BTREE",
          nonUnique: true,
          columns: [
            {
              columnId: stringifyReference({
                tableName: "MEMBERS",
                columnName: "EMAIL",
              }),
            },
          ],
        },
      ],
    });

    const { indexSelect, tabPanel } = await openIndexTab(user);
    const {
      add,
      update,
      delete: deleteButton,
    } = getIndexActionButtons(tabPanel);

    await user.selectOptions(indexSelect, "0");
    await user.click(deleteButton);

    expect(indexSelect).toHaveValue("new");
    expect(add).toBeEnabled();
    expect(update).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it("shows the selected index values and disables Add", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog({
      indexes: [
        {
          name: "IX_MEMBERS_ID",
          indexType: "BTREE",
          nonUnique: false,
          columns: [
            {
              columnId: stringifyReference({
                tableName: "MEMBERS",
                columnName: "ID",
              }),
            },
          ],
        },
      ],
    });

    const { indexSelect, tabPanel } = await openIndexTab(user);
    const {
      add,
      update,
      delete: deleteButton,
    } = getIndexActionButtons(tabPanel);

    await user.selectOptions(indexSelect, "0");

    expect(screen.getByLabelText("Index Name")).toHaveValue("IX_MEMBERS_ID");
    expect(screen.getByLabelText("Index Type")).toHaveValue("BTREE");
    expect(screen.getByLabelText("Mark index as unique")).toBeChecked();
    expect(add).toBeDisabled();
    expect(update).toBeEnabled();
    expect(deleteButton).toBeEnabled();

    const availableSection = getAvailableColumnsSection(tabPanel);
    const indexSection = getIndexColumnsSection(tabPanel);

    expect(within(availableSection).queryByText("ID")).not.toBeInTheDocument();
    expect(within(availableSection).getByText("EMAIL")).toBeInTheDocument();
    expect(within(indexSection).getByText("ID")).toBeInTheDocument();
  });

  it("moves the selected index column down", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog({
      indexes: [
        {
          name: "IX_MEMBERS_ID_EMAIL",
          indexType: "BTREE",
          nonUnique: true,
          columns: [
            {
              columnId: stringifyReference({
                tableName: "MEMBERS",
                columnName: "ID",
              }),
            },
            {
              columnId: stringifyReference({
                tableName: "MEMBERS",
                columnName: "EMAIL",
              }),
            },
          ],
        },
      ],
    });

    const { indexSelect, tabPanel } = await openIndexTab(user);
    await user.selectOptions(indexSelect, "0");

    const indexSection = getIndexColumnsSection(tabPanel);

    await user.click(getTableRowByColumnName(indexSection, "ID"));
    await user.click(within(tabPanel).getByRole("button", { name: "Down" }));

    expect(getIndexColumnNames(indexSection)).toEqual(["EMAIL", "ID"]);
  });

  it("moves the selected index column up", async () => {
    const user = userEvent.setup();
    renderEditableTableInfoDialog({
      indexes: [
        {
          name: "IX_MEMBERS_ID_EMAIL",
          indexType: "BTREE",
          nonUnique: true,
          columns: [
            {
              columnId: stringifyReference({
                tableName: "MEMBERS",
                columnName: "ID",
              }),
            },
            {
              columnId: stringifyReference({
                tableName: "MEMBERS",
                columnName: "EMAIL",
              }),
            },
          ],
        },
      ],
    });

    const { indexSelect, tabPanel } = await openIndexTab(user);
    await user.selectOptions(indexSelect, "0");

    const indexSection = getIndexColumnsSection(tabPanel);

    await user.click(getTableRowByColumnName(indexSection, "EMAIL"));
    await user.click(within(tabPanel).getByRole("button", { name: "Up" }));

    expect(getIndexColumnNames(indexSection)).toEqual(["EMAIL", "ID"]);
  });
});

describe("in read-only mode", () => {
  it("disables index editing actions and inputs", async () => {
    const user = userEvent.setup();
    renderReadOnlyTableInfoDialog();

    const { indexSelect, tabPanel } = await openIndexTab(user);

    expect(indexSelect).toHaveValue("select");
    expect(indexSelect).not.toBeDisabled();
    expect(screen.getByLabelText("Index Name")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Index Type")).toBeDisabled();
    expect(
      within(tabPanel).getByLabelText("Description", {
        selector: "textarea",
      }),
    ).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Mark index as unique")).toBeDisabled();
    expect(screen.getByLabelText("Mark index as full text")).toBeDisabled();

    within(tabPanel)
      .getAllByRole("button", { name: "Add" })
      .forEach((button) => {
        expect(button).toBeDisabled();
      });
    expect(
      within(tabPanel).getByRole("button", { name: "Update" }),
    ).toBeDisabled();
    expect(
      within(tabPanel).getByRole("button", { name: "Delete" }),
    ).toBeDisabled();
    expect(
      within(tabPanel).getByRole("button", { name: "Remove" }),
    ).toBeDisabled();
    expect(within(tabPanel).getByRole("button", { name: "Up" })).toBeDisabled();
    expect(
      within(tabPanel).getByRole("button", { name: "Down" }),
    ).toBeDisabled();
  });
});
