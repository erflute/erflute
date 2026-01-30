import { type Edge, type EdgeProps } from "@xyflow/react";
import { type Relationship } from "@/types/domain/relationship";
import { OneToManyEdge } from "./edges/oneToManyEdge";
import { SelfEdge } from "./edges/selfEdge";

export function CardinalityEdge({
  source,
  target,
  ...props
}: EdgeProps<Edge<Relationship>>) {
  if (source === target) {
    return <SelfEdge source={source} target={target} {...props} />;
  }
  return <OneToManyEdge source={source} target={target} {...props} />;
}
