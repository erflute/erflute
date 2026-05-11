import { useState } from "react";
import type { PointerEvent } from "react";
import {
  ChevronDown,
  ChevronRight,
  CircleX,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProblemsStore } from "@/stores/problemsStore";
import { useViewModeStore } from "@/stores/viewModeStore";
import type { ProblemSeverity } from "./types";

const severityProfiles: Record<
  ProblemSeverity,
  {
    Icon: typeof CircleX;
    label: string;
    className: string;
  }
> = {
  error: {
    Icon: CircleX,
    label: "Error",
    className: "text-red-600",
  },
  warning: {
    Icon: TriangleAlert,
    label: "Warning",
    className: "text-amber-500",
  },
  info: {
    Icon: Info,
    label: "Information",
    className: "text-sky-600",
  },
};

const defaultProblemsPanelHeight = 224;
const minProblemsPanelHeight = 120;
const maxProblemsPanelHeight = 480;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getWorkspaceBottom() {
  return window.innerHeight;
}

export function ProblemsPanel() {
  const isProblemsPanelVisible = useViewModeStore(
    (state) => state.isProblemsPanelVisible,
  );

  if (!isProblemsPanelVisible) {
    return null;
  }

  return <ProblemsPanelContent />;
}

function ProblemsPanelContent() {
  const setProblemsPanelVisible = useViewModeStore(
    (state) => state.setProblemsPanelVisible,
  );
  const problems = useProblemsStore((state) => state.problems);
  const [height, setHeight] = useState(defaultProblemsPanelHeight);
  const [openProblemIds, setOpenProblemIds] = useState<Set<string>>(new Set());

  const handleResizeStart = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    const workspaceBottom = getWorkspaceBottom();
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    const resize = (clientY: number) => {
      if (!Number.isFinite(clientY)) {
        return;
      }

      setHeight(
        clamp(
          workspaceBottom - clientY,
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

  const toggleProblem = (problemId: string) => {
    setOpenProblemIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(problemId)) {
        nextIds.delete(problemId);
      } else {
        nextIds.add(problemId);
      }
      return nextIds;
    });
  };

  return (
    <>
      <div
        role="separator"
        aria-label="Resize problems panel"
        aria-orientation="horizontal"
        aria-valuemin={minProblemsPanelHeight}
        aria-valuemax={maxProblemsPanelHeight}
        aria-valuenow={Math.round(height)}
        tabIndex={0}
        className="group absolute inset-x-0 z-20 h-2 cursor-row-resize bg-slate-100/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400"
        style={{ bottom: height }}
        onPointerDown={handleResizeStart}
      >
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-300 transition group-hover:h-0.5 group-hover:bg-blue-500" />
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10">
        <section
          className="flex shrink-0 flex-col border-t border-slate-300 bg-white text-slate-900 shadow-[0_-1px_3px_rgba(15,23,42,0.06)]"
          aria-label="Problems"
          style={{ height }}
        >
          <header className="flex h-9 shrink-0 items-center justify-between border-b border-slate-300 bg-slate-200/80 px-4">
            <div className="flex h-full items-center border-b-2 border-blue-600 text-[11px] font-semibold tracking-wide text-slate-700">
              PROBLEMS
              <span className="ml-2 rounded-full bg-slate-300 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-slate-700">
                {problems.length}
              </span>
            </div>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-sm border-0 bg-transparent p-0 text-slate-500 shadow-none transition hover:bg-slate-300/70 hover:text-slate-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="Close problems panel"
              onClick={() => setProblemsPanelVisible(false)}
            >
              <X className="size-4" aria-hidden />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto py-1" role="list">
            {problems.length === 0 && (
              <div className="px-4 py-3 text-sm text-slate-500" role="status">
                No problems found.
              </div>
            )}
            {problems.map((problem) => {
              const severityProfile = severityProfiles[problem.severity];
              const isOpen = openProblemIds.has(problem.id);
              const ExpandIcon = isOpen ? ChevronDown : ChevronRight;
              const detailsId = `problem-${problem.id}-details`;

              return (
                <article key={problem.id} role="listitem">
                  <button
                    type="button"
                    className="flex w-full items-center gap-1.5 rounded-none border-0 bg-transparent px-3 py-1 text-left text-sm font-normal text-slate-800 shadow-none transition hover:bg-slate-100"
                    aria-expanded={isOpen}
                    aria-controls={detailsId}
                    onClick={() => toggleProblem(problem.id)}
                  >
                    <ExpandIcon
                      className="size-4 shrink-0 text-slate-500"
                      aria-hidden
                    />
                    <severityProfile.Icon
                      className={cn(
                        "size-4 shrink-0",
                        severityProfile.className,
                      )}
                      aria-label={severityProfile.label}
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {problem.title}
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      id={detailsId}
                      className="mx-3 mb-1 ml-12 whitespace-pre-line rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-5 text-slate-700"
                    >
                      {problem.body}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
