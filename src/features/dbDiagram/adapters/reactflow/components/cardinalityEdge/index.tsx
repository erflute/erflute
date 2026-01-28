import { useState } from "react";
import {
  BaseEdge,
  useReactFlow,
  useStore,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";
import { RelationInfoDialog } from "@/features/dbDiagram/components/relationInfoDialog";
import { useDiagramStore } from "@/stores/diagramStore";
import { Cardinality, type Relationship } from "@/types/domain/relationship";
import { getPaths } from "./path";
import { getEdgePos, getNeabyPositions } from "./positions";
import {
  buildSymbols,
  cardinalityToSymbolPartKinds,
  getDirAndLength,
} from "./symbol";

export function CardinalityEdge({
  id,
  source,
  target,
  data,
  markerEnd,
  style,
}: EdgeProps<Edge<Relationship>>) {
  const { setEdges } = useReactFlow();
  const updateRelationship = useDiagramStore(
    (state) => state.updateRelationship,
  );
  const sourceNode = useStore((s) => s.nodeLookup.get(source));
  const targetNode = useStore((s) => s.nodeLookup.get(target));
  const [relationInfoDialogOpen, setRelationInfoDialogOpen] = useState(false);
  if (!sourceNode || !targetNode) {
    return null;
  }
  if (
    !!data?.bendpoints &&
    data.bendpoints.length > 0 &&
    data.bendpoints.some((bp) => bp.relative)
  ) {
    // When bendpoints are for self relationship, render no edge temporally.
    // This should be handled by https://github.com/erflute/erflute/issues/53
    return null;
  }
  const { sourceNearbyPos, targetNearbyPos } = getNeabyPositions(
    sourceNode,
    targetNode,
    data?.bendpoints,
  );
  const sourcePos = getEdgePos(sourceNode, sourceNearbyPos);
  const targetPos = getEdgePos(targetNode, targetNearbyPos);

  const paths = getPaths(sourcePos, targetPos, data?.bendpoints);

  const noBendpoints = !data?.bendpoints || data?.bendpoints.length == 0;
  const { dir: sourceDir, length: sourceLength } = getDirAndLength(
    sourcePos,
    noBendpoints ? targetPos : sourceNearbyPos,
  );
  const { dir: targetDir, length: targetLength } = getDirAndLength(
    targetPos,
    noBendpoints ? sourcePos : targetNearbyPos,
  );

  const strokeColor =
    (style && typeof style.stroke === "string" ? style.stroke : undefined) ??
    "var(--xy-edge-stroke, var(--xy-edge-stroke-default))";
  const strokeWidth =
    style && typeof style.strokeWidth === "number"
      ? style.strokeWidth
      : undefined;

  const parentCardinality = data?.parentCardinality ?? Cardinality.One;
  const childCardinality = data?.childCardinality ?? Cardinality.One;

  const sourceSymbols = buildSymbols(
    sourcePos.x,
    sourcePos.y,
    sourceDir.x,
    sourceDir.y,
    cardinalityToSymbolPartKinds(parentCardinality),
    "source",
    sourceLength,
    strokeColor,
    strokeWidth,
  );

  const targetSymbols = buildSymbols(
    targetPos.x,
    targetPos.y,
    targetDir.x,
    targetDir.y,
    cardinalityToSymbolPartKinds(childCardinality),
    "target",
    targetLength,
    strokeColor,
    strokeWidth,
  );

  const symbols = [...sourceSymbols, ...targetSymbols];

  // BaseEdge is used for rendering the edge path, but relying on its onDoubleClick can be unreliable:
  // - event handlers may not be forwarded to the underlying SVG <path> depending on library implementation,
  // - the edge's visible stroke is thin and easy to miss,
  // - other SVG elements can overlap the edge and steal pointer events.
  // We therefore add a dedicated (invisible) interaction path to ensure double-click is captured.
  return (
    <>
      {paths.map((p) => (
        <>
          <BaseEdge path={p} style={style} markerEnd={markerEnd} />
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
        </>
      ))}
      {symbols}
      {data && (
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
      )}
    </>
  );
}
