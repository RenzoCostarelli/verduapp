"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { dataService } from "@/lib/data-service";
import { getNowInArgentina, formatCurrency } from "@/lib/formatting";
import type { Entry, EntryType, PaymentMethod } from "@/lib/types";

// retroui
import {
  Button,
  Input,
  TextArea,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Card,
} from "pixel-retroui";

// ---- Schema ----
const entrySchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().gt(0, "El monto debe ser mayor a 0"),
  method: z.enum(["cash", "debit_card", "credit_card", "transfer", "other"]),
  description: z.string().optional(),
});

type FormInput = z.input<typeof entrySchema>;
type FormOutput = z.output<typeof entrySchema>;

interface EntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: Entry) => void;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  debit_card: "Tarjeta de Débito",
  credit_card: "Tarjeta de Crédito",
  transfer: "Transferencia",
  other: "Otro",
};

export function EntryForm({ onClose, onSubmit }: EntryFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountInput, setAmountInput] = useState<string>("");

  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    setValue,
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      type: "income",
      method: "cash",
    } as FormInput,
  });

  const entryType = watch("type");
  const method = watch("method");
  const amountValue = watch("amount");

  const handleAmountFocus = () => {
    if (typeof amountValue === "number") setAmountInput(String(amountValue));
  };

  const handleAmountChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    const raw = e.target.value;
    setAmountInput(raw);
    const parsed = Number.parseFloat(raw.replace(",", "."));
    if (!Number.isNaN(parsed)) {
      setValue("amount", parsed as unknown as FormInput["amount"], {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      setValue("amount", undefined as unknown as FormInput["amount"], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const formattedAmount = useMemo(() => {
    return typeof amountValue === "number" && amountValue > 0
      ? formatCurrency(amountValue)
      : "";
  }, [amountValue]);

  const onFormSubmit: SubmitHandler<FormOutput> = async (data) => {
    setIsSubmitting(true);
    try {
      const newEntry = await dataService.addEntry({
        type: data.type as EntryType,
        amount: data.amount,
        date: getNowInArgentina(),
        method: data.method as PaymentMethod,
        description: data.description || undefined,
      });

      toast.success("Éxito", {
        description: `${
          data.type === "income" ? "Ingreso" : "Gasto"
        } registrado correctamente`,
      });

      onSubmit(newEntry);
      reset({ type: "income", method: "cash" } as FormInput);
      setAmountInput("");
      onClose();
    } catch {
      toast.error("Error", {
        description: "No se pudo registrar el movimiento",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setValue("method", method, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setIsDropdownOpen(false);
  };

  return (
    <div className="max-w-[80vw]">
      <div className="mb-2">
        <h4 className="font-bold">Nuevo Movimiento</h4>
        <p className="text-sm text-neutral-700">
          Registra un ingreso o gasto en la caja
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className={isMobile ? "space-y-3" : "space-y-4"}
      >
        {/* Type Toggle */}
        <div className="flex gap-2">
          <Button
            type="button"
            bg={entryType === "income" ? "black" : ""}
            textColor={entryType === "income" ? "white" : ""}
            shadow={entryType === "income" ? "lightgray" : ""}
            onClick={() => setValue("type", "income", { shouldDirty: true })}
            className={
              entryType === "income"
                ? "bg-green-600 hover:bg-green-700 flex-1"
                : "flex-1"
            }
          >
            Ingreso
          </Button>
          <Button
            type="button"
            bg={entryType === "expense" ? "black" : ""}
            textColor={entryType === "expense" ? "white" : ""}
            shadow={entryType === "expense" ? "lightgray" : ""}
            onClick={() => setValue("type", "expense", { shouldDirty: true })}
            className={
              entryType === "expense"
                ? "bg-red-600 hover:bg-red-700 flex-1"
                : "flex-1"
            }
          >
            Gasto
          </Button>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Monto *</label>
          <Input
            type="text"
            placeholder="0,00"
            value={amountInput}
            onChange={handleAmountChange}
            onFocus={handleAmountFocus}
            className={`block ${isMobile ? "text-base" : "text-lg"}`}
            inputMode="decimal"
          />
          {errors.amount && (
            <p className="text-sm text-red-600">{errors.amount.message}</p>
          )}
          {formattedAmount && (
            <p className="text-xs text-muted-foreground">{formattedAmount}</p>
          )}
        </div>

        {/* Payment Method (RetroUI Dropdown) */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Método de Pago *</label>

          <div className="relative w-full">
            <Button
              type="button"
              className="w-[90%] mx-auto justify-between"
              onClick={() => setIsDropdownOpen((v) => !v)}
            >
              <span>
                {METHOD_LABELS[(method as PaymentMethod) ?? "cash"] ??
                  "Seleccionar"}
              </span>
              {!METHOD_LABELS[method as PaymentMethod] && (
                <span aria-hidden>▾</span>
              )}
            </Button>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2">
                <Card className="p-2">
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
                      className={`w-full justify-start ${
                        val === method ? "font-semibold underline" : ""
                      }`}
                      onClick={() => handlePaymentMethodSelect(val)}
                    >
                      {METHOD_LABELS[val]}
                    </div>
                  ))}
                </Card>
              </div>
            )}
          </div>

          {errors.method && (
            <p className="text-sm text-red-600">{errors.method.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex">
            Descripción (opcional)
          </label>
          <TextArea
            placeholder="Ej: Compra de verduras, Alquiler del local..."
            {...register("description")}
            className="resize-none flex"
            rows={isMobile ? 2 : 3}
          />
        </div>

        {/* Buttons */}
        <div className={`flex gap-2 ${isMobile ? "pt-2" : "pt-4"}`}>
          <Button type="button" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="submit"
            bg="lightgreen"
            disabled={isSubmitting}
            className="flex-1 "
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
