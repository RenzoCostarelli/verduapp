// components/reports/ui/date-range-card.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Card } from "pixel-retroui";

type Props = {
  title?: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  onChange: (v: { from: string; to: string }) => void;
};

export function DateRangeCard({
  title = "Seleccionar Período",
  from,
  to,
  onChange,
}: Props) {
  return (
    <>
      <h2 className="text-sm font-semibold mb-4 text-foreground">{title}</h2>
      <Card>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="date"
            value={from}
            onChange={(e) => onChange({ from: e.target.value, to })}
            className="flex-1"
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => onChange({ from, to: e.target.value })}
            className="flex-1"
          />
        </div>
      </Card>
    </>
  );
}
