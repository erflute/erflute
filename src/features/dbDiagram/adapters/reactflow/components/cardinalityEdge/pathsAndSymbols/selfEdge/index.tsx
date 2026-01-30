import { type ReactElement } from "react";
import { type Node, type XYPosition } from "@xyflow/react";
import { Cardinality, type Relationship } from "@/types/domain/relationship";
import { getPaths } from "../path";
import {
  buildSymbols,
  cardinalityToSymbolPartKinds,
  getDirAndLength,
} from "../symbol";
import { getNodeRect, getSelfEdgeRect } from "./rects";

export function getSelfPathsAndSymbols(
  sourceNode: Node,
  data: Relationship,
): {
  paths: string[];
  symbols: ReactElement[];
} | null {
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
  );
  const targetSymbols = buildSymbols(
    points[4].x,
    points[4].y,
    targetDir.x,
    targetDir.y,
    cardinalityToSymbolPartKinds(childCardinality),
    "target",
    targetLength,
  );
  const symbols = [...sourceSymbols, ...targetSymbols];

  return {
    paths,
    symbols,
  };
}
