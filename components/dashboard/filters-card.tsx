// components/dashboard/filters-card.tsx
"use client";

import { PropsWithChildren, useState } from "react";
// import { Button } from "@/components/ui/button";
import { Button } from "pixel-retroui";
import { ChevronDown } from "lucide-react";
import { Card } from "pixel-retroui";

type FiltersCardProps = PropsWithChildren<{
  title?: string;
  /** default open on desktop (md+) */
  defaultOpenDesktop?: boolean;
  /** default open on mobile (< md) */
  defaultOpenMobile?: boolean;
  /** optional localStorage key to persist user choice */
  storageKey?: string;
}>;

export default function FiltersCard({
  children,
  title = "Filtros",
  defaultOpenDesktop = true,
  defaultOpenMobile = false,
  storageKey = "dashboard:filters-open",
}: FiltersCardProps) {
  // ✅ Lazy initializer: run once, no effect needed
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    // 1) If the user has a saved preference, use it
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw === "true") return true;
        if (raw === "false") return false;
      } catch {
        // ignore storage errors
      }
      // 2) Otherwise, pick a default based on current viewport (one-time)
      const isDesktop =
        window.matchMedia?.("(min-width: 768px)").matches ?? false;
      return isDesktop ? defaultOpenDesktop : defaultOpenMobile;
    }
    // SSR fallback (mobile-leaning default)
    return defaultOpenMobile;
  });

  const toggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      // Persist only on user action (no effects)
      try {
        window.localStorage.setItem(storageKey, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <Button
          type="button"
          // variant="outline"
          // size="sm"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls="filters-panel"
          className="gap-2"
        >
          <span className="hidden sm:inline">
            {isOpen ? "Ocultar" : "Mostrar"}
          </span>
          <ChevronDown
            className={`h-2 w-2 transition-transform duration-200 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            aria-hidden="true"
          />
        </Button>
      </div>

      {/* Collapsible content (animated height without measuring) */}
      <div
        id="filters-panel"
        data-open={isOpen}
        className={`
          grid transition-[grid-template-rows] duration-300 ease-out mt-2
          ${
            isOpen
              ? "grid-rows-[1fr] h-auto"
              : "grid-rows-[0fr] h-0 overflow-hidden"
          }
        `}
      >
        <div className="overflow-hidden px-4 pb-4">{children}</div>
      </div>
    </Card>
  );
}
