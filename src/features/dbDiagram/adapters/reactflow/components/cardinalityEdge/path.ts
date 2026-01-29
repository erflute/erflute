import { getStraightPath, type XYPosition } from "@xyflow/react";
import { type Bendpoint } from "@/types/domain/relationship";

export function getPaths(
  source: XYPosition,
  target: XYPosition,
  bendpoints?: Bendpoint[],
): string[] {
  const points: XYPosition[] = [source];
  bendpoints
    ?.filter((bnd) => !bnd.relative)
    .forEach((bnd) => points.push({ x: bnd.x, y: bnd.y } as XYPosition));
  points.push(target);

  const paths = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [straightPath] = getStraightPath({
      sourceX: points[i].x,
      sourceY: points[i].y,
      targetX: points[i + 1].x,
      targetY: points[i + 1].y,
    });
    paths.push(straightPath);
  }
  return paths;
}
