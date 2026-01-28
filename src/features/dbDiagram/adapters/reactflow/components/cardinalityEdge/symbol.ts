import { createElement } from "react";
import type { ReactElement } from "react";
import { type XYPosition } from "@xyflow/react";
import { Cardinality } from "@/types/domain/relationship";

const DEFAULT_OFFSET = 16;
const SYMBOL_SPACING = 6;
const LINE_LENGTH = 10;
const CROWFOOT_DEPTH = 10;
const CROWFOOT_SPREAD = 12;
const CIRCLE_RADIUS = 3;
const ADJACENT_SPACING = 2;

type SymbolPartKind = "line" | "circle" | "crowfoot";

export const cardinalityToSymbolPartKinds = (
  value: Cardinality,
): SymbolPartKind[] => {
  switch (value) {
    case Cardinality.One:
      return ["line"];
    case Cardinality.ZeroOne:
      return ["circle", "line"];
    case Cardinality.OneN:
      return ["crowfoot", "line"];
    case Cardinality.ZeroN:
      return ["crowfoot", "circle"];
  }
};

export function buildSymbols(
  nodeX: number,
  nodeY: number,
  dirX: number,
  dirY: number,
  symbolPartKinds: SymbolPartKind[],
  keyPrefix: string,
  pathLength: number,
  strokeColor: string,
  strokeWidth?: number,
): ReactElement[] {
  const symbols: ReactElement[] = [];

  if (!symbolPartKinds.length) {
    return symbols;
  }

  const maxReach = Math.max(0, pathLength / 2 - 2);
  const totalSpan = symbolPartKinds.reduce((acc, symbol, index) => {
    if (index === 0) {
      return acc;
    }
    const prev = symbolPartKinds[index - 1];
    const spacing = shouldUseAdjacentSpacing(prev, symbol)
      ? ADJACENT_SPACING
      : SYMBOL_SPACING;
    return acc + spacing;
  }, 0);
  const startOffset = Math.min(DEFAULT_OFFSET, maxReach - totalSpan);

  if (!Number.isFinite(startOffset) || startOffset <= 0) {
    return symbols;
  }

  const perpX = -dirY;
  const perpY = dirX;

  let offset = startOffset;

  symbolPartKinds.forEach((symbol, index) => {
    const clampedOffset = Math.min(offset, maxReach);
    const centerX = nodeX + dirX * clampedOffset;
    const centerY = nodeY + dirY * clampedOffset;

    switch (symbol) {
      case "line": {
        const halfLine = LINE_LENGTH / 2;
        const startX = centerX + perpX * halfLine;
        const startY = centerY + perpY * halfLine;
        const endX = centerX - perpX * halfLine;
        const endY = centerY - perpY * halfLine;
        symbols.push(
          createElement("path", {
            key: `${keyPrefix}-line-${index}`,
            d: `M ${startX} ${startY} L ${endX} ${endY}`,
            stroke: strokeColor,
            strokeWidth,
            fill: "none",
          }),
        );
        break;
      }
      case "circle": {
        symbols.push(
          createElement("circle", {
            key: `${keyPrefix}-circle-${index}`,
            cx: centerX,
            cy: centerY,
            r: CIRCLE_RADIUS,
            fill: strokeColor,
          }),
        );
        break;
      }
      case "crowfoot": {
        const tipX = centerX;
        const tipY = centerY;
        const baseX = tipX - dirX * CROWFOOT_DEPTH;
        const baseY = tipY - dirY * CROWFOOT_DEPTH;
        const halfSpread = CROWFOOT_SPREAD / 2;
        const leftX = baseX + perpX * halfSpread;
        const leftY = baseY + perpY * halfSpread;
        const rightX = baseX - perpX * halfSpread;
        const rightY = baseY - perpY * halfSpread;
        symbols.push(
          createElement("path", {
            key: `${keyPrefix}-crowfoot-${index}`,
            d: `M ${leftX} ${leftY} L ${tipX} ${tipY} L ${rightX} ${rightY}`,
            stroke: strokeColor,
            strokeWidth,
            fill: "none",
            strokeLinejoin: "round",
          }),
        );
        break;
      }
    }

    if (index < symbolPartKinds.length - 1) {
      const next = symbolPartKinds[index + 1];
      const spacing = shouldUseAdjacentSpacing(symbol, next)
        ? ADJACENT_SPACING
        : SYMBOL_SPACING;
      offset += spacing;
    }
  });

  return symbols;
}

function shouldUseAdjacentSpacing(
  current: SymbolPartKind,
  next: SymbolPartKind,
) {
  return (
    (current === "crowfoot" && (next === "line" || next === "circle")) ||
    ((current === "line" || current === "circle") && next === "crowfoot")
  );
}

export function getDirAndLength(sourcePos: XYPosition, targetPos: XYPosition) {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const length = Math.hypot(dx, dy);

  if (length < 1e-6) {
    return {
      dir: { x: 0, y: 0 } as XYPosition,
      length,
    };
  }

  const dirX = dx / length;
  const dirY = dy / length;
  return {
    dir: { x: dirX, y: dirY } as XYPosition,
    length,
  };
}
