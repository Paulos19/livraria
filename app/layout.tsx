// app/layout.tsx
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AuthProvider from "./components/AuthProvider";
import { ThemeProvider } from "./components/theme-provider";
import { MainNavbar } from "./components/layout/navbar";
import { Toaster } from "sonner";
import { MainFooter } from "./components/layout/footer";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Seboso | Livraria",
  description: "Sua livraria online de confiança.",
  // Adicione mais metadados conforme necessário
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          "font-sans",
          fontSans.variable
        )}
      >
        <AuthProvider> {/* Envolve com AuthProvider para acesso à sessão */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system" // Ou "dark" / "light" como padrão
            enableSystem
            disableTransitionOnChange
          >
            <MainNavbar /> {/* Adicione a Navbar aqui */}
            <main> {/* Adiciona padding ao conteúdo principal */}
              {children}
            </main>
            <MainFooter/>
            <Toaster richColors position="top-right" /> {/* Posição do Toaster */}
            {/* Você pode adicionar um Footer aqui se desejar */}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}