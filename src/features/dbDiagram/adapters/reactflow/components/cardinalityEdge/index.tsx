import { useState } from "react";
import { Fragment } from "react/jsx-runtime";
import {
  BaseEdge,
  useReactFlow,
  useStore,
  type Edge,
  type EdgeProps,
  type Node,
} from "@xyflow/react";
import { RelationInfoDialog } from "@/features/dbDiagram/components/relationInfoDialog";
import { useDiagramStore } from "@/stores/diagramStore";
import { type Relationship } from "@/types/domain/relationship";
import { getOneToManyPathsAndSymbols } from "./pathsAndSymbols/oneToManyEdge";
import { getSelfPathsAndSymbols } from "./pathsAndSymbols/selfEdge";

function getPathsAndSymbols(
  sourceNode: Node,
  targetNode: Node,
  data: Relationship,
) {
  if (sourceNode.id === targetNode.id) {
    return getSelfPathsAndSymbols(sourceNode, data);
  }
  return getOneToManyPathsAndSymbols(sourceNode, targetNode, data);
}

export function CardinalityEdge({
  id,
  source,
  target,
  data,
  markerEnd,
  style,
}: EdgeProps<Edge<Relationship>>) {
  const sourceNode = useStore((s) => s.nodeLookup.get(source));
  const targetNode = useStore((s) => s.nodeLookup.get(target));

  const { setEdges } = useReactFlow();
  const updateRelationship = useDiagramStore(
    (state) => state.updateRelationship,
  );
  const [relationInfoDialogOpen, setRelationInfoDialogOpen] = useState(false);
  if (!sourceNode || !targetNode || !data) {
    return null;
  }

  const pathsAndSymbols = getPathsAndSymbols(sourceNode, targetNode, data);
  if (!pathsAndSymbols) {
    return null;
  }

  const { paths, symbols } = pathsAndSymbols;
  return (
    <>
      {paths.map((p, i) => (
        <Fragment key={`${i}-${p}`}>
          <BaseEdge
            path={p}
            style={style}
            markerEnd={i == paths.length - 1 ? markerEnd : undefined}
          />
          <path
            d={p}
            fill="none"
            strokeOpacity={0}
            strokeWidth={24}
            pointerEvents="stroke"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setRelationInfoDialogOpen(true);
            }}
            className="cursor-pointer"
          />
        </Fragment>
      ))}
      {symbols}
      <RelationInfoDialog
        data={data}
        open={relationInfoDialogOpen}
        onOpenChange={setRelationInfoDialogOpen}
        onApply={(updatedRelationship) => {
          updateRelationship(updatedRelationship, id);
          setEdges((edges) =>
            edges.map((edge) =>
              edge.id === id
                ? {
                    ...edge,
                    id: updatedRelationship.name,
                    data: updatedRelationship,
                  }
                : edge,
            ),
          );
        }}
      />
    </>
  );
}
