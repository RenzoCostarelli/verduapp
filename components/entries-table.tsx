"use client";

import { useState, useMemo } from "react";
// import { Input } from "@/components/ui/input";
import { Card, Input } from "pixel-retroui";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/formatting";
import { getPaymentMethodLabel, getEntryTypeLabel } from "@/lib/utils";
import type { Entry, PaymentMethod } from "@/lib/types";
import { Trash2 } from "lucide-react";

interface EntriesTableProps {
  entries: Entry[];
  onDelete: (id: string) => void;
}

export function EntriesTable({ entries, onDelete }: EntriesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and search
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        !searchTerm ||
        entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getPaymentMethodLabel(entry.method)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesMethod =
        methodFilter === "all" || entry.method === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [entries, searchTerm, methodFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(start, start + itemsPerPage);
  }, [filteredEntries, currentPage]);

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este movimiento?")) {
      onDelete(id);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border">
        <p className="text-muted-foreground mb-4">
          No hay movimientos registrados
        </p>
        <p className="text-sm text-muted-foreground">
          Comienza agregando tu primer ingreso o gasto
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Buscar por descripción o método..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1"
        />
        {/* <Select
          value={methodFilter}
          onValueChange={(value) =>
            setMethodFilter(value as PaymentMethod | "all")
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los métodos</SelectItem>
            <SelectItem value="cash">Efectivo</SelectItem>
            <SelectItem value="debit_card">Tarjeta de Débito</SelectItem>
            <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
            <SelectItem value="transfer">Transferencia</SelectItem>
            <SelectItem value="other">Otro</SelectItem>
          </SelectContent>
        </Select> */}
      </div>

      {/* Table */}
      <Card className="overflow-x-auto ">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Tipo</th>
              <th className="px-4 py-3 text-left font-semibold">Monto</th>
              <th className="px-4 py-3 text-left font-semibold">Fecha/Hora</th>
              <th className="px-4 py-3 text-left font-semibold">Método</th>
              <th className="px-4 py-3 text-left font-semibold">Descripción</th>
              <th className="px-4 py-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEntries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      entry.type === "income" ? "default" : "destructive"
                    }
                    className="w-fit"
                  >
                    {getEntryTypeLabel(entry.type)}
                  </Badge>
                </td>
                <td
                  className={`px-4 py-3 font-semibold ${
                    entry.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {entry.type === "income" ? "+" : "-"}
                  {formatCurrency(entry.amount)}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {formatDate(entry.date)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {getPaymentMethodLabel(entry.method)}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                  {entry.description || "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
            {Math.min(currentPage * itemsPerPage, filteredEntries.length)} de{" "}
            {filteredEntries.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="bg-transparent"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="bg-transparent"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
