import "@xyflow/react/dist/style.css";
import { ReactFlowProvider } from "@xyflow/react";
import { useDiagramStore } from "@/stores/diagramStore";
import { Internal } from "./internal";

export const Canvas = () => {
  const diagramVersion = useDiagramStore((state) => state.tablesVersion);

  return (
    // Remount React Flow on full diagram reloads so internal measurements from
    // the previous file do not trigger ResizeObserver loops during replacement.
    <ReactFlowProvider key={diagramVersion}>
      <Internal />
    </ReactFlowProvider>
  );
};
