import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useViewModeStore } from "@/stores/viewModeStore";
import {
  Cardinality,
  ReferenceOperation,
  type Relationship,
} from "@/types/domain/relationship";
import { RelationInfoDialog } from ".";

const initialViewModeState = useViewModeStore.getState();

function createRelationship(overrides?: Partial<Relationship>): Relationship {
  return {
    name: "fk_orders_customers",
    source: "table.ORDERS.ID",
    target: "table.CUSTOMERS.ID",
    fkColumnNames: ["CUSTOMER_ID"],
    parentCardinality: Cardinality.One,
    childCardinality: Cardinality.ZeroN,
    referredColumn: "ID",
    referredColumnOptions: ["ID", "UUID"],
    onDeleteAction: ReferenceOperation.Cascade,
    onUpdateAction: ReferenceOperation.Cascade,
    ...overrides,
  };
}

function renderRelationInfoDialog(overrides?: Partial<Relationship>) {
  const onApply = jest.fn();
  const onCancel = jest.fn();
  const onOpenChange = jest.fn();
  render(
    <RelationInfoDialog
      open
      data={createRelationship(overrides)}
      onApply={onApply}
      onCancel={onCancel}
      onOpenChange={onOpenChange}
    />,
  );
  return { onApply, onCancel, onOpenChange };
}

function setEditable() {
  useViewModeStore.setState({ ...initialViewModeState, isReadOnly: false });
}

function setReadOnly() {
  useViewModeStore.setState({ ...initialViewModeState, isReadOnly: true });
}

function getReferenceOperationSelects() {
  const heading = screen.getByText("Reference operation");
  const section = heading.parentElement;
  if (!section) {
    throw new Error("Reference operation section not found.");
  }
  const [onUpdateSelect, onDeleteSelect] =
    within(section).getAllByRole("combobox");
  if (!onUpdateSelect || !onDeleteSelect) {
    throw new Error("Reference operation selects not found.");
  }
  return { onUpdateSelect, onDeleteSelect };
}

function getSectionByHeading(text: string) {
  const heading = screen.getByText(text);
  const section = heading.parentElement;
  if (!section) {
    throw new Error(`${text} section not found.`);
  }
  return section;
}

function setupUserWithFakeTimers() {
  jest.useFakeTimers();
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
}

beforeEach(() => {
  useViewModeStore.setState(initialViewModeState);
});

afterEach(() => {
  jest.useRealTimers();
});

it("renders relationship values in the dialog", () => {
  setEditable();
  renderRelationInfoDialog();

  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByText("Relation Information")).toBeInTheDocument();
  expect(screen.getByLabelText("Constraint Name")).toHaveValue(
    "fk_orders_customers",
  );
  expect(screen.getByLabelText("Reference Table")).toHaveValue("ORDERS");
  expect(
    screen.getByLabelText("Referred Column", { selector: "select" }),
  ).toHaveValue("ID");
  const parentSection = getSectionByHeading("Parent");
  expect(
    within(parentSection).getByLabelText("Multiplicity", {
      selector: "select",
    }),
  ).toHaveValue(Cardinality.One);
  const childSection = getSectionByHeading("Child");
  expect(
    within(childSection).getByLabelText("Multiplicity", {
      selector: "select",
    }),
  ).toHaveValue(Cardinality.ZeroN);
});

it("shows NO ACTION when reference actions are undefined", () => {
  setEditable();
  renderRelationInfoDialog({
    onDeleteAction: undefined,
    onUpdateAction: undefined,
  });

  const { onUpdateSelect, onDeleteSelect } = getReferenceOperationSelects();

  expect(onUpdateSelect).toHaveValue("NO ACTION");
  expect(onDeleteSelect).toHaveValue("NO ACTION");
});

it("maps NO ACTION selections to undefined on apply", async () => {
  setEditable();
  const { onApply } = renderRelationInfoDialog({
    onDeleteAction: ReferenceOperation.Restrict,
    onUpdateAction: ReferenceOperation.Restrict,
  });
  const user = setupUserWithFakeTimers();
  const { onUpdateSelect, onDeleteSelect } = getReferenceOperationSelects();

  await user.selectOptions(onUpdateSelect, "NO ACTION");
  await user.selectOptions(onDeleteSelect, "NO ACTION");
  await user.click(screen.getByRole("button", { name: "OK" }));

  act(() => {
    jest.runAllTimers();
  });

  expect(onApply).toHaveBeenCalledWith(
    expect.objectContaining({
      onUpdateAction: undefined,
      onDeleteAction: undefined,
    }),
  );
});

it("applies reference operation selections", async () => {
  setEditable();
  const { onApply } = renderRelationInfoDialog({
    onDeleteAction: ReferenceOperation.Restrict,
    onUpdateAction: ReferenceOperation.Restrict,
  });
  const user = setupUserWithFakeTimers();
  const { onUpdateSelect, onDeleteSelect } = getReferenceOperationSelects();

  await user.selectOptions(onUpdateSelect, ReferenceOperation.Cascade);
  await user.selectOptions(onDeleteSelect, ReferenceOperation.SetNull);
  await user.click(screen.getByRole("button", { name: "OK" }));

  act(() => {
    jest.runAllTimers();
  });

  expect(onApply).toHaveBeenCalledWith(
    expect.objectContaining({
      onUpdateAction: ReferenceOperation.Cascade,
      onDeleteAction: ReferenceOperation.SetNull,
    }),
  );
});

it("applies constraint name updates when confirmed", async () => {
  setEditable();
  const { onApply } = renderRelationInfoDialog();
  const user = setupUserWithFakeTimers();

  await user.clear(screen.getByLabelText("Constraint Name"));
  await user.type(screen.getByLabelText("Constraint Name"), "fk_items_orders");
  await user.click(screen.getByRole("button", { name: "OK" }));

  act(() => {
    jest.runAllTimers();
  });

  expect(onApply).toHaveBeenCalledWith(
    expect.objectContaining({ name: "fk_items_orders" }),
  );
});

it("applies referred column and multiplicity selections", async () => {
  setEditable();
  const { onApply } = renderRelationInfoDialog();
  const user = setupUserWithFakeTimers();
  const parentSection = getSectionByHeading("Parent");
  const childSection = getSectionByHeading("Child");

  await user.selectOptions(
    within(parentSection).getByLabelText("Referred Column", {
      selector: "select",
    }),
    "UUID",
  );
  await user.selectOptions(
    within(parentSection).getByLabelText("Multiplicity", {
      selector: "select",
    }),
    Cardinality.ZeroOne,
  );
  await user.selectOptions(
    within(childSection).getByLabelText("Multiplicity", {
      selector: "select",
    }),
    Cardinality.OneN,
  );
  await user.click(screen.getByRole("button", { name: "OK" }));

  act(() => {
    jest.runAllTimers();
  });

  expect(onApply).toHaveBeenCalledWith(
    expect.objectContaining({
      referredColumn: "UUID",
      parentCardinality: Cardinality.ZeroOne,
      childCardinality: Cardinality.OneN,
    }),
  );
});

it("closes without applying changes when canceled", async () => {
  setEditable();
  const { onApply, onCancel, onOpenChange } = renderRelationInfoDialog();
  const user = setupUserWithFakeTimers();

  await user.click(screen.getByRole("button", { name: "Cancel" }));

  act(() => {
    jest.runAllTimers();
  });

  expect(onApply).not.toHaveBeenCalled();
  expect(onCancel).toHaveBeenCalled();
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

it("disables editable controls in read-only mode", () => {
  setReadOnly();
  renderRelationInfoDialog();

  expect(screen.getByLabelText("Constraint Name")).toHaveAttribute("readonly");
  for (const select of screen.getAllByRole("combobox")) {
    expect(select).toBeDisabled();
  }
});
