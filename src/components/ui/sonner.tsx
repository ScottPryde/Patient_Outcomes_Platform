"use client";

import { Suspense, lazy, createElement } from "react";
import type { ToasterProps } from "sonner";

const SonnerLazy = lazy(async () => {
  const { useTheme } = await import("next-themes");
  const { Toaster: SonnerToaster } = await import("sonner");
  
  const ToasterComponent = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme();
    return createElement(SonnerToaster, {
      theme: theme as ToasterProps["theme"],
      className: "toaster group",
      style: {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      } as React.CSSProperties,
      ...props,
    });
  };
  
  return { default: ToasterComponent };
});

const Toaster = (props: ToasterProps) => {
  return createElement(Suspense, { fallback: null }, createElement(SonnerLazy, props));
};

export { Toaster };

export const toast = {
  success: (...args: any[]) => import("sonner").then(m => m.toast.success(...args)),
  error: (...args: any[]) => import("sonner").then(m => m.toast.error(...args)),
  toast: (...args: any[]) => import("sonner").then(m => m.toast(...args)),
  dismiss: (...args: any[]) => import("sonner").then(m => m.toast.dismiss(...args)),
};
