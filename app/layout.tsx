import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider"; // Ajuste o caminho se necessário

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Seboso Livraria",
  description: "Sua livraria de tesouros usados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
