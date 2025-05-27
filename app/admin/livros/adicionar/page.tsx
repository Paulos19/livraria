// app/admin/livros/adicionar/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner"; // Exemplo, se você usa shadcn/ui Sonner ou react-hot-toast

// Interface para o formulário, pode ser a mesma LivroSchema sem o ID
interface NewLivroForm {
  codigo?: string;
  livro: string; // Título é obrigatório
  autor?: string;
  valor?: string;
  categoria?: string;
}

export default function AdicionarLivroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewLivroForm>({
    livro: "", // Título
    autor: "",
    codigo: "",
    valor: "",
    categoria: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.livro) {
      setError("O título do livro é obrigatório.");
      toast.error("Erro de Validação", { description: "O título do livro é obrigatório." });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/livros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao adicionar livro: ${response.statusText}`);
      }

      toast.success("Livro adicionado com sucesso!");
      router.push('/admin/livros'); // Redireciona para a lista após sucesso
      // router.refresh(); // Se quiser forçar um refresh dos dados na página de listagem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      console.error(err);
      setError(errorMessage);
      toast.error("Falha ao adicionar livro", { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/livros">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Adicionar Novo Livro</h1>
      </div>

      <Card className="max-w-2xl mx-auto"> {/* Centraliza o card e limita a largura */}
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalhes do Livro</CardTitle>
            <CardDescription>Preencha as informações do novo livro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="livro">Título do Livro *</Label>
              <Input
                id="livro"
                name="livro"
                value={formData.livro}
                onChange={handleChange}
                placeholder="Ex: O Senhor dos Anéis"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="autor">Autor</Label>
                <Input
                  id="autor"
                  name="autor"
                  value={formData.autor}
                  onChange={handleChange}
                  placeholder="Ex: J.R.R. Tolkien"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo">Código (ISBN, SKU, etc.)</Label>
                <Input
                  id="codigo"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  placeholder="Ex: 978-3-16-148410-0"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor</Label>
                <Input
                  id="valor"
                  name="valor"
                  value={formData.valor}
                  onChange={handleChange}
                  placeholder="Ex: R$ 49,90 ou 49.90"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  placeholder="Ex: Fantasia"
                />
              </div>
            </div>
             {error && <p className="text-sm text-red-600 dark:text-red-500">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Livro"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}