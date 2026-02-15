import "@xyflow/react/dist/style.css";
import { ReactFlowProvider } from "@xyflow/react";
import { MainDiagram } from "./mainDiagram";
import { VirtualDiagram } from "./virtualDiagram";
import { type CanvasProps } from "./types";

export const Canvas = ({ vdiagramName }: CanvasProps) => {
  return (
    <ReactFlowProvider>
      {vdiagramName ? (
        <VirtualDiagram vdiagramName={vdiagramName} />
      ) : (
        <MainDiagram />
      )}
    </ReactFlowProvider>
  );
};
