// app/dashboard/page.tsx
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getNowInArgentina } from "@/lib/formatting";

export default function Page() {
  // Compute default date range on the server (no client state/hooks needed)
  const now = getNowInArgentina();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return (
    <DashboardClient
      defaultDateRange={{ from: monthStart, to: monthEnd }}
      reportsHref="/reports"
      title="Caja Verdulería"
      subtitle="Gestor de flujo de caja"
    />
  );
}
