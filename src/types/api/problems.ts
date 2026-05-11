export type ProblemSeverityResponse = "error" | "warning" | "info";

export type ProblemTargetResponse = {
  label: string;
  value: string;
};

export type ProblemResponse = {
  id: string;
  severity: ProblemSeverityResponse;
  title: string;
  body: string;
  path?: string;
  targets?: ProblemTargetResponse[];
};
