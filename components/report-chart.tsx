"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/formatting";
import { Card } from "pixel-retroui";

interface ChartData {
  name: string;
  income: number;
  expenses: number;
}

interface ReportChartProps {
  data: ChartData[];
}

export function ReportChart({ data }: ReportChartProps) {
  return (
    <Card className="h-80 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value) => formatCurrency(value as number)}
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
            }}
          />
          <Legend />
          <Bar dataKey="income" fill="#16a34a" name="Ingresos" />
          <Bar dataKey="expenses" fill="#dc2626" name="Gastos" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
