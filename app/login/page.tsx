"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button, Card, Input } from "pixel-retroui";
import { signIn } from "@/lib/auth-actions";

const loginSchema = z.object({
  email: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    const fullEmail = data.email.includes("@")
      ? data.email
      : `${data.email}@verduapp.com`;
    try {
      const result = await signIn(fullEmail, data.password);

      if (result?.error) {
        toast.error("Error", {
          description: "Usuario o contraseña incorrectos",
        });
        setIsSubmitting(false);
      }
      // If successful, redirect will happen and this won't be reached
    } catch (error) {
      // Only show error if it's not a redirect (Next.js throws on redirect)
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        // This is a successful redirect, don't show error
        throw error;
      }
      toast.error("Error", {
        description: "No se pudo iniciar sesión",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Verdu App</h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 flex flex-col"
        >
          {/* Email/Username */}
          <div className="space-y-2 flex flex-col">
            <label htmlFor="email" className="text-sm font-medium block">
              Usuario *
            </label>
            <Input
              id="email"
              type="text"
              placeholder="Ingresa tu usuario"
              {...register("email")}
              className="flex-1"
              autoComplete="username"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2 flex flex-col">
            <label htmlFor="password" className="text-sm font-medium block">
              Contraseña *
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              {...register("password")}
              className="flex-1"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            bg="lightgreen"
            disabled={isSubmitting}
            className="w-[94%] mx-auto mt-6"
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
