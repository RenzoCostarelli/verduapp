// components/dashboard/header-bar.tsx
"use client";

import Link from "next/link";
// import { Button } from "@/components/ui/button";
import { Button } from "pixel-retroui";

type Props = {
  title: string;
  subtitle?: string;
  reportsHref: string;
  onNewMovement: () => void;
};

export default function HeaderBar({
  title,
  subtitle,
  reportsHref,
  onNewMovement,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div className="flex justify-between w-full items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {subtitle ? (
            <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
          ) : null}
        </div>
        <div className="md:hidden ">
          <Link href={reportsHref}>
            <Button bg="lightgreen" className="px-2">
              $
            </Button>
          </Link>
        </div>
      </div>

      {/* Desktop actions */}
      <div className="gap-2 hidden md:flex">
        {/* <Button
          onClick={onNewMovement}
          className="bg-green-600 hover:bg-green-700"
        >
          + Nuevo Movimiento
        </Button> */}
        <Link href={reportsHref}>
          <Button bg="lightgreen">Reportes</Button>
        </Link>
      </div>

      {/* Mobile reports button */}
    </div>
  );
}
