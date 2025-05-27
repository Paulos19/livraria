// components/admin/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, BookOpen, PlusSquare, Settings, LayoutDashboard, X } from "lucide-react";
import { cn } from "@/lib/utils"; // shadcn/ui utility for conditional classes
import React from "react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  // Adicione quaisquer props personalizadas se necessário
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/livros", label: "Listar Livros", icon: BookOpen },
  { href: "/admin/livros/adicionar", label: "Adicionar Livro", icon: PlusSquare },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminSidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = React.useState(true);

  const NavLink = ({ href, label, icon: Icon }: typeof navItems[0]) => (
    <Link href={href}  passHref>
      <Button
        variant={pathname === href ? "secondary" : "ghost"}
        className="w-full justify-start"
      >
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </Link>
  );

  const sidebarContent = (
    <div className="flex flex-col space-y-2 p-4">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Admin
      </h2>
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Sidebar para Desktop (Retrátil) */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-muted/40 transition-all duration-300 ease-in-out",
          isDesktopSidebarOpen ? "w-64" : "w-20",
          className
        )}
      >
        <div className="flex h-16 items-center border-b px-6 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          {isDesktopSidebarOpen && <h1 className="ml-2 text-lg font-semibold">Livraria Admin</h1>}
        </div>
        <div className={cn("flex-1 overflow-y-auto", !isDesktopSidebarOpen && "flex flex-col items-center py-4")}>
          <nav className={cn("grid gap-2 px-4 py-4", !isDesktopSidebarOpen && "space-y-2")}>
            {navItems.map((item) => (
              <Link href={item.href} key={item.href} passHref>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", !isDesktopSidebarOpen && "justify-center w-12 h-12")}
                  title={item.label}
                >
                  <item.icon className={cn("h-5 w-5", isDesktopSidebarOpen && "mr-2")}/>
                  {isDesktopSidebarOpen && <span>{item.label}</span>}
                  {!isDesktopSidebarOpen && <span className="sr-only">{item.label}</span>}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Botão para abrir Sidebar em Mobile (usando Sheet) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0 pt-8 bg-background">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}