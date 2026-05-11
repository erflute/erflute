import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useProblemsStore } from "@/stores/problemsStore";
import { useViewModeStore } from "@/stores/viewModeStore";
import { ProblemsPanel } from ".";

const initialViewModeState = useViewModeStore.getState();
const initialProblemsState = useProblemsStore.getState();
const problems = [
  {
    id: "duplicate-column",
    severity: "error" as const,
    title: "duplicate column physical_name: MEMBER_ID",
    body: "Validation error\n\nduplicate column physical_name: MEMBER_ID",
  },
  {
    id: "invalid-decimal",
    severity: "error" as const,
    title: "decimal must be less than or equal to length: 19 > 18",
    body: "Validation error\n\ndecimal must be less than or equal to length: 19 > 18",
  },
];

afterEach(() => {
  jest.restoreAllMocks();
  useViewModeStore.setState(initialViewModeState);
  useProblemsStore.setState(initialProblemsState);
});

function renderProblemsPanel(isProblemsPanelVisible = true) {
  useViewModeStore.setState({ isProblemsPanelVisible });
  useProblemsStore.setState({ problems });
  render(<ProblemsPanel />);
}

it("renders the problems heading and count", () => {
  renderProblemsPanel();

  expect(screen.getByRole("region", { name: "Problems" })).toBeInTheDocument();
  expect(screen.getByText("PROBLEMS")).toBeInTheDocument();
  expect(screen.getByText("2")).toBeInTheDocument();
});

it("renders problem titles with their severity", () => {
  renderProblemsPanel();

  expect(
    screen.getByRole("button", {
      name: /duplicate column physical_name: MEMBER_ID/i,
    }),
  ).toBeInTheDocument();
  expect(screen.getAllByLabelText("Error")).toHaveLength(2);
});

it("does not show problem details before a problem is opened", () => {
  renderProblemsPanel();

  expect(
    screen.queryByText(/Validation error/i),
  ).not.toBeInTheDocument();
});

it("opens problem details when a problem is clicked", async () => {
  const user = userEvent.setup();
  renderProblemsPanel();

  await user.click(
    screen.getByRole("button", {
      name: /duplicate column physical_name: MEMBER_ID/i,
    }),
  );

  expect(
    screen.getByText(/Validation error/i),
  ).toBeInTheDocument();
});

it("closes problem details when an open problem is clicked again", async () => {
  const user = userEvent.setup();
  renderProblemsPanel();

  const problem = screen.getByRole("button", {
    name: /duplicate column physical_name: MEMBER_ID/i,
  });
  await user.click(problem);
  await user.click(problem);

  expect(
    screen.queryByText(/Validation error/i),
  ).not.toBeInTheDocument();
});

it("renders an empty state when the diagram has no problems", () => {
  useViewModeStore.setState({ isProblemsPanelVisible: true });
  useProblemsStore.setState({ problems: [] });

  render(<ProblemsPanel />);

  expect(screen.getByText("0")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("No problems found.");
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
  renderProblemsPanel(false);

  expect(
    screen.queryByRole("region", { name: "Problems" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("separator", { name: "Resize problems panel" }),
  ).not.toBeInTheDocument();
});
