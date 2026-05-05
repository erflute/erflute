import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useErmFileStore } from "@/stores/ermFileStore";
import { DiagramWorkspace } from ".";

const initialErmFileState = useErmFileStore.getState();

beforeEach(() => {
  useErmFileStore.setState({ ...initialErmFileState, isLoaded: true });
});

function dispatchPointerEvent(target: EventTarget, type: string, clientY: number) {
  target.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      clientY,
    }),
  );
}

function mockWorkspaceRect(separator: HTMLElement, height: number) {
  const workspace = separator.parentElement;
  if (!workspace) {
    throw new Error("Workspace was not rendered.");
  }
  jest.spyOn(workspace, "getBoundingClientRect").mockReturnValue({
    bottom: height,
    height,
    left: 0,
    right: 1000,
    top: 0,
    width: 1000,
    x: 0,
    y: 0,
    toJSON: () => undefined,
  });
}

it("renders the entry screen with the problems panel when no diagram is loaded", () => {
  useErmFileStore.setState({ isLoaded: false });

  render(<DiagramWorkspace diagram={<div>Diagram area</div>} />);

  expect(screen.getByText("Open or Create your diagram")).toBeInTheDocument();
  expect(screen.queryByText("Diagram area")).not.toBeInTheDocument();
  expect(
    screen.getByRole("separator", { name: "Resize problems panel" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Problems" })).toHaveStyle({
    height: "224px",
  });
  expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
});

it("renders a resize separator over the diagram and problems panel", () => {
  render(<DiagramWorkspace diagram={<div>Diagram area</div>} />);

  expect(screen.getByText("Diagram area")).toBeInTheDocument();
  const separator = screen.getByRole("separator", {
    name: "Resize problems panel",
  });
  expect(separator).toBeInTheDocument();
  expect(separator).toHaveStyle({ bottom: "224px" });
  expect(screen.getByRole("region", { name: "Problems" })).toHaveStyle({
    height: "224px",
  });
});

it("resizes the problems panel when the separator is dragged", () => {
  render(<DiagramWorkspace diagram={<div>Diagram area</div>} />);
  const separator = screen.getByRole("separator", {
    name: "Resize problems panel",
  });
  mockWorkspaceRect(separator, 800);

  act(() => {
    dispatchPointerEvent(separator, "pointerdown", 500);
    dispatchPointerEvent(window, "pointermove", 520);
    dispatchPointerEvent(window, "pointerup", 520);
  });

  expect(screen.getByRole("region", { name: "Problems" })).toHaveStyle({
    height: "280px",
  });
  expect(separator).toHaveStyle({ bottom: "280px" });
});

it("does not resize the problems panel below its minimum height", () => {
  render(<DiagramWorkspace diagram={<div>Diagram area</div>} />);
  const separator = screen.getByRole("separator", {
    name: "Resize problems panel",
  });
  mockWorkspaceRect(separator, 800);

  act(() => {
    dispatchPointerEvent(separator, "pointerdown", 760);
    dispatchPointerEvent(window, "pointermove", 790);
    dispatchPointerEvent(window, "pointerup", 790);
  });

  expect(screen.getByRole("region", { name: "Problems" })).toHaveStyle({
    height: "120px",
  });
});

it("does not resize the problems panel above its maximum height", () => {
  render(<DiagramWorkspace diagram={<div>Diagram area</div>} />);
  const separator = screen.getByRole("separator", {
    name: "Resize problems panel",
  });
  mockWorkspaceRect(separator, 800);

  act(() => {
    dispatchPointerEvent(separator, "pointerdown", 100);
    dispatchPointerEvent(window, "pointermove", 80);
    dispatchPointerEvent(window, "pointerup", 80);
  });

  expect(screen.getByRole("region", { name: "Problems" })).toHaveStyle({
    height: "480px",
  });
});

it("hides the problems panel and resize separator when the close button is clicked", async () => {
  const user = userEvent.setup();
  render(<DiagramWorkspace diagram={<div>Diagram area</div>} />);

  await user.click(screen.getByRole("button", { name: "Close problems panel" }));

  expect(screen.queryByRole("region", { name: "Problems" })).not.toBeInTheDocument();
  expect(
    screen.queryByRole("separator", { name: "Resize problems panel" }),
  ).not.toBeInTheDocument();
  expect(screen.getByText("Diagram area")).toBeInTheDocument();
});
