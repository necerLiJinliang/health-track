"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

/**
 * Separator component
 *
 * Usage:
 * <Separator className="my-4" />
 * <Separator orientation="vertical" className="mx-4" />
 *
 * Props extend Radix Separator props and allow custom Tailwind classes.
 */
export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /**
   * orientation: "horizontal" | "vertical"
   * default: "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * decorative: if true, element is hidden from assistive tech
   * default: true (purely visual)
   */
  decorative?: boolean;
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal"
          ? "h-px w-full"
          : "w-px h-full",
        className,
      )}
      {...props}
    />
  );
});

Separator.displayName = "Separator";

export { Separator };
