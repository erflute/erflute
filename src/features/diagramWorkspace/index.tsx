import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { DbDiagram } from "@/features/dbDiagram";
import { EntryScreen } from "@/features/entryScreen";
import { ProblemsPanel } from "@/features/problemsPanel";
import { Toolbar } from "@/features/toolbar";
import { useErmFileStore } from "@/stores/ermFileStore";
import type { DiagramWorkspaceProps } from "./types";

const defaultProblemsPanelHeight = 224;
const minProblemsPanelHeight = 120;
const maxProblemsPanelRatio = 0.6;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getMaxProblemsPanelHeight(workspaceHeight: number) {
  return Math.max(
    minProblemsPanelHeight,
    workspaceHeight * maxProblemsPanelRatio,
  );
}

export function DiagramWorkspace({
  diagram = <DbDiagram />,
}: DiagramWorkspaceProps) {
  const isLoaded = useErmFileStore((state) => state.isLoaded);
  const workspaceRef = useRef<HTMLElement | null>(null);
  const [problemsPanelHeight, setProblemsPanelHeight] = useState(
    defaultProblemsPanelHeight,
  );

  const handleResizeStart = (event: PointerEvent<HTMLDivElement>) => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      return;
    }

    event.preventDefault();

    const workspaceRect = workspace.getBoundingClientRect();
    const maxProblemsPanelHeight = getMaxProblemsPanelHeight(
      workspaceRect.height,
    );
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    const resize = (clientY: number) => {
      setProblemsPanelHeight(
        clamp(
          workspaceRect.bottom - clientY,
          minProblemsPanelHeight,
          maxProblemsPanelHeight,
        ),
      );
    };

    const handlePointerMove = (pointerEvent: globalThis.PointerEvent) => {
      resize(pointerEvent.clientY);
    };

    const handlePointerUp = () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    resize(event.clientY);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const maxProblemsPanelHeight = workspaceRef.current
    ? getMaxProblemsPanelHeight(
        workspaceRef.current.getBoundingClientRect().height,
      )
    : defaultProblemsPanelHeight;

  return (
    <div className="flex h-screen w-screen bg-slate-100">
      {isLoaded && <Toolbar />}
      <main ref={workspaceRef} className="relative min-w-0 flex-1 overflow-hidden">
        <div className="h-full w-full">
          {isLoaded ? diagram : <EntryScreen />}
        </div>
        <div
          role="separator"
          aria-label="Resize problems panel"
          aria-orientation="horizontal"
          aria-valuemin={minProblemsPanelHeight}
          aria-valuemax={Math.round(maxProblemsPanelHeight)}
          aria-valuenow={Math.round(problemsPanelHeight)}
          tabIndex={0}
          className="group absolute inset-x-0 z-20 h-2 cursor-row-resize bg-slate-100/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400"
          style={{ bottom: problemsPanelHeight }}
          onPointerDown={handleResizeStart}
        >
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-300 transition group-hover:h-0.5 group-hover:bg-blue-500" />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10">
          <ProblemsPanel height={problemsPanelHeight} />
        </div>
      </main>
    </div>
  );
}
