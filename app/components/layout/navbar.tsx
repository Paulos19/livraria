// components/layout/navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  UserCircle,
  ChevronDown,
  Search as SearchIcon,
  ShieldCheck,
  Menu as MenuIcon,
  BookMarked,
  Store,
} from "lucide-react";

// Tipos e Subcomponentes (Logo, UserNav) - Mantidos como na sua versão
interface UserProfileProps {
  userName?: string | null;
  userImage?: string | null;
  userRole?: string | null;
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group mr-6">
      <BookMarked className="h-7 w-7 text-primary transition-transform group-hover:rotate-[-15deg] group-hover:scale-110 duration-300" />
      <span className="text-xl font-bold tracking-tight">
        <span className="text-primary">Seboso</span>{" "}
        <span className="text-muted-foreground group-hover:text-foreground transition-colors">| Livraria</span>
      </span>
    </Link>
  );
}

function UserNav({ userName, userImage, userRole }: UserProfileProps) {
  const { status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-muted"></div>;
  }

  if (status === "unauthenticated") {
    return (
      <Link href="/auth/signin" className={cn(buttonVariants({ variant: "outline" }), "whitespace-nowrap")}>
        Entrar
      </Link>
    );
  }

  const getAvatarFallback = (name?: string | null) => {
    if (!name) return <UserCircle className="h-5 w-5" />;
    const parts = name.split(" ");
    if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name?.substring(0, 2).toUpperCase() || <UserCircle className="h-5 w-5"/>;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={userImage || undefined} alt={userName || "Usuário"} />
            <AvatarFallback>{getAvatarFallback(userName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName || "Usuário"}</p>
            {userRole && <p className="text-xs leading-none text-muted-foreground">({userRole})</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="w-full flex items-center cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Meu Painel</span>
            </Link>
          </DropdownMenuItem>
          {userRole === "ADMIN" && (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="w-full flex items-center cursor-pointer">
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Painel Admin</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/admin/configuracoes" className="w-full flex items-center cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Modal de Busca ATUALIZADO
function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter(); // Hook para navegação

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Redireciona para a página de resultados de busca
      router.push(`/livros/busca?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsOpen(false); // Fecha o modal
      setSearchTerm(""); // Limpa o campo
    } else {
      toast.info("Por favor, insira um termo para buscar.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Buscar livros">
          <SearchIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buscar Livros</DialogTitle>
          <DialogDescription>
            Encontre livros por título, autor, código, categoria ou preço.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSearch} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="search-term-modal-navbar" className="sr-only">Termo de Busca</Label>
            <Input
              id="search-term-modal-navbar"
              placeholder="Buscar por..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus // Adicionado para focar no input ao abrir
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit">Buscar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Componente Principal da Navbar
export function MainNavbar() {
  const { data: session } = useSession();
  const [categorias, setCategorias] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch('/api/categorias');
        if (!response.ok) {
            console.error('Falha ao buscar categorias da API');
            return;
        };
        const data: string[] = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error("Erro de rede ou parsing ao buscar categorias:", error);
      }
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navLinks = [
    { href: "/livros", label: "Todos os Livros", icon: Store },
  ];

  const mobileMenuItems = (
    <>
      {navLinks.map((link) => (
        <DropdownMenuItem key={link.href} asChild className="cursor-pointer">
          <Link href={link.href} className="w-full flex items-center">
            {link.icon && <link.icon className="mr-2 h-4 w-4" />}
            {link.label}
          </Link>
        </DropdownMenuItem>
      ))}

      {categorias.length > 0 && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            {/* Ícone para Categorias no Mobile, se desejar */}
            {/* <Layers className="mr-2 h-4 w-4" /> */}
            <span>Categorias</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
              {categorias.map((categoria) => (
                <DropdownMenuItem key={categoria} asChild className="cursor-pointer">
                  <Link href={`/livros/categoria/${encodeURIComponent(categoria.toLowerCase().replace(/\s+/g, '-'))}`} className="w-full">
                    {categoria}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      )}
      <DropdownMenuSeparator />
      {session?.user && ( // Mostrar apenas se estiver logado
        <>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard" className="w-full flex items-center">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Meu Painel</span>
            </Link>
          </DropdownMenuItem>
          {(session.user as any)?.role === "ADMIN" && (
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin" className="w-full flex items-center">
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Painel Admin</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/admin/configuracoes" className="w-full flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="text-red-500 hover:!text-red-500 focus:!text-red-500 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </>
      )}
      {!session?.user && ( // Mostrar Entrar se não estiver logado
         <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/auth/signin" className="w-full flex items-center">
              <LogOut className="mr-2 h-4 w-4" /> {/* Ou um ícone de Login */}
              <span>Entrar</span>
            </Link>
          </DropdownMenuItem>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                buttonVariants({variant: "ghost"}),
                "text-sm font-medium",
                pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
               {link.icon && <link.icon className="mr-2 h-4 w-4" />}
              {link.label}
            </Link>
          ))}
          {categorias.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary data-[state=open]:text-primary group">
                  Categorias <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-h-80 overflow-y-auto">
                <DropdownMenuLabel>Navegar por Categoria</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categorias.map((categoria) => (
                  <DropdownMenuItem key={categoria} asChild className="cursor-pointer">
                    {/* ATUALIZADO: Normaliza o slug da categoria */}
                    <Link href={`/livros/categoria/${encodeURIComponent(categoria.toLowerCase().replace(/\s+/g, '-'))}`} className="w-full">
                      {categoria}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <SearchModal /> {/* O modal de busca */}
          <UserNav userName={session?.user?.name} userImage={session?.user?.image} userRole={(session?.user as any)?.role} />
        </nav>
        <div className="flex items-center md:hidden">
          <SearchModal /> {/* O modal de busca para mobile */}
          <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menu" className="ml-2">
                    <MenuIcon className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 mt-1 p-2"> {/* Aumentado w-64 e adicionado p-2 */}
                {mobileMenuItems}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}