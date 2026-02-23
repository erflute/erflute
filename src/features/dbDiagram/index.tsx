/* istanbul ignore file */
import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Canvas } from "@/features/dbDiagram/adapters/reactflow/components/canvas";
import { useDiagramStore } from "@/stores/diagramStore";

const MAIN_DIAGRAM_TAB = "main-diagram";
const getVDiagramTabValue = (vdiagramName: string) => `vdiagram:${vdiagramName}`;

export function DbDiagram() {
  const vdiagrams = useDiagramStore((state) => state.vdiagrams);
  const diagramTabs = useMemo(() => {
    return vdiagrams.map((vdiagram) => {
      return {
        value: getVDiagramTabValue(vdiagram.vdiagramName),
        label: vdiagram.vdiagramName,
        vdiagramName: vdiagram.vdiagramName,
      };
    });
  }, [vdiagrams]);

  return (
    <Tabs className="h-full w-full gap-0" defaultValue={MAIN_DIAGRAM_TAB}>
      <TabsContent
        className="mt-0 min-h-0 flex-1 overflow-hidden border border-slate-300 border-b-0 bg-white"
        value={MAIN_DIAGRAM_TAB}
      >
        <Canvas />
      </TabsContent>
      {diagramTabs.map((diagramTab) => (
        <TabsContent
          key={diagramTab.value}
          className="mt-0 min-h-0 flex-1 overflow-hidden border border-slate-300 border-b-0 bg-white"
          value={diagramTab.value}
        >
          <Canvas vdiagramName={diagramTab.vdiagramName} />
        </TabsContent>
      ))}
      <div className="border border-slate-300 border-t-0 bg-slate-200">
        <TabsList className="h-7 w-full justify-start gap-0 rounded-none border-0 bg-transparent p-0">
          <TabsTrigger
            className="-ml-px h-full flex-none rounded-b-md rounded-t-none border border-slate-400 border-t-0 bg-gradient-to-b from-slate-100 to-slate-200 px-4 text-xs first:ml-0 data-[state=active]:border-slate-500 data-[state=active]:from-white data-[state=active]:to-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-none"
            value={MAIN_DIAGRAM_TAB}
          >
            Main Diagram
          </TabsTrigger>
          {diagramTabs.map((diagramTab) => (
            <TabsTrigger
              key={diagramTab.value}
              className="-ml-px h-full flex-none rounded-b-md rounded-t-none border border-slate-400 border-t-0 bg-gradient-to-b from-slate-100 to-slate-200 px-4 text-xs first:ml-0 data-[state=active]:border-slate-500 data-[state=active]:from-white data-[state=active]:to-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-none"
              value={diagramTab.value}
            >
              {diagramTab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}
