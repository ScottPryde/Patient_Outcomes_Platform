import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success:
          "border-transparent bg-[var(--success)] text-white",
        warning:
          "border-transparent bg-[var(--warning)] text-white",
        info:
          "border-transparent bg-[var(--blue)] text-white",
        muted:
          "border-transparent bg-[var(--badge-neutral-bg)] text-[var(--text-secondary)]",
        navy:
          "border-transparent bg-[var(--badge-navy-bg)] text-[var(--blue)]",
        purple:
          "border-transparent bg-[var(--badge-vault-bg)] text-[var(--purple)]",
        teal:
          "border-transparent bg-[var(--badge-teal-bg)] text-[var(--teal)]",
        "success-light":
          "border-transparent bg-[var(--priority-low-bg)] text-[var(--priority-low-text)]",
        "warning-light":
          "border-transparent bg-[var(--state-pending-bg)] text-[var(--state-pending-text)]",
        "info-light":
          "border-transparent bg-[var(--state-info-bg)] text-[var(--state-info-text)]",
        "danger-light":
          "border-transparent bg-[var(--state-error-bg)] text-[var(--state-error-text)]",
      },
      size: {
        sm: "text-[10px] px-1.5 py-0",
        md: "text-xs px-2 py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
