"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { dataService } from "@/lib/data-service";
import {
  formatDateOnly,
  getNowInArgentina,
  formatCurrency,
} from "@/lib/formatting";
import type { Entry, EntryType, PaymentMethod } from "@/lib/types";

// ---- Schema ----
const entrySchema = z.object({
  type: z.enum(["income", "expense"]),
  // coerce lets the resolver accept string/unknown and output a number
  amount: z.coerce.number().gt(0, "El monto debe ser mayor a 0"),
  method: z.enum(["cash", "debit_card", "credit_card", "transfer", "other"]),
  description: z.string().optional(),
});

// Types aligned with Zod transform flow:
type FormInput = z.input<typeof entrySchema>; // { amount: unknown; ... }
type FormOutput = z.output<typeof entrySchema>; // { amount: number;  ... }

interface EntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: Entry) => void;
}

export function EntryFormModal({
  isOpen,
  onClose,
  onSubmit,
}: EntryFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountInput, setAmountInput] = useState<string>("");

  // lazy initial to avoid setState-in-effect on first render
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Key: provide both generics to useForm: <TFieldValues, TContext, TTransformedValues>
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
      // amount intentionally omitted; we set it via setValue as user types
    } as FormInput,
  });

  const entryType = watch("type");
  const method = watch("method");
  const amountValue = watch("amount"); // unknown pre-transform (FormInput)

  const handleAmountFocus = () => {
    // if we already parsed a valid number earlier, reflect it in the text field
    if (typeof amountValue === "number") {
      setAmountInput(String(amountValue));
    }
  };

  const handleAmountChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    const raw = e.target.value;
    setAmountInput(raw);
    const parsed = Number.parseFloat(raw.replace(",", "."));
    if (!Number.isNaN(parsed)) {
      // write a number into the form; Zod will accept it (coerce), RHF keeps input type flexible
      setValue("amount", parsed as unknown as FormInput["amount"], {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      // clear/unknown until valid
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

  // Submit handler receives the transformed output type (FormOutput)
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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className={`${
          isMobile
            ? "w-full h-screen max-w-none rounded-none"
            : "sm:max-w-[425px]"
        }`}
      >
        <DialogHeader>
          <DialogTitle>Nuevo Movimiento</DialogTitle>
          <DialogDescription>
            Registra un ingreso o gasto en la caja
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className={`${isMobile ? "space-y-3" : "space-y-4"}`}
        >
          {/* Type Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={entryType === "income" ? "default" : "outline"}
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
              variant={entryType === "expense" ? "default" : "outline"}
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
              className={`${isMobile ? "text-base" : "text-lg"}`}
              inputMode="decimal"
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount.message}</p>
            )}
            {formattedAmount && (
              <p className="text-xs text-muted-foreground">{formattedAmount}</p>
            )}
          </div>

          {/* Date (Read-only) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha</label>
            <div className="px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground">
              {formatDateOnly(getNowInArgentina())}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Método de Pago *</label>
            <Select
              value={method}
              onValueChange={(value) =>
                setValue("method", value as PaymentMethod, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="debit_card">Tarjeta de Débito</SelectItem>
                <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
            {errors.method && (
              <p className="text-sm text-red-600">{errors.method.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Descripción (opcional)
            </label>
            <Textarea
              placeholder="Ej: Compra de verduras, Alquiler del local..."
              {...register("description")}
              className="resize-none"
              rows={isMobile ? 2 : 3}
            />
          </div>

          {/* Buttons */}
          <div className={`flex gap-2 ${isMobile ? "pt-2" : "pt-4"}`}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
