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
  contentRef: RefObject<HTMLDivElement | null>,
  width?: number,
  height?: number,
  setWidth?: (width: number) => void,
  setHeight?: (height: number) => void,
) {
  // TODO: If TableCard becomes resizable in the future,
  // extend this logic (e.g. using ResizeObserver) to continuously
  // enforce the same minimum-size constraint while resizing.
  useEffect(() => {
    if (contentRef.current) {
      if (typeof width === "number" && setWidth) {
        // minWidth = left padding (4px) + right padding (4px)
        // + left/right border (1px each) + extra breathing room (2px)
        // + content width (rounded up to avoid sub-pixel overflow)
        const contentWidth = Math.ceil(
          contentRef.current.getBoundingClientRect().width,
        );
        const minWidth = 4 + 4 + 2 + 2 + contentWidth;
        if (width < minWidth) {
          setWidth(minWidth);
        }
      }
      if (typeof height === "number" && setHeight) {
        // minHeight = header height (20px) + bottom padding (4px)
        // + top/bottom border (1px each) + extra breathing room (2px)
        // + content height (rounded up to avoid sub-pixel overflow)
        const contentHeight = Math.ceil(
          contentRef.current.getBoundingClientRect().height,
        );
        const minHeight = 20 + 4 + 2 + 2 + contentHeight;
        if (height < minHeight) {
          setHeight(minHeight);
        }
      }
    }
  }, [contentRef, width, height, setHeight, setWidth]);
}
