import { Fragment } from "react/jsx-runtime";
import {
  BaseEdge,
  useStore,
  type Edge,
  type EdgeProps,
  type Node,
} from "@xyflow/react";
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
  source,
  target,
  data,
  markerEnd,
  style,
  onOpenRelationInfoDialog,
}: EdgeProps<Edge<Relationship>> & {
  onOpenRelationInfoDialog: () => void;
}) {
  const sourceNode = useStore((s) => s.nodeLookup.get(source));
  const targetNode = useStore((s) => s.nodeLookup.get(target));
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
            stroke="transparent"
            strokeWidth={24}
            pointerEvents="stroke"
            onDoubleClick={(e) => {
              e.stopPropagation();
              onOpenRelationInfoDialog();
            }}
            className="cursor-pointer"
          />
        </Fragment>
      ))}
      {symbols}
    </>
  );
}
