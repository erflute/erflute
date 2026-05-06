export type ProblemSeverity = "error" | "warning" | "info";

export type ProblemItem = {
  id: string;
  severity: ProblemSeverity;
  title: string;
  body: string;
};
