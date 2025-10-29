import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    cash: "Efectivo",
    debit_card: "Tarjeta de Débito",
    credit_card: "Tarjeta de Crédito",
    transfer: "Transferencia",
    other: "Otro",
  };
  return labels[method] || method;
};

export const getEntryTypeLabel = (type: string): string => {
  return type === "income" ? "Ingreso" : "Gasto";
};
