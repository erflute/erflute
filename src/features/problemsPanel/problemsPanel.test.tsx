import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useViewModeStore } from "@/stores/viewModeStore";
import { ProblemsPanel } from ".";

const initialViewModeState = useViewModeStore.getState();

afterEach(() => {
  jest.restoreAllMocks();
  useViewModeStore.setState(initialViewModeState);
});

function renderProblemsPanel() {
  render(<ProblemsPanel />);
}

it("renders the problems heading and count", () => {
  renderProblemsPanel();

  expect(screen.getByRole("region", { name: "Problems" })).toBeInTheDocument();
  expect(screen.getByText("PROBLEMS")).toBeInTheDocument();
  expect(screen.getByText("4")).toBeInTheDocument();
});

it("renders problem titles with their severity", () => {
  renderProblemsPanel();

  expect(
    screen.getByRole("button", { name: /Table name is required/i }),
  ).toBeInTheDocument();
  expect(screen.getAllByLabelText("Error")).toHaveLength(2);
  expect(screen.getByLabelText("Warning")).toBeInTheDocument();
  expect(screen.getByLabelText("Information")).toBeInTheDocument();
});

it("does not show problem details before a problem is opened", () => {
  renderProblemsPanel();

  expect(
    screen.queryByText(/The table definition does not have a physical name/i),
  ).not.toBeInTheDocument();
});

it("opens problem details when a problem is clicked", async () => {
  const user = userEvent.setup();
  renderProblemsPanel();

  await user.click(
    screen.getByRole("button", { name: /Table name is required/i }),
  );

  expect(
    screen.getByText(/The table definition does not have a physical name/i),
  ).toBeInTheDocument();
});

it("closes problem details when an open problem is clicked again", async () => {
  const user = userEvent.setup();
  renderProblemsPanel();

  const problem = screen.getByRole("button", {
    name: /Table name is required/i,
  });
  await user.click(problem);
  await user.click(problem);

  expect(
    screen.queryByText(/The table definition does not have a physical name/i),
  ).not.toBeInTheDocument();
});

it("hides the problems panel and resize separator when the close button is clicked", async () => {
  const user = userEvent.setup();
  renderProblemsPanel();

  await user.click(
    screen.getByRole("button", { name: "Close problems panel" }),
  );

  expect(
    screen.queryByRole("region", { name: "Problems" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("separator", { name: "Resize problems panel" }),
  ).not.toBeInTheDocument();
});

it("does not render the problems panel when it is hidden in the view mode store", () => {
  useViewModeStore.setState({ isProblemsPanelVisible: false });

  renderProblemsPanel();

  expect(screen.queryByRole("region", { name: "Problems" })).not.toBeInTheDocument();
  expect(
    screen.queryByRole("separator", { name: "Resize problems panel" }),
  ).not.toBeInTheDocument();
});
