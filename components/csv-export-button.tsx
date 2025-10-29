"use client";

import { Button } from "@/components/ui/button";
import { formatDateOnly } from "@/lib/formatting";
import { getPaymentMethodLabel, getEntryTypeLabel } from "@/lib/utils";
import type { Entry } from "@/lib/types";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface CsvExportButtonProps {
  entries: Entry[];
}

export function CsvExportButton({ entries }: CsvExportButtonProps) {
  const handleExport = () => {
    if (entries.length === 0) {
      toast.error("Sin datos", {
        description: "No hay movimientos para exportar",
      });
      return;
    }

    const headers = ["Tipo", "Monto", "Fecha", "Método", "Descripción"];
    const rows = entries.map((entry) => [
      getEntryTypeLabel(entry.type),
      entry.amount.toString(),
      formatDateOnly(entry.date),
      getPaymentMethodLabel(entry.method),
      entry.description || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const escaped = cell.replace(/"/g, '""');
            return escaped.includes(",") ? `"${escaped}"` : escaped;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const now = new Date();
    const filename = `caja-verduleria-${now.toISOString().split("T")[0]}.csv`;

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Éxito", {
      description: `Exportado ${entries.length} movimiento(s)`,
    });
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      className="gap-2 bg-transparent"
    >
      <Download className="w-4 h-4" />
      Exportar CSV
    </Button>
  );
}
