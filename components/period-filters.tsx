"use client";

// import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getNowInArgentina } from "@/lib/formatting";
import type { DateRange } from "@/lib/types";
import { Button } from "pixel-retroui";
import { useState } from "react";

interface PeriodFiltersProps {
  onFilterChange: (range: DateRange) => void;
}

export function PeriodFilters({ onFilterChange }: PeriodFiltersProps) {
  const now = getNowInArgentina();
  const [filterType, setFilterType] = useState<
    "today" | "week" | "month" | "custom"
  >("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const getDateRange = (type: string): DateRange => {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    switch (type) {
      case "today": {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { from: today, to: tomorrow };
      }
      case "week": {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return { from: weekStart, to: weekEnd };
      }
      case "month": {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { from: monthStart, to: monthEnd };
      }
      default:
        return { from: today, to: today };
    }
  };

  const handleFilterClick = (type: "today" | "week" | "month") => {
    setFilterType(type);
    onFilterChange(getDateRange(type));
  };

  const handleCustomRange = () => {
    if (customFrom && customTo) {
      const from = new Date(customFrom);
      const to = new Date(customTo);
      to.setDate(to.getDate() + 1); // Include the entire end date
      onFilterChange({ from, to });
      setFilterType("custom");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        <Button
          bg={filterType === "today" ? "black" : ""}
          textColor={filterType === "today" ? "white" : ""}
          shadow={filterType === "today" ? "lightgray" : ""}
          onClick={() => handleFilterClick("today")}
          className="text-sm"
        >
          Hoy
        </Button>
        <Button
          bg={filterType === "week" ? "black" : ""}
          textColor={filterType === "week" ? "white" : ""}
          shadow={filterType === "week" ? "lightgray" : ""}
          onClick={() => handleFilterClick("week")}
          className="text-sm"
        >
          Esta Semana
        </Button>
        <Button
          bg={filterType === "month" ? "black" : ""}
          textColor={filterType === "month" ? "white" : ""}
          shadow={filterType === "month" ? "lightgray" : ""}
          // variant={filterType === "month" ? "default" : "outline"}
          onClick={() => handleFilterClick("month")}
          className="text-sm"
        >
          Este Mes
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="date"
          value={customFrom}
          onChange={(e) => setCustomFrom(e.target.value)}
          placeholder="Desde"
          className="text-sm"
        />
        <Input
          type="date"
          value={customTo}
          onChange={(e) => setCustomTo(e.target.value)}
          placeholder="Hasta"
          className="text-sm"
        />
        <Button
          onClick={handleCustomRange}
          // variant="outline"
          className="text-sm bg-transparent"
        >
          Aplicar
        </Button>
      </div>
    </div>
  );
}
