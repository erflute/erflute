import { type Edge, type EdgeProps } from "@xyflow/react";
import { type Relationship } from "@/types/domain/relationship";
import { OneToManyEdge } from "./edges/oneToManyEdge";
import { SelfEdge } from "./edges/selfEdge";

export function CardinalityEdge({
  data,
  ...props
}: EdgeProps<Edge<Relationship>>) {
  if (
    !!data?.bendpoints &&
    data.bendpoints.length > 0 &&
    data.bendpoints.some((bp) => bp.relative)
  ) {
    return <SelfEdge data={data} {...props} />;
  }
  return <OneToManyEdge data={data} {...props} />;
}
