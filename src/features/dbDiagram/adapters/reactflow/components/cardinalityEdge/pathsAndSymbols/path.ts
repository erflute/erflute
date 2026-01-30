import { getStraightPath, type XYPosition } from "@xyflow/react";

export function getPaths(points: XYPosition[]): string[] {
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
