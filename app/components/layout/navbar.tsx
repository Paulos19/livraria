// components/layout/navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Removido useSearchParams se não usado diretamente aqui
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
  // DropdownMenuSub, // Removido se não usado
  // DropdownMenuSubContent, // Removido se não usado
  // DropdownMenuSubTrigger, // Removido se não usado
  // DropdownMenuPortal // Removido se não usado
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
import { Label } from "@/components/ui/label"; // Necessário para o SearchModal
import { toast } from "sonner"; // Adicionado import do toast
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  UserCircle,
  // BookOpen, // Removido se não usado diretamente nos links principais
  ChevronDown,
  Search as SearchIcon,
  ShieldCheck,
  Menu as MenuIcon,
  BookMarked,
  Store,
} from "lucide-react";

interface UserProfileProps {
  userName?: string | null;
  userImage?: string | null;
  userRole?: string | null;
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group mr-6"> {/* Adicionado mr-6 */}
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
            {/* O email pode ser adicionado aqui se desejado */}
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

function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Redireciona para uma página de busca. Crie essa página depois.
      router.push(`/livros/busca?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsOpen(false);
      setSearchTerm("");
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
            Encontre livros por título, autor, código (ISBN) ou categoria.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSearch} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="search-term-modal" className="sr-only">Termo de Busca</Label>
            <Input
              id="search-term-modal"
              placeholder="Buscar por..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            // toast.error("Erro ao carregar categorias."); // Opcional
            return;
        };
        const data: string[] = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error("Erro de rede ou parsing ao buscar categorias:", error);
        // toast.error("Erro ao carregar categorias."); // Opcional
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

  // Itens para o menu mobile (incluindo os de usuário)
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
            <ChevronDown className="mr-2 h-4 w-4" /> {/* Ou outro ícone de categoria */}
            <span>Categorias</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
              {categorias.map((categoria) => (
                <DropdownMenuItem key={categoria} asChild className="cursor-pointer">
                  <Link href={`/livros/categoria/${encodeURIComponent(categoria.toLowerCase())}`} className="w-full">
                    {categoria}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild className="cursor-pointer">
        <Link href="/dashboard" className="w-full flex items-center">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span>Meu Painel</span>
        </Link>
      </DropdownMenuItem>
      {(session?.user as any)?.role === "ADMIN" && ( // Use session.user.role se a tipagem estiver correta
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
  );


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between"> {/* Alterado para justify-between */}
        <Logo />

        {/* Navegação Desktop */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2"> {/* Reduzido gap */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                buttonVariants({variant: "ghost"}), // Usa buttonVariants para consistência
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
                <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary data-[state=open]:text-primary">
                  Categorias <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-h-80 overflow-y-auto">
                <DropdownMenuLabel>Navegar por Categoria</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categorias.map((categoria) => (
                  <DropdownMenuItem key={categoria} asChild className="cursor-pointer">
                    <Link href={`/livros/categoria/${encodeURIComponent(categoria.toLowerCase())}`} className="w-full">
                      {categoria}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <SearchModal />
          <UserNav userName={session?.user?.name} userImage={session?.user?.image} userRole={(session?.user as any)?.role} />
        </nav>

        {/* Menu Mobile (apenas o gatilho do dropdown) */}
        <div className="flex items-center md:hidden">
          <SearchModal /> {/* Mantém a busca acessível */}
          {/* UserNav já lida com o estado de autenticação e pode ser mostrado aqui também ou dentro do dropdown mobile */}
          {/* <UserNav userName={session?.user?.name} userImage={session?.user?.image} userRole={(session?.user as any)?.role} /> */}
          <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Abrir menu"
                    className="ml-2" // Adicionado ml-2
                >
                    <MenuIcon className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1"> {/* Conteúdo do menu mobile */}
                {mobileMenuItems}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}