import { type Node, type XYPosition } from "@xyflow/react";

export function getNodeRect(
  node: Node,
): { x: number; y: number; w: number; h: number } | null {
  const width = node.measured?.width ?? node.width ?? 0;
  const height = node.measured?.height ?? node.height ?? 0;
  if (width <= 0 || height <= 0) {
    return null;
  }
  return {
    x: node.position.x,
    y: node.position.y,
    w: width,
    h: height,
  };
}

export function getSelfEdgeRect(
  nodeRect: { x: number; y: number; w: number; h: number },
  bendpoint: XYPosition,
): { x: number; y: number; w: number; h: number } {
  const centerX = nodeRect.x + nodeRect.w;
  const centerY = nodeRect.y + nodeRect.h;
  const halfW = (nodeRect.w * bendpoint.x) / 200;
  const halfH = (nodeRect.h * bendpoint.y) / 200;
  return {
    x: centerX - halfW,
    y: centerY - halfH,
    w: halfW * 2,
    h: halfH * 2,
  };
}
