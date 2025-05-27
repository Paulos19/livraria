// app/admin/configuracoes/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner"; // Ou sua biblioteca de toast preferida
import { User, UploadCloud, AlertCircle } from "lucide-react"; // Ícones
import { useRouter } from "next/navigation";

export default function ConfiguracoesPage() {
  const { data: session, status, update: updateSession } = useSession(); // update para atualizar a sessão cliente
  const [name, setName] = useState("");
  const [image, setImage] = useState(""); // URL da imagem
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const getAvatarFallback = (name?: string | null) => {
    if (!name) return <User className="h-5 w-5" />;
    const parts = name.split(" ");
    if (parts.length > 1) {
      return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!name.trim()) {
        toast.error("O nome não pode estar vazio.");
        setIsSubmitting(false);
        return;
    }
    if (image.trim() && !image.trim().match(/^https?:\/\/.+/)) {
        toast.error("URL da imagem inválida. Deve começar com http:// ou https://");
        setIsSubmitting(false);
        return;
    }


    try {
      const response = await fetch('/api/account/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), image: image.trim() || null }), // Envia null se a imagem estiver vazia para limpar
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Falha ao atualizar perfil.');
      }

      toast.success('Perfil atualizado com sucesso!');
      // Atualiza a sessão do NextAuth no lado do cliente para refletir as mudanças
      // Isso pode ou não atualizar o token JWT dependendo da sua configuração do NextAuth
      // Para uma atualização completa do token, um novo login ou uma chamada específica ao backend podem ser necessários.
      // A forma mais simples de ver a mudança é se o useSession() buscar os dados novamente.
      await updateSession({ name: result.user.name, image: result.user.image });

      // Opcional: Redirecionar ou apenas mostrar o toast.
      // router.refresh(); // Se quiser forçar um refresh completo da página (pode ser desnecessário)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      console.error(err);
      setError(errorMessage);
      toast.error('Erro ao atualizar', { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Carregando dados do usuário...</div>;
  }

  if (!session) {
    // Idealmente, o middleware já deveria redirecionar, mas como fallback:
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-6">
            <AlertCircle className="w-12 h-12 mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground mb-4">Você precisa estar logado para acessar esta página.</p>
            <Button onClick={() => router.push('/auth/signin')}>Fazer Login</Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configurações do Perfil</h1>
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Editar Perfil</CardTitle>
            <CardDescription>Atualize seu nome e foto de perfil.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={image || undefined} alt={name || "Usuário"} />
                <AvatarFallback className="text-2xl">
                    {getAvatarFallback(name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1.5 flex-1">
                <Label htmlFor="image">URL da Foto de Perfil</Label>
                <div className="relative">
                    <UploadCloud className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                    id="image"
                    type="url"
                    placeholder="https://exemplo.com/sua-foto.jpg"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="pl-8"
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                  Insira a URL completa da sua nova imagem de perfil.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="cursor-not-allowed bg-muted/50"
              />
               <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado por aqui.
                </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}