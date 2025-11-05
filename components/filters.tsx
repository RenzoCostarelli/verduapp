"use client";

import { Input } from "@/components/ui/input";
import { getNowInArgentina } from "@/lib/formatting";
import type { PaymentMethod } from "@/lib/types";
import { Button, Card } from "pixel-retroui";
import { useState } from "react";

export interface FilterParams {
  createdBy?: string;
  fromDate?: string;
  toDate?: string;
  paymentMethod?: PaymentMethod | "all";
  entryType?: "income" | "expense" | "all";
  period?: "today" | "week" | "month" | "all";
}

interface FiltersProps {
  onFilterChange: (filters: FilterParams) => void;
  availableUsers?: Array<{ id: string; email: string }>;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  debit_card: "Tarjeta de Débito",
  credit_card: "Tarjeta de Crédito",
  transfer: "Transferencia",
  other: "Otro",
};

export function Filters({ onFilterChange, availableUsers = [] }: FiltersProps) {
  const now = getNowInArgentina();
  const [filters, setFilters] = useState<FilterParams>({
    createdBy: "all",
    fromDate: "",
    toDate: "",
    paymentMethod: "all",
    entryType: "all",
    period: "all",
  });

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterParams, value: string) => {
    const newFilters = { ...filters, [key]: value };

    // Mutual exclusivity: if period is selected, clear custom dates
    if (key === "period" && value !== "") {
      newFilters.fromDate = "";
      newFilters.toDate = "";
    }

    // Mutual exclusivity: if custom date is selected, clear period
    if ((key === "fromDate" || key === "toDate") && value !== "") {
      newFilters.period = "" as "all" | "today" | "week" | "month" | undefined;
    }

    setFilters(newFilters);
  };

  const getDateRangeFromPeriod = (
    period: string
  ): { from: string; to: string } | null => {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const toISO = (d: Date) =>
      new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];

    switch (period) {
      case "today": {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { from: toISO(today), to: toISO(tomorrow) };
      }
      case "week": {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return { from: toISO(weekStart), to: toISO(weekEnd) };
      }
      case "month": {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { from: toISO(monthStart), to: toISO(monthEnd) };
      }
      case "all": {
        const allStart = new Date(2000, 0, 1);
        const allEnd = new Date(today);
        allEnd.setFullYear(today.getFullYear() + 10);
        return { from: toISO(allStart), to: toISO(allEnd) };
      }
      default:
        return null;
    }
  };

  const handleApply = () => {
    // Clean up filters - remove "all" values
    const cleanedFilters: FilterParams = {};

    if (filters.createdBy && filters.createdBy !== "all") {
      cleanedFilters.createdBy = filters.createdBy;
    }

    if (filters.paymentMethod && filters.paymentMethod !== "all") {
      cleanedFilters.paymentMethod = filters.paymentMethod;
    }

    if (filters.entryType && filters.entryType !== "all") {
      cleanedFilters.entryType = filters.entryType;
    }

    // Handle period vs custom dates
    if (filters.period) {
      const dateRange = getDateRangeFromPeriod(filters.period);
      if (dateRange) {
        cleanedFilters.fromDate = dateRange.from;
        cleanedFilters.toDate = dateRange.to;
      }
      cleanedFilters.period = filters.period;
    } else if (filters.fromDate && filters.toDate) {
      cleanedFilters.fromDate = filters.fromDate;
      cleanedFilters.toDate = filters.toDate;
    }

    onFilterChange(cleanedFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterParams = {
      createdBy: "all",
      fromDate: "",
      toDate: "",
      paymentMethod: "all",
      entryType: "all",
      period: "today",
    };
    setFilters(resetFilters);

    // Apply default today filter
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const toISO = (d: Date) =>
      new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];

    onFilterChange({
      fromDate: toISO(today),
      toDate: toISO(tomorrow),
      period: "today",
    });
  };

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-4">Filtros</h3>

      {/* Period Filters */}
      <div className="mb-4">
        {/* <label className="text-xs font-medium text-muted-foreground mb-2 block">
          Período
        </label> */}
        <div className="flex gap-0 items-center justify-start flex-wrap">
          <Button
            bg={filters.period === "today" ? "black" : ""}
            textColor={filters.period === "today" ? "white" : ""}
            shadow={filters.period === "today" ? "lightgray" : ""}
            onClick={() => handleFilterChange("period", "today")}
            className="text-sm"
          >
            Hoy
          </Button>
          <Button
            bg={filters.period === "week" ? "black" : ""}
            textColor={filters.period === "week" ? "white" : ""}
            shadow={filters.period === "week" ? "lightgray" : ""}
            onClick={() => handleFilterChange("period", "week")}
            className="text-sm"
          >
            Semana
          </Button>
          <Button
            bg={filters.period === "month" ? "black" : ""}
            textColor={filters.period === "month" ? "white" : ""}
            shadow={filters.period === "month" ? "lightgray" : ""}
            onClick={() => handleFilterChange("period", "month")}
            className="text-sm"
          >
            Mes
          </Button>
          <Button
            bg={filters.period === "all" ? "black" : ""}
            textColor={filters.period === "all" ? "white" : ""}
            shadow={filters.period === "all" ? "lightgray" : ""}
            onClick={() => handleFilterChange("period", "all")}
            className="text-sm"
          >
            X
          </Button>
        </div>
      </div>
      {/* Date From */}
      <div className="flex items-center justify-between w-[90%] mx-auto">
        <label htmlFor="from" className="mr-4">
          Desde
        </label>
        <input
          type="date"
          value={filters.fromDate || ""}
          onChange={(e) => handleFilterChange("fromDate", e.target.value)}
          className="text-sm"
          // disabled={!!filters.period}
          placeholder="Fecha desde"
          name="date-from"
          id="from"
        />
      </div>

      {/* Date To */}
      <div className="flex items-center justify-between w-[90%] mx-auto mb-4">
        <label htmlFor="until">Hasta</label>
        <input
          type="date"
          id="until"
          value={filters.toDate || ""}
          onChange={(e) => handleFilterChange("toDate", e.target.value)}
          className="text-sm"
          // disabled={!!filters.period}
          placeholder="Fecha hasta"
        />
      </div>

      {/* Advanced Filters */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 w-full ${
          availableUsers.length > 0 ? "lg:grid-cols-3" : "lg:grid-cols-2"
        } gap-4 mb-4`}
      >
        {/* Created By Filter - Only show if there are users */}
        {availableUsers.length > 0 && (
          <div className="relative">
            <Button
              type="button"
              className="w-[90%] justify-between"
              onClick={() => setUserDropdownOpen((v) => !v)}
            >
              <span>
                {filters.createdBy === "all"
                  ? "Creado por"
                  : availableUsers
                      .find((u) => u.id === filters.createdBy)
                      ?.email.split("@")[0] || "Seleccionar"}
              </span>
              <span aria-hidden>▾</span>
            </Button>

            {userDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2">
                <Card className="p-2">
                  <div
                    className={`w-full justify-start cursor-pointer p-2 hover:bg-gray-100 ${
                      filters.createdBy === "all"
                        ? "font-semibold underline"
                        : ""
                    }`}
                    onClick={() => {
                      handleFilterChange("createdBy", "all");
                      setUserDropdownOpen(false);
                    }}
                  >
                    Creado por
                  </div>
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`w-full justify-start cursor-pointer p-2 hover:bg-gray-100 ${
                        user.id === filters.createdBy
                          ? "font-semibold underline"
                          : ""
                      }`}
                      onClick={() => {
                        handleFilterChange("createdBy", user.id);
                        setUserDropdownOpen(false);
                      }}
                    >
                      {user.email.split("@")[0]}
                    </div>
                  ))}
                </Card>
              </div>
            )}
          </div>
        )}
        {/* Payment Method Filter */}
        <div className="relative">
          <Button
            type="button"
            className="w-[90%] justify-between"
            onClick={() => setMethodDropdownOpen((v) => !v)}
          >
            <span>
              {filters.paymentMethod === "all"
                ? "Modo de Pago"
                : METHOD_LABELS[filters.paymentMethod as PaymentMethod] ||
                  "Seleccionar"}
            </span>
            <span aria-hidden>▾</span>
          </Button>

          {methodDropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2">
              <Card className="p-2">
                <div
                  className={`w-full justify-start cursor-pointer p-2 hover:bg-gray-100 ${
                    filters.paymentMethod === "all"
                      ? "font-semibold underline"
                      : ""
                  }`}
                  onClick={() => {
                    handleFilterChange("paymentMethod", "all");
                    setMethodDropdownOpen(false);
                  }}
                >
                  Modo de Pago
                </div>
                {(
                  [
                    "cash",
                    "debit_card",
                    "credit_card",
                    "transfer",
                    "other",
                  ] as PaymentMethod[]
                ).map((val) => (
                  <div
                    key={val}
                    className={`w-full justify-start cursor-pointer p-2 hover:bg-gray-100 ${
                      val === filters.paymentMethod
                        ? "font-semibold underline"
                        : ""
                    }`}
                    onClick={() => {
                      handleFilterChange("paymentMethod", val);
                      setMethodDropdownOpen(false);
                    }}
                  >
                    {METHOD_LABELS[val]}
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>

        {/* Entry Type Filter */}
        <div className="relative">
          <Button
            type="button"
            className="w-[90%] justify-between"
            onClick={() => setTypeDropdownOpen((v) => !v)}
          >
            <span>
              {filters.entryType === "all"
                ? "Tipo"
                : filters.entryType === "income"
                ? "Ingresos"
                : filters.entryType === "expense"
                ? "Gastos"
                : "Seleccionar"}
            </span>
            <span aria-hidden>▾</span>
          </Button>

          {typeDropdownOpen && (
            <div className="absolute left-0 right-0 bottom-full z-50 mt-2">
              <Card className="p-2">
                {[
                  { value: "all", label: "Tipo" },
                  { value: "income", label: "Ingresos" },
                  { value: "expense", label: "Gastos" },
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`w-full justify-start cursor-pointer p-2 hover:bg-gray-100 ${
                      option.value === filters.entryType
                        ? "font-semibold underline"
                        : ""
                    }`}
                    onClick={() => {
                      handleFilterChange("entryType", option.value);
                      setTypeDropdownOpen(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button onClick={handleReset} className="text-sm" bg="lightgray">
          Limpiar
        </Button>
        <Button
          onClick={handleApply}
          className="text-sm"
          bg="black"
          textColor="white"
        >
          Aplicar Filtros
        </Button>
      </div>
    </Card>
  );
}
