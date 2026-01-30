import { type ReactElement } from "react";
import { type Node } from "@xyflow/react";
import { Cardinality, type Relationship } from "@/types/domain/relationship";
import { getPaths } from "../path";
import {
  buildSymbols,
  cardinalityToSymbolPartKinds,
  getDirAndLength,
} from "../symbol";
import { getEdgePos, getNeabyPositions } from "./positions";

export function getOneToManyPathsAndSymbols(
  sourceNode: Node,
  targetNode: Node,
  data: Relationship,
): {
  paths: string[];
  symbols: ReactElement[];
} | null {
  const { sourceNearbyPos, targetNearbyPos } = getNeabyPositions(
    sourceNode,
    targetNode,
    data?.bendpoints,
  );
  const sourcePos = getEdgePos(sourceNode, sourceNearbyPos);
  const targetPos = getEdgePos(targetNode, targetNearbyPos);

  const paths = getPaths([
    sourcePos,
    ...(data?.bendpoints ? data.bendpoints : []),
    targetPos,
  ]);

  const noBendpoints = !data?.bendpoints || data?.bendpoints.length == 0;
  const { dir: sourceDir, length: sourceLength } = getDirAndLength(
    sourcePos,
    noBendpoints ? targetPos : sourceNearbyPos,
  );
  const { dir: targetDir, length: targetLength } = getDirAndLength(
    targetPos,
    noBendpoints ? sourcePos : targetNearbyPos,
  );

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
  );
  const targetSymbols = buildSymbols(
    targetPos.x,
    targetPos.y,
    targetDir.x,
    targetDir.y,
    cardinalityToSymbolPartKinds(childCardinality),
    "target",
    targetLength,
  );
  const symbols = [...sourceSymbols, ...targetSymbols];

  return { paths, symbols };
}
