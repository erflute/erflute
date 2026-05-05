import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProblemsPanel } from ".";

it("renders the problems heading and count", () => {
  render(<ProblemsPanel />);

  expect(screen.getByRole("region", { name: "Problems" })).toBeInTheDocument();
  expect(screen.getByText("PROBLEMS")).toBeInTheDocument();
  expect(screen.getByText("4")).toBeInTheDocument();
});

it("renders problem titles with source codes and locations", () => {
  render(<ProblemsPanel />);

  expect(
    screen.getByRole("button", { name: /Table name is required/i }),
  ).toBeInTheDocument();
  expect(screen.getAllByLabelText("Error")).toHaveLength(2);
  expect(screen.getByLabelText("Warning")).toBeInTheDocument();
  expect(screen.getByLabelText("Information")).toBeInTheDocument();
  expect(screen.getByText("ER validation(TABLE_NAME_REQUIRED)")).toBeInTheDocument();
  expect(screen.getByText("[Ln 15, Col 8]")).toBeInTheDocument();
});

it("does not show problem details before a problem is opened", () => {
  render(<ProblemsPanel />);

  expect(
    screen.queryByText(/The table definition does not have a physical name/i),
  ).not.toBeInTheDocument();
});

it("opens problem details when a problem is clicked", async () => {
  const user = userEvent.setup();
  render(<ProblemsPanel />);

  await user.click(screen.getByRole("button", { name: /Table name is required/i }));

  expect(
    screen.getByText(/The table definition does not have a physical name/i),
  ).toBeInTheDocument();
});

it("closes problem details when an open problem is clicked again", async () => {
  const user = userEvent.setup();
  render(<ProblemsPanel />);

  const problem = screen.getByRole("button", { name: /Table name is required/i });
  await user.click(problem);
  await user.click(problem);

  expect(
    screen.queryByText(/The table definition does not have a physical name/i),
  ).not.toBeInTheDocument();
});
