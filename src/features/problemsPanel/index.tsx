import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CircleX,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProblemItem, ProblemSeverity } from "./types";

const sampleProblems: ProblemItem[] = [
  {
    id: "missing-table-name",
    severity: "error",
    title: "Table name is required",
    body: "The table definition does not have a physical name. Add a physical table name before saving the diagram.",
  },
  {
    id: "duplicate-column",
    severity: "error",
    title: "Duplicate column name",
    body: "Two columns in this table use the same physical name. Rename one of the columns so generated SQL can be created without conflicts.",
  },
  {
    id: "missing-primary-key",
    severity: "warning",
    title: "Primary key is not defined",
    body: "This table does not define a primary key. The diagram can still be edited, but relations and exported DDL may be less reliable.",
  },
  {
    id: "empty-description",
    severity: "info",
    title: "Description is empty",
    body: "Consider adding a description so other users can understand the purpose of this table.",
  },
];

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

type ProblemsPanelProps = {
  height: number;
  onClose: () => void;
};

export function ProblemsPanel({ height, onClose }: ProblemsPanelProps) {
  const [openProblemIds, setOpenProblemIds] = useState<Set<string>>(new Set());

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
    <section
      className="flex shrink-0 flex-col border-t border-slate-300 bg-white text-slate-900 shadow-[0_-1px_3px_rgba(15,23,42,0.06)]"
      aria-label="Problems"
      style={{ height }}
    >
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-slate-300 bg-slate-200/80 px-4">
        <div className="flex h-full items-center border-b-2 border-blue-600 text-[11px] font-semibold tracking-wide text-slate-700">
          PROBLEMS
          <span className="ml-2 rounded-full bg-slate-300 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-slate-700">
            {sampleProblems.length}
          </span>
        </div>
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-sm border-0 bg-transparent p-0 text-slate-500 shadow-none transition hover:bg-slate-300/70 hover:text-slate-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="Close problems panel"
          onClick={onClose}
        >
          <X className="size-4" aria-hidden />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto py-1" role="list">
        {sampleProblems.map((problem) => {
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
                  className={cn("size-4 shrink-0", severityProfile.className)}
                  aria-label={severityProfile.label}
                />
                <span className="min-w-0 flex-1 truncate">{problem.title}</span>
              </button>
              {isOpen && (
                <div
                  id={detailsId}
                  className="mx-3 mb-1 ml-12 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-5 text-slate-700"
                >
                  {problem.body}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
