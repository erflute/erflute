/* istanbul ignore file */
import { useEffect, type RefObject } from "react";

/**
 * Ensures a minimum TableCard size based on its content.
 *
 * The provided width and height are generally respected, but they are
 * clamped to a minimum size derived from the rendered content so that
 * all table content remains fully visible.
 */
export function useMinTableSize(
  columnContentRef: RefObject<HTMLDivElement | null>,
  indexContentRef: RefObject<HTMLDivElement | null>,
  width?: number,
  height?: number,
  setWidth?: (width: number) => void,
  setHeight?: (height: number) => void,
  // `ref.current` changes do not trigger effects.
  // Re-run this effect when index rows are added/removed so a newly mounted
  // index section is measured and observed immediately.
  indexCount?: number,
) {
  useEffect(() => {
    const clampToMinSize = () => {
      if (!columnContentRef.current) {
        return;
      }
      if (typeof width === "number" && setWidth) {
        // minWidth = left padding (4px) + right padding (4px)
        // + left/right border (1px each) + extra breathing room (2px)
        // + full content width (including overflow)
        const columnWidth = columnContentRef.current.scrollWidth;
        const indexWidth = indexContentRef.current?.scrollWidth ?? 0;
        const minWidth = 4 + 4 + 2 + 2 + Math.max(columnWidth, indexWidth);
        if (width < minWidth) {
          setWidth(minWidth);
        }
      }
      if (typeof height === "number" && setHeight) {
        // minHeight = header height (20px) + bottom padding (4px)
        // + top/bottom border (1px each) + extra breathing room (2px)
        // + full content height (including overflow)
        const columnHeight = columnContentRef.current.scrollHeight;
        const indexHeight = indexContentRef.current?.scrollHeight ?? 0;
        const minHeight = 20 + 4 + 2 + 2 + columnHeight + indexHeight;
        if (height < minHeight) {
          setHeight(minHeight);
        }
      }
    };

    clampToMinSize();

    if (!columnContentRef.current || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(() => {
      clampToMinSize();
    });
    observer.observe(columnContentRef.current);
    if (indexContentRef.current) {
      observer.observe(indexContentRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [width, height, setHeight, setWidth, indexCount]);
}
