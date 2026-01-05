"use client";

import { Suspense, lazy } from "react";
import { useTheme } from "next-themes";
import type { ToasterProps } from "sonner";

const SonnerLazy = lazy(async () => {
  const mod = await import("sonner");
  return { default: mod.Toaster } as any;
});

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Suspense fallback={null}>
      <SonnerLazy
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        style={
          {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
          } as React.CSSProperties
        }
        {...props}
      />
    </Suspense>
  );
};

export { Toaster };

export const toast = {
  success: (...args: any[]) => import("sonner").then(m => m.toast.success(...args)),
  error: (...args: any[]) => import("sonner").then(m => m.toast.error(...args)),
  // generic call
  toast: (...args: any[]) => import("sonner").then(m => m.toast(...args)),
  dismiss: (...args: any[]) => import("sonner").then(m => m.toast.dismiss(...args)),
};
