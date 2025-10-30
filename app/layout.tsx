import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import "@/lib/pixel-retroui-setup.js";

export const metadata: Metadata = {
  title: "El mercadino - Verdu App",
  description: "Gestión de caja para el mercadito",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
