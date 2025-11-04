"use client";

import { useMemo, useState } from "react";
// import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formatting";
import type { Entry, PaymentMethod } from "@/lib/types";
import { getEntryTypeLabel, getPaymentMethodLabel } from "@/lib/utils";
import { ChevronDown, ChevronsDown, Eye, Trash2 } from "lucide-react";
import { Card, Input } from "pixel-retroui";
import { EntryDetailDialog } from "./entry-detail-dialog";

interface EntriesTableProps {
  entries: Entry[];
  totalEntries?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onDelete: (id: string) => void;
  onUpdate?: (updatedEntry: Entry) => void;
  isLoading?: boolean;
}

export function EntriesTable({
  entries,
  totalEntries,
  currentPage: externalCurrentPage,
  onPageChange,
  onDelete,
  onUpdate,
  isLoading = false,
}: EntriesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">(
    "all"
  );
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Use external pagination if provided, otherwise use internal
  const isServerSidePagination = onPageChange !== undefined;
  const currentPage = isServerSidePagination ? externalCurrentPage! : internalCurrentPage;

  // Filter and search (only for client-side pagination)
  const filteredEntries = useMemo(() => {
    if (isServerSidePagination) {
      return entries; // Server already filtered
    }
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
  }, [entries, searchTerm, methodFilter, isServerSidePagination]);

  // Pagination
  const totalPages = isServerSidePagination
    ? Math.ceil((totalEntries || 0) / itemsPerPage)
    : Math.ceil(filteredEntries.length / itemsPerPage);

  const paginatedEntries = useMemo(() => {
    if (isServerSidePagination) {
      return entries; // Server already paginated
    }
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(start, start + itemsPerPage);
  }, [filteredEntries, currentPage, isServerSidePagination, entries]);

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este movimiento?")) {
      onDelete(id);
    }
  };

  const handleViewDetail = (entry: Entry) => {
    setSelectedEntry(entry);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedEntry(null);
  };

  const handlePageChange = (newPage: number) => {
    if (isServerSidePagination && onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalCurrentPage(newPage);
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
      {/* Search and Filter - Only show for client-side pagination */}
      {!isServerSidePagination && (
        <div className="flex flex-col sm:flex-row gap-2 px-1">
          <Input
            placeholder="Buscar por descripción o método..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handlePageChange(1);
            }}
            className="flex-1"
          />
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Cargando...
        </div>
      )}

      {/* Table */}
      <Card className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b">
            <tr>
              {/* <th className="px-4 py-3 text-left font-semibold">Tipo</th> */}
              <th className="px-4 py-3 text-left font-semibold">Monto</th>
              <th className="px-4 py-3 text-left font-semibold">Fecha/Hora</th>
              <th className="px-4 py-3 text-left font-semibold">Método</th>
              <th className="px-4 py-3 text-left font-semibold">Descripción</th>
              <th className="px-4 py-3 text-left font-semibold">Creado por</th>
              <th className="px-4 py-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEntries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b hover:bg-muted/50 transition-colors"
              >
                {/* <td className="px-4 py-3">
                  <Badge
                    variant={
                      entry.type === "income" ? "default" : "destructive"
                    }
                    className="w-fit"
                  >
                    <ChevronsDown
                      className={`h-3 w-3 transition-transform duration-200 ${
                        entry.type === "income" ? "rotate-180" : "rotate-0"
                      }`}
                      aria-hidden="true"
                    />
                  </Badge>
                </td> */}
                <td
                  className={`px-4 py-3 font-semibold whitespace-nowrap ${
                    entry.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {entry.type === "income" ? "+" : "-"}
                  {formatCurrency(entry.amount)}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                  {formatDate(entry.date)}
                </td>
                <td className="px-4 py-3 text-sm ">
                  {getPaymentMethodLabel(entry.method)}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                  {entry.description || "-"}
                </td>
                <td className="px-4 py-3 text-sm capitalize text-muted-foreground">
                  {entry.user_email?.split("@")[0] || "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(entry)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
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
            {(currentPage - 1) * itemsPerPage + 1} a{" "}
            {Math.min(
              currentPage * itemsPerPage,
              isServerSidePagination ? totalEntries || 0 : filteredEntries.length
            )}{" "}
            de {isServerSidePagination ? totalEntries || 0 : filteredEntries.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="bg-transparent"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="bg-transparent"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <EntryDetailDialog
        entry={selectedEntry}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onUpdate={onUpdate}
      />
    </div>
  );
}
