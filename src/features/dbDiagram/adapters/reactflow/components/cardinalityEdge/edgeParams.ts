import { type Node } from "@xyflow/react";

function getNodeCenter(node: Node) {
  const x = node.position.x + (node.measured?.width ?? node.width ?? 0) / 2;
  const y = node.position.y + (node.measured?.height ?? node.height ?? 0) / 2;
  return { x, y };
}

function getIntersectionOnRect(
  from: { x: number; y: number },
  rect: {
    x: number;
    y: number;
    w: number;
    h: number;
  },
) {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const vx = from.x - cx;
  const vy = from.y - cy;
  const halfW = rect.w / 2;
  const halfH = rect.h / 2;

  if (vx === 0 && vy === 0) {
    return {
      x: rect.x + rect.w,
      y: cy,
    };
  }

  if (halfW === 0 && halfH === 0) {
    return { x: rect.x, y: rect.y };
  }

  if (halfW === 0) {
    if (vx === 0 && halfH > 0) {
      return { x: cx, y: cy + Math.sign(vy) * halfH };
    }
    return { x: cx, y: cy };
  }

  if (halfH === 0) {
    if (vy === 0 && halfW > 0) {
      return { x: cx + Math.sign(vx) * halfW, y: cy };
    }
    return { x: cx, y: cy };
  }

  const avx = Math.abs(vx);
  const avy = Math.abs(vy);

  if (avx === 0) {
    return { x: cx, y: cy + Math.sign(vy) * halfH };
  }

  if (avy === 0) {
    return { x: cx + Math.sign(vx) * halfW, y: cy };
  }

  if (avx / halfW > avy / halfH) {
    const s = halfW / avx;
    const x = cx + Math.sign(vx) * halfW;
    let y = cy + vy * s;
    y = Math.min(cy + halfH, Math.max(cy - halfH, y));
    return { x, y };
  } else {
    const s = halfH / avy;
    let x = cx + vx * s;
    const y = cy + Math.sign(vy) * halfH;
    x = Math.min(cx + halfW, Math.max(cx - halfW, x));
    return { x, y };
  }
}

export function getEdgeParams(sourceNode: Node, targetNode: Node) {
  const sc = getNodeCenter(sourceNode);
  const tc = getNodeCenter(targetNode);
  const sRect = {
    x: sourceNode.position.x,
    y: sourceNode.position.y,
    w: sourceNode.measured?.width ?? sourceNode.width ?? 0,
    h: sourceNode.measured?.height ?? sourceNode.height ?? 0,
  };
  const tRect = {
    x: targetNode.position.x,
    y: targetNode.position.y,
    w: targetNode.measured?.width ?? targetNode.width ?? 0,
    h: targetNode.measured?.height ?? targetNode.height ?? 0,
  };

  const s = getIntersectionOnRect(tc, sRect);
  const t = getIntersectionOnRect(sc, tRect);

  return {
    sourcePos: s,
    targetPos: t,
  };
}
