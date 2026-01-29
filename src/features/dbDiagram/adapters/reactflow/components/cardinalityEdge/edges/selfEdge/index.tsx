import { type Edge, type EdgeProps } from "@xyflow/react";
import { type Relationship } from "@/types/domain/relationship";

export function SelfEdge({
  id,
  source,
  target,
  data,
  markerEnd,
  style,
}: EdgeProps<Edge<Relationship>>) {
  return <div></div>;
}
