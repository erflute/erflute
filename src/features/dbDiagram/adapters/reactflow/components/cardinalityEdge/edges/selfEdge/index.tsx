import { Fragment, useState } from "react";
import {
  BaseEdge,
  useReactFlow,
  useStore,
  type Edge,
  type EdgeProps,
  type XYPosition,
} from "@xyflow/react";
import { RelationInfoDialog } from "@/features/dbDiagram/components/relationInfoDialog";
import { useDiagramStore } from "@/stores/diagramStore";
import { Cardinality, type Relationship } from "@/types/domain/relationship";
import { getPaths } from "../../path";
import {
  buildSymbols,
  cardinalityToSymbolPartKinds,
  getDirAndLength,
} from "../../symbol";
import { getNodeRect, getSelfEdgeRect } from "./rects";

export function SelfEdge({
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
  const [relationInfoDialogOpen, setRelationInfoDialogOpen] = useState(false);

  if (!data || !sourceNode) {
    return null;
  }
  if (source !== target) {
    return null;
  }
  if (
    !data.bendpoints ||
    data.bendpoints.length !== 1 ||
    !data.bendpoints[0].relative
  ) {
    return null;
  }

  const nodeRect = getNodeRect(sourceNode);
  if (!nodeRect) {
    return null;
  }

  const bendpoint = {
    x: data.bendpoints[0].x,
    y: data.bendpoints[0].y,
  } as XYPosition;
  const rect = getSelfEdgeRect(nodeRect, bendpoint);
  const points: XYPosition[] = [
    { x: rect.x + rect.w / 2, y: rect.y } as XYPosition,
    { x: rect.x + rect.w, y: rect.y } as XYPosition,
    { x: rect.x + rect.w, y: rect.y + rect.h } as XYPosition,
    { x: rect.x, y: rect.y + rect.h } as XYPosition,
    { x: rect.x, y: rect.y + rect.h / 2 } as XYPosition,
  ];
  const paths = getPaths(points);

  const { dir: sourceDir, length: sourceLength } = getDirAndLength(
    points[0],
    points[1],
  );
  const { dir: targetDir, length: targetLength } = getDirAndLength(
    points[4],
    points[3],
  );

  const strokeColor =
    (style && typeof style.stroke === "string" ? style.stroke : undefined) ??
    "var(--xy-edge-stroke, var(--xy-edge-stroke-default))";
  const strokeWidth =
    style && typeof style.strokeWidth === "number"
      ? style.strokeWidth
      : undefined;

  const parentCardinality = data.parentCardinality ?? Cardinality.One;
  const childCardinality = data.childCardinality ?? Cardinality.One;

  const sourceSymbols = buildSymbols(
    points[0].x,
    points[0].y,
    sourceDir.x,
    sourceDir.y,
    cardinalityToSymbolPartKinds(parentCardinality),
    "source",
    sourceLength,
    strokeColor,
    strokeWidth,
  );

  const targetSymbols = buildSymbols(
    points[4].x,
    points[4].y,
    targetDir.x,
    targetDir.y,
    cardinalityToSymbolPartKinds(childCardinality),
    "target",
    targetLength,
    strokeColor,
    strokeWidth,
  );

  const symbols = [...sourceSymbols, ...targetSymbols];

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
