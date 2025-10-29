// components/reports/ui/report-summary-cards.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  totalIncomeLabel: string;
  totalExpensesLabel: string;
  balanceLabel: string;
  totalIncomeValue: string;
  totalExpensesValue: string;
  balanceValue: string;
  balancePositive: boolean;
};

export function ReportSummaryCards({
  totalIncomeLabel,
  totalExpensesLabel,
  balanceLabel,
  totalIncomeValue,
  totalExpensesValue,
  balanceValue,
  balancePositive,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-l-4 border-l-green-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {totalIncomeLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {totalIncomeValue}
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {totalExpensesLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {totalExpensesValue}
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {balanceLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              balancePositive ? "text-blue-600" : "text-red-600"
            }`}
          >
            {balanceValue}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
