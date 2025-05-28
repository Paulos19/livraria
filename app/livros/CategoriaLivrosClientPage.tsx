// components/livros/CategoriaLivrosClientPage.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from 'next/navigation'; // useRouter e usePathname podem não ser necessários aqui

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookCard, LivroSchema } from "../components/shared/BookCard";

interface PaginatedLivrosResponse {
  data: LivroSchema[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ITEMS_PER_PAGE_CATEGORIA = 24; // Ajuste conforme necessário

// Skeleton (pode ser o mesmo da Busca)
function BooksGridSkeleton() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
}

interface CategoriaLivrosClientPageProps {
  categorySlug: string; // O slug da categoria vindo dos parâmetros da rota
}

export default function CategoriaLivrosClientPage({ categorySlug }: CategoriaLivrosClientPageProps) {
  const router = useRouter();
  const pathname = usePathname(); // Usado para construir URLs de paginação
  const searchParams = useSearchParams(); // Para ler o parâmetro 'page'

  const [livros, setLivros] = useState<LivroSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Decodifica e capitaliza o nome da categoria para exibição
  const nomeCategoriaExibicao = categorySlug
    ? decodeURIComponent(categorySlug).replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase())
    : "Categoria Desconhecida";

  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLivrosPorCategoria = useCallback(async (pageToFetch: number, categoria: string) => {
    if (!categoria) {
        setLivros([]);
        setIsLoading(false);
        setApiError("Nome da categoria não fornecido.");
        return;
    }
    setIsLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', pageToFetch.toString());
      params.set('limit', ITEMS_PER_PAGE_CATEGORIA.toString());
      // A API /api/livros usa o parâmetro 'search' para filtrar.
      // Se a categoria tiver espaços, eles já foram substituídos por '-' no slug e decodificados aqui.
      // Para a API, pode ser melhor enviar o termo exato da categoria.
      params.set('search', decodeURIComponent(categoria));

      const response = await fetch(`/api/livros?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao buscar livros da categoria: ${response.statusText}`);
      }
      const result: PaginatedLivrosResponse = await response.json();
      setLivros(result.data);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const pageFromUrl = Number(searchParams.get('page')) || 1;
    fetchLivrosPorCategoria(pageFromUrl, categorySlug);
  }, [searchParams, categorySlug, fetchLivrosPorCategoria]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      // Para rotas dinâmicas, o pathname já inclui o slug.
      // Precisamos adicionar ou atualizar o parâmetro 'page'.
      const params = new URLSearchParams();
      params.set('page', newPage.toString());
      router.push(`${pathname}?${params.toString()}`, { scroll: true });
    }
  };

  const renderPaginationItems = () => {
    // (Mesma lógica de renderPaginationItems das outras páginas)
    const items = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(1, currentPage - halfPagesToShow);
    let endPage = Math.min(totalPages, currentPage + halfPagesToShow);
    if (currentPage <= halfPagesToShow) endPage = Math.min(totalPages, maxPagesToShow);
    if (currentPage + halfPagesToShow >= totalPages) startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    if (startPage > 1) {
        items.push(<PaginationItem key="1"><PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(1); }}>1</PaginationLink></PaginationItem>);
        if (startPage > 2) items.push(<PaginationItem key="ellipsis-start"><PaginationEllipsis /></PaginationItem>);
    }
    for (let i = startPage; i <= endPage; i++) items.push(<PaginationItem key={i}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(i); }} isActive={currentPage === i}>{i}</PaginationLink></PaginationItem>);
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) items.push(<PaginationItem key="ellipsis-end"><PaginationEllipsis /></PaginationItem>);
        items.push(<PaginationItem key={totalPages}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(totalPages); }}>{totalPages}</PaginationLink></PaginationItem>);
    }
    return items;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center mb-2">
          <Layers className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Categoria: {nomeCategoriaExibicao}
          </h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          {isLoading ? "Buscando livros..." : `${totalCount} livro(s) encontrado(s) nesta categoria.`}
        </p>
      </motion.div>

      {isLoading ? (
        <BooksGridSkeleton />
      ) : apiError ? (
        <div className="text-center py-10 text-destructive">
          <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
          <p className="text-xl">Erro ao buscar livros: {apiError}</p>
        </div>
      ) : livros.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8"
          variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence>
            {livros.map((livro, index) => (
              <BookCard key={livro.id} livro={livro} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-10 min-h-[300px] flex flex-col items-center justify-center">
          <Layers className="w-16 h-16 mb-4 text-muted-foreground/50" />
          <p className="text-xl font-semibold">Nenhum livro encontrado nesta categoria.</p>
          <p className="text-muted-foreground">
            Explore outras categorias ou veja todos os nossos livros.
          </p>
           <Button variant="outline" asChild className="mt-6">
            <Link href="/livros">Ver todos os livros</Link>
          </Button>
        </div>
      )}

      {!isLoading && !apiError && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}/>
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </motion.div>
      )}
    </div>
  );
}