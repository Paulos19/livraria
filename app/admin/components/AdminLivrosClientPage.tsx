// components/admin/livros/AdminLivrosClientPage.tsx
"use client"; // Fundamental

import { useEffect, useState, useCallback, useMemo, FormEvent } from "react";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Edit, Trash2, PlusCircle, Filter as FilterIcon, Search as SearchIcon, AlertTriangle, XCircle, Save } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Interface do Livro (baseada no seu schema Prisma)
interface LivroSchema {
  id: string;
  codigo?: string | null;
  livro?: string | null; // Nome/Título
  autor?: string | null;
  valor?: string | null;
  categoria?: string | null;
}

interface PaginatedLivrosResponse {
  data: LivroSchema[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ITEMS_PER_PAGE_ADMIN = 15; // Um pouco mais para admin, ajuste conforme necessário

// Função de debounce
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
  return debounced as (...args: Parameters<F>) => void;
}

// Skeleton para a tabela
function AdminBooksTableSkeleton() {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(6)].map((_, i) => (
                  <TableHead key={i}><Skeleton className="h-5 w-20" /></TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
}


export default function AdminLivrosClientPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [livros, setLivros] = useState<LivroSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filtro
  const [filterModalSearchTerm, setFilterModalSearchTerm] = useState(searchParams.get('search') || '');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLivro, setEditingLivro] = useState<LivroSchema | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<LivroSchema>>({});
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Exclusão
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingLivroId, setDeletingLivroId] = useState<string | null>(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLivros = useCallback(async (pageToFetch: number, currentSearchQuery: string) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', pageToFetch.toString());
      params.set('limit', ITEMS_PER_PAGE_ADMIN.toString());
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
      setFilterModalSearchTerm(currentSearchQuery); // Sincroniza com a URL
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      console.error("Erro no fetchLivros (Admin):", err);
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const pageFromUrl = Number(searchParams.get('page')) || 1;
    const searchFromUrl = searchParams.get('search') || '';
    fetchLivros(pageFromUrl, searchFromUrl);
  }, [searchParams, fetchLivros]);

  const handleApplyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (filterModalSearchTerm.trim()) {
      params.set('search', filterModalSearchTerm.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setIsFilterModalOpen(false);
  };

  const handleClearFilter = () => {
    setFilterModalSearchTerm('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setIsFilterModalOpen(false);
  };

  const openEditModal = (livro: LivroSchema) => {
    setEditingLivro(livro);
    setEditFormData({
        id: livro.id,
        livro: livro.livro || '',
        autor: livro.autor || '',
        codigo: livro.codigo || '',
        categoria: livro.categoria || '',
        valor: livro.valor || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateLivro = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingLivro?.id) return;
    setIsSubmittingEdit(true);
    const dataToSend: Partial<Omit<LivroSchema, 'id'>> = {};
    (Object.keys(editFormData) as Array<keyof typeof editFormData>).forEach(key => {
        if (key === 'id') return;
        const value = editFormData[key];
        // @ts-ignore
        dataToSend[key] = value === '' ? null : value;
    });

    try {
      const response = await fetch(`/api/livros/${editingLivro.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Falha ao atualizar.');
      toast.success('Livro atualizado com sucesso!');
      setIsEditModalOpen(false);
      fetchLivros(currentPage, searchParams.get('search') || '');
    } catch (err) {
      toast.error('Erro ao atualizar', { description: (err as Error).message });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const openDeleteAlert = (id: string) => {
    setDeletingLivroId(id);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLivroId) return;
    try {
      const response = await fetch(`/api/livros/${deletingLivroId}`, { method: 'DELETE' });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Falha ao excluir.');
      }
      toast.success('Livro excluído com sucesso!');
      if (livros.length === 1 && currentPage > 1) {
        handlePageChange(currentPage - 1, true); // Passa true para forçar fetch
      } else {
        fetchLivros(currentPage, searchParams.get('search') || '');
      }
    } catch (err) {
      toast.error('Erro ao excluir', { description: (err as Error).message });
    } finally {
        setIsDeleteAlertOpen(false);
        setDeletingLivroId(null);
    }
  };

  const handlePageChange = (newPage: number, forceFetch = false) => {
    if (newPage >= 1 && (newPage <= totalPages || totalPages === 0) && (newPage !== currentPage || forceFetch)) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`${pathname}?${params.toString()}`, { scroll: true });
      // O useEffect [searchParams, fetchLivros] vai pegar a mudança e re-buscar
      // Se forceFetch for true, e a página for a mesma, o useEffect pode não disparar
      // se searchParams não mudar. Mas como estamos mudando a URL, ele deve disparar.
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

  const currentActiveSearch = searchParams.get('search');

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <h1 className="text-3xl font-bold tracking-tight">
          Gerenciar Livros <span className="text-muted-foreground text-xl">({totalCount})</span>
        </h1>
        <div className="flex items-center space-x-2">
          <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FilterIcon className="mr-2 h-4 w-4" />
                Filtrar
                {currentActiveSearch && <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{currentActiveSearch}</span>}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filtrar Livros</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  id="filterSearchTermAdmin"
                  placeholder="Buscar por título, autor, etc."
                  value={filterModalSearchTerm}
                  onChange={(e) => setFilterModalSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={handleClearFilter}><XCircle className="mr-2 h-4 w-4"/>Limpar</Button>
                <Button onClick={handleApplyFilter}>Aplicar Filtro</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button asChild>
            <Link href="/admin/livros/adicionar">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Livro
            </Link>
          </Button>
        </div>
      </motion.div>

      {isLoading && livros.length === 0 ? (
        <AdminBooksTableSkeleton />
      ) : apiError ? (
        <div className="text-center py-10 text-destructive">
          <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
          <p className="text-xl">Erro ao carregar livros: {apiError}</p>
          <Button variant="outline" onClick={() => fetchLivros(currentPage, searchParams.get('search') || '')} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      ) : livros.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden md:table-cell">Autor</TableHead>
                  <TableHead className="hidden lg:table-cell">Categoria</TableHead>
                  <TableHead className="hidden sm:table-cell">Código</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {livros.map((livro) => (
                  <TableRow key={livro.id}>
                    <TableCell className="font-medium max-w-[200px] truncate" title={livro.livro || ""}>{livro.livro || "N/A"}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[150px] truncate" title={livro.autor || ""}>{livro.autor || "N/A"}</TableCell>
                    <TableCell className="hidden lg:table-cell">{livro.categoria || "N/A"}</TableCell>
                    <TableCell className="hidden sm:table-cell">{livro.codigo || "N/A"}</TableCell>
                    <TableCell className="text-right space-x-1 sm:space-x-2">
                      <Button variant="outline" size="icon" onClick={() => openEditModal(livro)} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => openDeleteAlert(livro.id)} title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-10">
          <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-xl font-semibold">Nenhum livro encontrado.</p>
          <p className="text-muted-foreground">
            {currentActiveSearch ? `Nenhum resultado para "${currentActiveSearch}". Tente limpar o filtro.` : "Cadastre novos livros para começar."}
          </p>
        </div>
      )}

      {/* Modal de Edição */}
      {editingLivro && (
        <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => {
            setIsEditModalOpen(isOpen);
            if (!isOpen) setEditingLivro(null); // Limpa ao fechar
        }}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Editar Livro</DialogTitle>
              <DialogDescription>Atualize os detalhes do livro: <span className="font-semibold">{editingLivro.livro}</span></DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateLivro}>
              <div className="grid gap-4 py-4">
                {(Object.keys(editFormData) as Array<keyof typeof editFormData>)
                    .filter(key => key !== 'id') // Não mostra o campo ID
                    .map((key) => (
                  <div className="grid grid-cols-4 items-center gap-4" key={key}>
                    <Label htmlFor={`edit-${key}`} className="text-right capitalize">{key === 'livro' ? 'Título' : key}</Label>
                    <Input
                      id={`edit-${key}`}
                      name={key}
                      value={editFormData[key] || ''}
                      onChange={handleEditFormChange}
                      className="col-span-3"
                      required={key === 'livro'} // Título é obrigatório
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isSubmittingEdit}>
                  {isSubmittingEdit ? "Salvando..." : <><Save className="mr-2 h-4 w-4" /> Salvar</>}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Alerta de Exclusão */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o livro "{livros.find(l => l.id === deletingLivroId)?.livro || 'selecionado'}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingLivroId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!isLoading && !apiError && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-8 flex justify-center"
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