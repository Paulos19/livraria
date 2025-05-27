"use client";

export const dynamic = 'force-dynamic';

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; 
import { Search as SearchIcon, AlertTriangle, ListFilter, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { BookCard, LivroSchema } from "../components/shared/BookCard";

interface PaginatedLivrosResponse {
  data: LivroSchema[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 48; 

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
  return debounced as (...args: Parameters<F>) => void;
}

function BooksGridSkeleton() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {[...Array(12)].map((_, i) => ( 
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-1/3 mt-2" />
          </div>
        ))}
      </div>
    );
}


export default function TodosLivrosPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [livros, setLivros] = useState<LivroSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [localSearchTerm, setLocalSearchTerm] = useState(searchParams.get('search') || '');

  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLivros = useCallback(async (pageToFetch: number, currentSearchQuery: string) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', pageToFetch.toString());
      params.set('limit', ITEMS_PER_PAGE.toString());
      if (currentSearchQuery) {
        params.set('search', currentSearchQuery);
      }

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
      setLocalSearchTerm(currentSearchQuery); 

    } catch (err) {
      console.error("Erro no fetchLivros:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedUpdateUrlQuery = useMemo(() =>
    debounce((newSearchTerm: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newSearchTerm.trim()) {
        params.set('search', newSearchTerm.trim());
      } else {
        params.delete('search');
      }
      params.set('page', '1'); 
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 500),
  [pathname, router, searchParams]);

  useEffect(() => {
    const pageFromUrl = Number(searchParams.get('page')) || 1;
    const searchFromUrl = searchParams.get('search') || '';
    if (searchFromUrl !== localSearchTerm) {
        setLocalSearchTerm(searchFromUrl);
    }
    fetchLivros(pageFromUrl, searchFromUrl);
  }, [searchParams, fetchLivros]); 

  const handleLocalSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setLocalSearchTerm(newSearchTerm);
    debouncedUpdateUrlQuery(newSearchTerm);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`${pathname}?${params.toString()}`, { scroll: true }); 
    }
  };

  const renderPaginationItems = () => {
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
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Nossa Coleção Completa
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore todos os universos que temos a oferecer. Use o filtro para encontrar exatamente o que procura.
        </p>
      </motion.div>

      {}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-lg bg-card"
      >
        <div className="relative w-full sm:max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por título, autor, categoria..."
            className="pl-10 h-10 text-base" 
            value={localSearchTerm}
            onChange={handleLocalSearchChange}
          />
          {localSearchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={handleClearSearch}
              aria-label="Limpar busca"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {isLoading ? "Carregando..." : (
            totalCount > 0 ? `${totalCount} livro(s) encontrado(s)` : "Nenhum livro encontrado."
          )}
        </div>
        {}
        {}
      </motion.div>

      {}
      {isLoading ? (
        <BooksGridSkeleton />
      ) : apiError ? (
        <div className="flex flex-col items-center justify-center text-center p-10 border rounded-md bg-destructive/10 text-destructive min-h-[300px]">
          <AlertTriangle className="w-12 h-12 mb-4" />
          <p className="text-xl font-semibold">Oops! Algo deu errado.</p>
          <p className="text-sm mb-4">{apiError}</p>
          <Button variant="outline" onClick={() => fetchLivros(currentPage, localSearchTerm)}>
            Tentar Novamente
          </Button>
        </div>
      ) : livros.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-8"
          initial="initial"
          animate="animate"
          variants={{
            initial: {},
            animate: { transition: { staggerChildren: 0.05 } },
          }}
        >
          <AnimatePresence>
            {livros.map((livro, index) => (
                <BookCard key={livro.id} livro={livro} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-10 min-h-[300px] flex flex-col items-center justify-center">
          <SearchIcon className="w-16 h-16 mb-4 text-muted-foreground/50" />
          <p className="text-xl font-semibold">Nenhum livro encontrado.</p>
          <p className="text-muted-foreground">
            Tente ajustar sua busca ou explore nossas categorias.
          </p>
          {localSearchTerm && (
            <Button variant="outline" onClick={handleClearSearch} className="mt-4">
              Limpar Busca
            </Button>
          )}
        </div>
      )}

      {}
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
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </motion.div>
      )}
    </div>
  );
}