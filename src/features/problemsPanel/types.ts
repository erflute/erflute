export type ProblemSeverity = "error" | "warning" | "info";

export type ProblemTarget = {
  label: string;
  value: string;
};

export type ProblemItem = {
  id: string;
  severity: ProblemSeverity;
  title: string;
  body: string;
  path?: string;
  targets?: ProblemTarget[];
};
