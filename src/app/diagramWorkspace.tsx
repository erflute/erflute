import type { ReactNode } from "react";
import { DbDiagram } from "@/features/dbDiagram";
import { EntryScreen } from "@/features/entryScreen";
import { ProblemsPanel } from "@/features/problemsPanel";
import { Toolbar } from "@/features/toolbar";
import { useErmFileStore } from "@/stores/ermFileStore";

type DiagramWorkspaceProps = {
  diagram?: ReactNode;
};

export function DiagramWorkspace({
  diagram = <DbDiagram />,
}: DiagramWorkspaceProps) {
  const isLoaded = useErmFileStore((state) => state.isLoaded);

  return (
    <div className="flex h-screen w-screen bg-slate-100">
      {isLoaded && <Toolbar />}
      <main className="relative min-w-0 flex-1 overflow-hidden">
        <div className="h-full w-full">
          {isLoaded ? diagram : <EntryScreen />}
        </div>
        <ProblemsPanel />
      </main>
    </div>
  );
}
