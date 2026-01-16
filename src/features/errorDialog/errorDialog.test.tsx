import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useErrorDialogStore } from "@/stores/errorDialogStore";
import { ErrorDialog, showErrorDialog } from ".";

beforeEach(() => {
  useErrorDialogStore.setState({ isOpen: false, content: null });
});

it("does not render anything when no error has been shown", () => {
  render(<ErrorDialog />);

  expect(screen.queryByRole("dialog")).toBeNull();
});

it("renders the default title and context details for string errors", () => {
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  showErrorDialog("Network unreachable", {
    context: "Fetching diagram from disk",
  });

  render(<ErrorDialog />);

  expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  expect(
    screen.getByText(/Fetching diagram from disk[\s\S]*Network unreachable/),
  ).toBeInTheDocument();
  expect(screen.getByText("Details")).toBeInTheDocument();
  expect(
    screen.getByText("Fetching diagram from disk", { exact: false }),
  ).toBeInTheDocument();
  expect(consoleSpy).toHaveBeenCalled();
  consoleSpy.mockRestore();
});

it("uses provided overrides and shows JSON details for object errors", () => {
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  showErrorDialog(
    { code: 500, reason: "boom" },
    {
      title: "Load failed",
      message: "Could not load the diagram.",
    },
  );
  render(<ErrorDialog />);

  expect(screen.getByText("Load failed")).toBeInTheDocument();
  expect(screen.getByText("Could not load the diagram.")).toBeInTheDocument();
  expect(screen.getByText('"code": 500', { exact: false })).toBeInTheDocument();
  expect(
    screen.getByText('"reason": "boom"', { exact: false }),
  ).toBeInTheDocument();
  expect(consoleSpy).toHaveBeenCalled();
  consoleSpy.mockRestore();
});

it("closes and clears state when the Close button is clicked", async () => {
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  const user = userEvent.setup();
  showErrorDialog("Temporary glitch");
  render(<ErrorDialog />);

  await user.click(screen.getByRole("button", { name: "Close" }));

  expect(screen.queryByRole("dialog")).toBeNull();
  expect(useErrorDialogStore.getState().content).toBeNull();
  expect(consoleSpy).toHaveBeenCalled();
  consoleSpy.mockRestore();
});
