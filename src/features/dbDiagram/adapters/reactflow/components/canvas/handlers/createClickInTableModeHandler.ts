import type { ReactFlowInstance } from "@xyflow/react";
import type { Table } from "@/types/domain/table";

type AddNodes = ReactFlowInstance["addNodes"];
type ScreenToFlowPosition = ReactFlowInstance["screenToFlowPosition"];

export function createClickInTableModeHandler(
  addNodes: AddNodes,
  screenToFlowPosition: ScreenToFlowPosition,
) {
  return (clientX: number, clientY: number) => {
    const defaultTableName = "NEW_TABLE";
    const { x, y } = screenToFlowPosition({
      x: clientX,
      y: clientY,
    });
    const width = 120;
    const height = 75;
    addNodes({
      id: `table.${crypto.randomUUID()}`,
      type: "table",
      position: {
        x,
        y,
      },
      width,
      height,
      data: {
        color: {
          r: 128,
          g: 128,
          b: 192,
        },
        x,
        y,
        width,
        height,
        physicalName: defaultTableName,
        logicalName: defaultTableName,
        description: "",
      } satisfies Table,
    });
  };
}
