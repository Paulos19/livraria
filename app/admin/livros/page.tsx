// app/admin/livros/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Para o formulário de edição
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Para confirmação de exclusão
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Edit, Trash2, PlusCircle, Filter as FilterIcon, Search as SearchIcon, AlertTriangle, XCircle, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback, FormEvent } from "react"; // Adicionado FormEvent
import { toast } from "sonner";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface LivroSchema {
  id: string;
  codigo?: string | null;
  livro?: string | null;
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

const ITEMS_PER_PAGE = 10;

export default function ListarLivrosPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [livros, setLivros] = useState<LivroSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Estados para Filtro
  const [filterModalSearchTerm, setFilterModalSearchTerm] = useState(searchParams.get('search') || '');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Estados para Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLivro, setEditingLivro] = useState<LivroSchema | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<LivroSchema>>({}); // Campos do formulário de edição

  // Estados para Exclusão
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingLivroId, setDeletingLivroId] = useState<string | null>(null);


  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // Para formulário de edição


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
      setFilterModalSearchTerm(currentSearchQuery);

    } catch (err) {
      console.error("Erro no fetchLivros:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
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

  // --- Lógica de Filtro ---
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

  // --- Lógica de Edição ---
  const openEditModal = (livro: LivroSchema) => {
    setEditingLivro(livro);
    // Garante que todos os campos do schema estejam presentes, mesmo que vazios
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
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateLivro = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingLivro || !editingLivro.id) return;
    setIsSubmitting(true);

    // Prepara os dados para enviar, excluindo o ID do corpo e tratando campos vazios como null
    const dataToSend: Partial<Omit<LivroSchema, 'id'>> = {};
    (Object.keys(editFormData) as Array<keyof typeof editFormData>).forEach(key => {
        if (key === 'id') return; // Não envia ID no corpo
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
      if (!response.ok) {
        throw new Error(result.error || 'Falha ao atualizar o livro.');
      }
      toast.success('Livro atualizado com sucesso!');
      setIsEditModalOpen(false);
      setEditingLivro(null);
      // Re-busca os livros para refletir a atualização.
      // Poderia também atualizar o item específico no estado 'livros' para otimizar.
      fetchLivros(currentPage, searchParams.get('search') || '');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      console.error("Erro ao atualizar livro:", err);
      toast.error('Erro ao atualizar', { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Lógica de Exclusão ---
  const openDeleteAlert = (id: string) => {
    setDeletingLivroId(id);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLivroId) return;
    try {
      const response = await fetch(`/api/livros/${deletingLivroId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Falha ao excluir o livro.');
      }
      toast.success('Livro excluído com sucesso!');
      setIsDeleteAlertOpen(false);
      setDeletingLivroId(null);
      // Se o item excluído estava na última página e era o único, ajusta a página atual
      if (livros.length === 1 && currentPage > 1) {
        handlePageChange(currentPage - 1);
      } else {
        fetchLivros(currentPage, searchParams.get('search') || '');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      console.error("Erro ao excluir livro:", err);
      toast.error('Erro ao excluir', { description: errorMessage });
      setIsDeleteAlertOpen(false); // Fecha o alerta mesmo em caso de erro
    }
  };


  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
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

  const currentActiveSearch = searchParams.get('search');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold shrink-0">
          Livros Cadastrados <span className="text-muted-foreground text-xl">({totalCount})</span>
        </h1>
        <div className="w-full sm:w-auto flex items-center space-x-2">
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
                <DialogDescription>
                  Digite um termo para buscar por título, autor, código ou categoria.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="filterSearchTerm"
                    placeholder="Buscar livros..."
                    className="pl-8 w-full"
                    value={filterModalSearchTerm}
                    onChange={(e) => setFilterModalSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={handleClearFilter}>
                    <XCircle className="mr-2 h-4 w-4"/> Limpar Filtro
                </Button>
                <Button type="button" onClick={handleApplyFilter}>Aplicar Filtro</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button asChild className="shrink-0">
            <Link href="/admin/livros/adicionar">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
            </Link>
          </Button>
        </div>
      </div>

      {isLoading && <div className="text-center p-4 text-muted-foreground">Carregando livros...</div>}
      {!isLoading && apiError && livros.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-6 border rounded-md bg-destructive/10 text-destructive">
          <AlertTriangle className="w-12 h-12 mb-2" />
          <p className="font-semibold">Erro ao carregar os dados</p>
          <p className="text-sm">{apiError}</p>
          <Button variant="outline" size="sm" onClick={() => fetchLivros(currentPage, searchParams.get('search') || '')} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título (Livro)</TableHead>
                <TableHead className="hidden md:table-cell">Autor</TableHead>
                <TableHead className="hidden lg:table-cell">Categoria</TableHead>
                <TableHead className="hidden sm:table-cell">Código</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && !apiError && livros.length > 0 ? (
                livros.map((livro) => (
                  <TableRow key={livro.id}>
                    <TableCell className="font-medium">{livro.livro || "N/A"}</TableCell>
                    <TableCell className="hidden md:table-cell">{livro.autor || "N/A"}</TableCell>
                    <TableCell className="hidden lg:table-cell">{livro.categoria || "N/A"}</TableCell>
                    <TableCell className="hidden sm:table-cell">{livro.codigo || "N/A"}</TableCell>
                    <TableCell className="text-right">{livro.valor || "N/A"}</TableCell>
                    <TableCell className="text-right space-x-1 sm:space-x-2">
                      <Button variant="outline" size="icon" onClick={() => openEditModal(livro)} title="Editar">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => openDeleteAlert(livro.id)} title="Remover">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remover</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                !isLoading && !apiError && livros.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      {searchParams.get('search') ? `Nenhum livro encontrado para "${searchParams.get('search')}".` : "Nenhum livro cadastrado."}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      {editingLivro && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[480px]"> {/* Um pouco maior para o form */}
            <DialogHeader>
              <DialogTitle>Editar Livro</DialogTitle>
              <DialogDescription>
                Atualize os detalhes do livro: <span className="font-semibold">{editingLivro.livro}</span>
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateLivro}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-livro" className="text-right">Título</Label>
                  <Input id="edit-livro" name="livro" value={editFormData.livro || ''} onChange={handleEditFormChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-autor" className="text-right">Autor</Label>
                  <Input id="edit-autor" name="autor" value={editFormData.autor || ''} onChange={handleEditFormChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-codigo" className="text-right">Código</Label>
                  <Input id="edit-codigo" name="codigo" value={editFormData.codigo || ''} onChange={handleEditFormChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-categoria" className="text-right">Categoria</Label>
                  <Input id="edit-categoria" name="categoria" value={editFormData.categoria || ''} onChange={handleEditFormChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-valor" className="text-right">Valor</Label>
                  <Input id="edit-valor" name="valor" value={editFormData.valor || ''} onChange={handleEditFormChange} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>}
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
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o livro do banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingLivroId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, excluir livro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {!isLoading && !apiError && totalPages > 1 && (
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
      )}
    </div>
  );
}