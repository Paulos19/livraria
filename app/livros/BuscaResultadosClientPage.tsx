// components/livros/BuscaResultadosClientPage.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
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
import { Search as SearchIcon, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BookCard, LivroSchema } from "../components/shared/BookCard";
import { Button } from "@/components/ui/button";


interface PaginatedLivrosResponse {
  data: LivroSchema[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ITEMS_PER_PAGE_BUSCA = 24; // Ajuste conforme necessário

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

export default function BuscaResultadosClientPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [livros, setLivros] = useState<LivroSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const searchTermQuery = searchParams.get('q') || ''; // Parâmetro 'q' da URL
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLivrosBuscados = useCallback(async (pageToFetch: number, currentSearchTerm: string) => {
    if (!currentSearchTerm) {
      setLivros([]);
      setTotalCount(0);
      setTotalPages(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', pageToFetch.toString());
      params.set('limit', ITEMS_PER_PAGE_BUSCA.toString());
      params.set('search', currentSearchTerm); // Usa o termo de busca na API

      const response = await fetch(`/api/livros?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao buscar livros: ${response.statusText}`);
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
    const queryFromUrl = searchParams.get('q') || '';
    fetchLivrosBuscados(pageFromUrl, queryFromUrl);
  }, [searchParams, fetchLivrosBuscados]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      // 'q' já está em searchParams
      router.push(`${pathname}?${params.toString()}`, { scroll: true });
    }
  };

  const renderPaginationItems = () => {
    // (Mesma lógica de renderPaginationItems da página /livros pública)
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
        {searchTermQuery ? (
          <>
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Resultados da Busca por: <span className="text-primary">{searchTermQuery}</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isLoading ? "Buscando livros..." : `${totalCount} livro(s) encontrado(s).`}
            </p>
          </>
        ) : (
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Busca de Livros
          </h1>
        )}
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
          initial="initial" // Definido para que variants funcione corretamente
          animate="animate"
        >
          <AnimatePresence>
            {livros.map((livro, index) => (
              <BookCard key={livro.id} livro={livro} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : searchTermQuery ? (
        <div className="text-center py-10 min-h-[300px] flex flex-col items-center justify-center">
          <SearchIcon className="w-16 h-16 mb-4 text-muted-foreground/50" />
          <p className="text-xl font-semibold">Nenhum livro encontrado para "{searchTermQuery}".</p>
          <p className="text-muted-foreground">
            Tente uma busca diferente ou explore nossas categorias.
          </p>
          <Button variant="outline" asChild className="mt-6">
            <Link href="/livros">Ver todos os livros</Link>
          </Button>
        </div>
      ) : (
         <div className="text-center py-10 min-h-[300px] flex flex-col items-center justify-center">
            <SearchIcon className="w-16 h-16 mb-4 text-muted-foreground/50" />
            <p className="text-xl font-semibold">Use a busca na barra de navegação.</p>
            <p className="text-muted-foreground">
                Ou explore todos os nossos livros.
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
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined} />
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