// app/admin/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCopy, Layers3, ShoppingBasket, AlertTriangle } from "lucide-react"; // Ícones
import { useEffect, useState } from "react";
import { toast } from "sonner"; // Para notificações

// Interface para os dados que você espera da API de estatísticas
interface AdminStats {
  totalLivros: number;
  totalCategorias: number;
  totalPedidosReservados: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdminStats() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Falha ao buscar estatísticas: ${response.statusText}`);
        }
        const data: AdminStats = await response.json();
        setStats(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
        console.error("Erro ao carregar estatísticas do admin:", err);
        setError(errorMessage);
        toast.error("Erro ao carregar estatísticas", { description: errorMessage });
      } finally {
        setIsLoading(false);
      }
    }
    fetchAdminStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-6">
            <AlertTriangle className="w-16 h-16 mb-4 text-destructive" />
            <h2 className="text-2xl font-semibold mb-2">Erro ao Carregar Estatísticas</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
                Tentar Novamente
            </Button>
        </div>
    );
  }

  if (!stats) { // Caso não haja erro mas stats ainda é null (pouco provável se isLoading é false)
    return <div className="text-center p-4 text-muted-foreground">Nenhuma estatística disponível.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Principal</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Livros Cadastrados
            </CardTitle>
            <BookCopy className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalLivros}</div>
            <p className="text-xs text-muted-foreground">
              Total de livros no sistema
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias Únicas</CardTitle>
            <Layers3 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCategorias}</div>
            <p className="text-xs text-muted-foreground">
              Total de categorias distintas de livros
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Reservados</CardTitle>
            <ShoppingBasket className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPedidosReservados}</div>
            <p className="text-xs text-muted-foreground">
              {/* Ajuste esta descrição se a sua definição de "reservado" for diferente */}
              Pedidos aguardando processamento ou confirmação
            </p>
          </CardContent>
        </Card>
        {/* Você pode adicionar mais cards para outras estatísticas aqui */}
      </div>
      {/* Outras seções do dashboard, como gráficos ou tabelas de resumo, podem vir aqui */}
    </div>
  );
}