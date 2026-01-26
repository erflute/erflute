import { useState } from "react";
import {
  BaseEdge,
  useReactFlow,
  useStore,
  type Edge,
  type EdgeProps,
  type Node,
  type XYPosition,
} from "@xyflow/react";
import { RelationInfoDialog } from "@/features/dbDiagram/components/relationInfoDialog";
import { useDiagramStore } from "@/stores/diagramStore";
import {
  Cardinality,
  type Bendpoint,
  type Relationship,
} from "@/types/domain/relationship";
import { getEdgeParams } from "./edgeParams";
import { getPaths } from "./path";
import { buildSymbols, cardinalityToSymbolPartKinds } from "./symbol";

function getNeabyPositions(
  sourceNode: Node,
  targetNode: Node,
  bendpoints?: Bendpoint[],
): {
  sourceNearbyPos: XYPosition;
  targetNearbyPos: XYPosition;
} {
  if (!bendpoints || bendpoints.length == 0) {
    return {
      sourceNearbyPos: targetNode.position,
      targetNearbyPos: sourceNode.position,
    };
  }
  return {
    sourceNearbyPos: { x: bendpoints[0].x, y: bendpoints[0].y },
    targetNearbyPos: {
      x: bendpoints[bendpoints.length - 1].x,
      y: bendpoints[bendpoints.length - 1].y,
    },
  };
}

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
  const { sourceNearbyPos, targetNearbyPos } = getNeabyPositions(
    sourceNode,
    targetNode,
    data?.bendpoints,
  );
  const sourcePos = getEdgeParams(sourceNode, sourceNearbyPos);
  const targetPos = getEdgeParams(targetNode, targetNearbyPos);

  const paths = getPaths(sourcePos, targetPos, data?.bendpoints);

  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const length = Math.hypot(dx, dy);

  const dirX = dx / length;
  const dirY = dy / length;

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
    dirX,
    dirY,
    cardinalityToSymbolPartKinds(parentCardinality),
    "source",
    length,
    strokeColor,
    strokeWidth,
  );

  const targetSymbols = buildSymbols(
    targetPos.x,
    targetPos.y,
    -dirX,
    -dirY,
    cardinalityToSymbolPartKinds(childCardinality),
    "target",
    length,
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
