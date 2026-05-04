export type ProblemSeverity = "error" | "warning" | "info";

export type ProblemLocation = {
  line: number;
  column: number;
};

export type ProblemItem = {
  id: string;
  severity: ProblemSeverity;
  title: string;
  body: string;
  source: string;
  code: string;
  location?: ProblemLocation;
};
