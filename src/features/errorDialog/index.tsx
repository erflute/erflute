import { useId } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useErrorDialogStore } from "@/stores/errorDialogStore";
import type { ErrorDialogContent, ShowErrorDialogOptions } from "./types";

const defaultTitle = "Something went wrong";
const defaultMessage = "An unexpected error occurred.";

function normalizeError(
  error: unknown,
): Pick<ErrorDialogContent, "message" | "details"> {
  if (error instanceof Error) {
    return {
      message: error.message || defaultMessage,
      details: error.stack ?? undefined,
    };
  }
  if (typeof error === "string") {
    return { message: defaultMessage, details: error };
  }
  if (typeof error === "object" && error !== null) {
    try {
      return {
        message: defaultMessage,
        details: JSON.stringify(error, null, 2),
      };
    } catch {
      return {
        message: defaultMessage,
        details: Object.prototype.toString.call(error),
      };
    }
  }
  return { message: defaultMessage, details: String(error) };
}

function buildDetails(details?: string, context?: string) {
  if (!context) {
    return details;
  }
  if (!details) {
    return context;
  }
  return `${context}\n\n${details}`;
}

export function showErrorDialog(
  error: unknown,
  options?: ShowErrorDialogOptions,
) {
  const parsedError = normalizeError(error);
  const content: ErrorDialogContent = {
    title: options?.title ?? defaultTitle,
    message: options?.message ?? parsedError.message,
    details: buildDetails(parsedError.details, options?.context),
  };
  if (error instanceof Error) {
    console.error(error);
  } else {
    console.error("Error reported to dialog:", error);
  }
  useErrorDialogStore.getState().openDialog(content);
}

export function ErrorDialog() {
  const { isOpen, content, closeDialog } = useErrorDialogStore();
  const detailId = useId();

  if (!content) {
    return null;
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-xl" showCloseButton={false}>
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-semibold text-red-700">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-left">
            {content.message}
          </DialogDescription>
        </DialogHeader>
        {content.details ? (
          <div
            id={detailId}
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left"
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Details
            </p>
            <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-all text-xs leading-5 text-slate-700">
              {content.details}
            </pre>
          </div>
        ) : null}
        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" onClick={closeDialog}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
