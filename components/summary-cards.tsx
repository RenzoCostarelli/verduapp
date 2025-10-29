"use client";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatting";
import type { SummaryData } from "@/lib/types";
import { Card } from "pixel-retroui";

interface SummaryCardsProps {
  data: SummaryData;
  dateRange?: { from: Date; to: Date };
}

export function SummaryCards({ data, dateRange }: SummaryCardsProps) {
  const getDateRangeLabel = () => {
    if (!dateRange) return "";
    const from = dateRange.from.toLocaleDateString("es-AR");
    const to = new Date(dateRange.to.getTime() - 1).toLocaleDateString("es-AR");
    return `${from} a ${to}`;
  };

  return (
    <div>
      {dateRange && (
        <p className="text-sm text-muted-foreground mb-3">
          Período:{" "}
          <span className="font-medium text-foreground">
            {getDateRangeLabel()}
          </span>
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm font-medium text-muted-foreground">
            Ingresos
          </div>

          <div className="text-xl font-bold text-green-600">
            {formatCurrency(data.totalIncome)}
          </div>
        </Card>

        <Card>
          <div className="text-sm font-medium text-muted-foreground">
            Gastos
          </div>
          <div className="text-xl font-bold text-red-600 ">
            {formatCurrency(data.totalExpenses)}
          </div>
        </Card>

        <Card className="col-span-2">
          <div className="text-sm font-medium text-muted-foreground">
            Balance
          </div>

          <div
            className={`text-xl font-bold ${
              data.balance >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            {formatCurrency(data.balance)}
          </div>
        </Card>
      </div>
    </div>
  );
}
