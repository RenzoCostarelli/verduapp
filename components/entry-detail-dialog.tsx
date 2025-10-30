"use client";

import { Popup } from "pixel-retroui";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/formatting";
import type { Entry } from "@/lib/types";
import { getEntryTypeLabel, getPaymentMethodLabel } from "@/lib/utils";

interface EntryDetailDialogProps {
  entry: Entry | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EntryDetailDialog({
  entry,
  isOpen,
  onClose,
}: EntryDetailDialogProps) {
  if (!entry) return null;

  return (
    <Popup isOpen={isOpen} onClose={onClose} bg="lightpink" baseBg="palegreen">
      <div className="max-w-[80vw] md:max-w-md">
        <div className="mb-4">
          <h4 className="font-bold text-lg mb-1">Detalle del Movimiento</h4>
        </div>

        <div className="space-y-4">
          {/* Type */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-neutral-600">Tipo:</span>
            <Badge
              variant={entry.type === "income" ? "default" : "destructive"}
              className="w-fit"
            >
              {getEntryTypeLabel(entry.type)}
            </Badge>
          </div>

          {/* Amount */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-neutral-600">Monto:</span>
            <span
              className={`font-bold text-lg ${
                entry.type === "income" ? "text-green-600" : "text-red-600"
              }`}
            >
              {entry.type === "income" ? "+" : "-"}
              {formatCurrency(entry.amount)}
            </span>
          </div>

          {/* Date */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-neutral-600">
              Fecha/Hora:
            </span>
            <span className="text-sm text-neutral-900">
              {formatDate(entry.date)}
            </span>
          </div>

          {/* Payment Method */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-neutral-600">
              Método de Pago:
            </span>
            <span className="text-sm text-neutral-900">
              {getPaymentMethodLabel(entry.method)}
            </span>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-neutral-600">
              Descripción:
            </span>
            <div className="bg-neutral-50 border border-neutral-200 rounded p-3 min-h-[60px]">
              <p className="text-sm text-neutral-900 whitespace-pre-wrap">
                {entry.description || "Sin descripción"}
              </p>
            </div>
          </div>

          {/* Created By */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-neutral-600">
              Creado por:
            </span>
            <span className="text-sm text-neutral-900 capitalize">
              {entry.user_email?.split("@")[0] || "Desconocido"}
            </span>
          </div>

          {/* Created At (if available) */}
          {entry.created_at && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-neutral-600">
                Fecha de Creación:
              </span>
              <span className="text-sm text-neutral-900 whitespace-nowrap">
                {formatDate(entry.created_at)}
              </span>
            </div>
          )}

          {/* ID */}
          {/* <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-neutral-600">ID:</span>
            <code className="text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 break-all">
              {entry.id}
            </code>
          </div> */}
        </div>
      </div>
    </Popup>
  );
}
