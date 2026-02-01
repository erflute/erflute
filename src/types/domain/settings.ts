export const ViewMode = {
  Logical: 0,
  Physical: 1,
  LogicalPhysical: 2,
};

export type ViewMode = (typeof ViewMode)[keyof typeof ViewMode];

export type Settings = {
  database: string;
  viewMode: ViewMode;
};
