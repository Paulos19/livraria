// app/livros/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, MessageSquareText, AlertTriangle, Info, Tag, User, BookText, Layers } from "lucide-react"; // Adicionado Info e outros ícones
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio"; // Para a imagem
import { toast } from "sonner";

// Interface para os dados do livro (deve corresponder ao seu schema Prisma)
interface LivroDetalhesSchema {
  id: string;
  livro?: string | null; // Título
  autor?: string | null;
  valor?: string | null;
  categoria?: string | null;
  codigo?: string | null; // ISBN ou código interno
  imagemCapa?: string | null;
  sinopse?: string | null; // Adicionando um campo para sinopse/descrição
  // Adicione outros campos que você queira exibir: editora, ano, numPaginas etc.
}

// Componente Skeleton para a página de detalhes
function DetalheLivroSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Skeleton className="h-8 w-32 mb-8" /> {/* Botão Voltar */}
      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        <div className="md:col-span-1">
          <Skeleton className="w-full aspect-[2/3] rounded-lg" />
        </div>
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-10 w-3/4" /> {/* Título */}
          <Skeleton className="h-6 w-1/2" /> {/* Autor */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" /> {/* Categoria Badge */}
          </div>
          <Skeleton className="h-20 w-full" /> {/* Sinopse */}
          <Skeleton className="h-10 w-32" /> {/* Preço */}
          <Skeleton className="h-12 w-48" /> {/* Botão WhatsApp */}
        </div>
      </div>
    </div>
  );
}


export default function PaginaDetalheLivro() {
  const params = useParams();
  const router = useRouter();
  const livroId = params.id as string;

  const [livro, setLivro] = useState<LivroDetalhesSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (livroId) {
      const fetchDetalhesLivro = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/livros/${livroId}`);
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error("Livro não encontrado.");
            }
            const errorData = await response.json();
            throw new Error(errorData.error || "Falha ao buscar detalhes do livro.");
          }
          const data: LivroDetalhesSchema = await response.json();
          setLivro(data);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
          console.error(errorMessage);
          setError(errorMessage);
          if (errorMessage === "Livro não encontrado.") {
            toast.error("Livro não encontrado", { description: "O livro que você está procurando não existe ou foi removido."});
            // Considerar redirecionar para uma página 404 ou para /livros
            // router.push('/livros');
          } else {
            toast.error("Erro ao carregar livro", { description: errorMessage});
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetalhesLivro();
    } else {
        // Se não houver livroId (improvável em uma rota dinâmica correta)
        setError("ID do livro inválido.");
        setIsLoading(false);
        toast.error("ID do livro inválido.");
        router.push('/livros'); // Redireciona se o ID for inválido
    }
  }, [livroId, router]);

  const handleWhatsAppRedirect = () => {
    if (!livro) return;
    const numeroWhatsApp = "5561986446934"; // Seu número de WhatsApp
    const mensagem = `Olá! Tenho interesse no livro "${livro.livro || 'este livro'}" (Código: ${livro.codigo}). Poderia me passar mais informações?`;
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(urlWhatsApp, '_blank');
  };

  if (isLoading) {
    return <DetalheLivroSkeleton />;
  }

  if (error && !livro) { // Se houve erro e nenhum livro foi carregado (ex: 404)
    return (
      <div className="container mx-auto px-4 py-12 text-center min-h-[calc(100vh-20rem)] flex flex-col justify-center items-center">
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <AlertTriangle className="w-20 h-20 text-destructive mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Livro Não Encontrado</h1>
            <p className="text-muted-foreground mb-6">{error === "Livro não encontrado." ? "O livro que você procura não existe ou foi removido." : error}</p>
            <Button onClick={() => router.push('/livros')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Loja
            </Button>
        </motion.div>
      </div>
    );
  }

  if (!livro) { // Fallback final se algo muito estranho acontecer
    return (
        <div className="container mx-auto px-4 py-12 text-center min-h-[calc(100vh-20rem)] flex flex-col justify-center items-center">
            <p>Não foi possível carregar os detalhes do livro.</p>
             <Button onClick={() => router.push('/livros')} variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Loja
            </Button>
        </div>
    );
  }

  const placeholderImage = "https://firebasestorage.googleapis.com/v0/b/gerador-2-c8519.appspot.com/o/uploads%2Fpexels-kassiamelox-15591238.jpg?alt=media&token=6187c6f1-69c3-4a9f-8dd2-82b45a85465f";

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Button variant="outline" onClick={() => router.back()} className="mb-8 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Button>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12 items-start">
        {/* Coluna da Imagem */}
        <motion.div
          className="md:col-span-1"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <AspectRatio ratio={2 / 3} className="bg-muted rounded-lg overflow-hidden shadow-lg">
            <Image
              src={livro.imagemCapa || placeholderImage}
              alt={`Capa do livro ${livro.livro}`}
              fill // Use fill para AspectRatio
              className="object-cover"
              priority // Prioriza o carregamento da imagem principal
            />
          </AspectRatio>
        </motion.div>

        {/* Coluna de Informações */}
        <motion.div
          className="md:col-span-2 space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          {livro.categoria && (
            <Badge variant="secondary" className="text-sm py-1 px-3">
                <Layers className="mr-1.5 h-4 w-4"/> {livro.categoria}
            </Badge>
          )}
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {livro.livro || "Título Indisponível"}
          </h1>

          {livro.autor && (
            <p className="text-xl text-muted-foreground flex items-center">
              <User className="mr-2 h-5 w-5 text-primary"/> Por: <span className="font-medium text-foreground ml-1">{livro.autor}</span>
            </p>
          )}

          {/* Seção de Sinopse/Descrição (adicione o campo 'sinopse' ao seu modelo Livro) */}
          {livro.sinopse ? (
            <div className="prose prose-sm sm:prose dark:prose-invert max-w-none text-muted-foreground">
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><BookText className="mr-2 h-5 w-5 text-primary"/> Sinopse</h3>
              <p>{livro.sinopse}</p>
            </div>
          ) : (
            <p className="text-muted-foreground italic">Nenhuma descrição detalhada disponível para este livro.</p>
          )}
          
          <Separator className="my-6" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {livro.valor ? (
              <p className="text-4xl font-bold text-primary">
                {livro.valor} {/* Formate o valor como moeda se necessário */}
              </p>
            ) : (
              <Badge variant="outline" className="text-base py-2 px-4">Preço Sob Consulta</Badge>
            )}

            <Button size="lg" onClick={handleWhatsAppRedirect} className="w-full sm:w-auto shadow-lg hover:shadow-primary/40 transition-shadow group">
              <MessageSquareText className="mr-2 h-5 w-5 group-hover:animate-bounce" />
              Tenho Interesse! (WhatsApp)
            </Button>
          </div>

          {/* Outras Informações */}
          <div className="pt-6 space-y-3 text-sm text-muted-foreground">
            {livro.codigo && (
                 <p className="flex items-center"><Tag className="mr-2 h-4 w-4 text-primary/80"/> <strong>Código/ISBN:</strong> {livro.codigo}</p>
            )}
            {/* Adicione mais campos aqui: Editora, Ano, Páginas, etc., se existirem no seu modelo */}
            {/* Ex:
            {livro.editora && <p><strong>Editora:</strong> {livro.editora}</p>}
            {livro.anoPublicacao && <p><strong>Ano de Publicação:</strong> {livro.anoPublicacao}</p>}
            */}
            <p className="flex items-center"><Info className="mr-2 h-4 w-4 text-primary/80"/> <span className="font-semibold mr-1">Disponibilidade:</span> Em estoque (Exemplo)</p>
          </div>
        </motion.div>
      </div>

      {/* Seção de Livros Relacionados (Opcional - Futuro) */}
      {/* <Separator className="my-12 md:my-16" />
      <section>
        <h2 className="text-2xl font-bold mb-6">Você também pode gostar</h2>
        //  Aqui você pode renderizar outro <BookCarouselSection /> com livros relacionados
      </section> */}
    </div>
  );
}