/* istanbul ignore file */
import { useCallback, useEffect, type RefObject } from "react";

/**
 * Ensures a minimum TableCard size based on its content.
 *
 * The provided width and height are generally respected, but they are
 * clamped to a minimum size derived from the rendered content so that
 * all table content remains fully visible.
 */
export function useMinTableSize(
  contentRef: RefObject<HTMLDivElement | null>,
  width?: number,
  height?: number,
  setWidth?: (width: number) => void,
  setHeight?: (height: number) => void,
) {
  const clampToMinSize = useCallback(() => {
    if (!contentRef.current) {
      return;
    }
    if (typeof width === "number" && setWidth) {
      // minWidth = left padding (4px) + right padding (4px)
      // + left/right border (1px each) + extra breathing room (2px)
      // + full content width (including overflow)
      const contentWidth = contentRef.current.scrollWidth;
      const minWidth = 4 + 4 + 2 + 2 + contentWidth;
      if (width < minWidth) {
        setWidth(minWidth);
      }
    }
    if (typeof height === "number" && setHeight) {
      // minHeight = header height (20px) + bottom padding (4px)
      // + top/bottom border (1px each) + extra breathing room (2px)
      // + full content height (including overflow)
      const contentHeight = contentRef.current.scrollHeight;
      const minHeight = 20 + 4 + 2 + 2 + contentHeight;
      if (height < minHeight) {
        setHeight(minHeight);
      }
    }
  }, [contentRef, height, setHeight, setWidth, width]);

  useEffect(() => {
    clampToMinSize();
  }, [clampToMinSize]);

  useEffect(() => {
    if (!contentRef.current || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(() => {
      clampToMinSize();
    });
    observer.observe(contentRef.current);
    return () => {
      observer.disconnect();
    };
  }, [clampToMinSize, contentRef]);
}
