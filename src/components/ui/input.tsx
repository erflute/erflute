import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-slate-300 h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base text-foreground/80 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm",
          "focus-visible:border-blue-500 focus-visible:ring-blue-200 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "read-only:bg-slate-100 text-foreground/80 read-only:dark:bg-slate-800/70 read-only:dark:text-foreground",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-foreground/70 disabled:opacity-100 disabled:dark:bg-slate-800 disabled:dark:text-foreground/60",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
