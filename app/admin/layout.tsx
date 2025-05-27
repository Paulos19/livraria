"use client"; 
import React from "react";
import Link from "next/link";
import { Toaster } from "sonner";
import { AdminSidebar } from "./components/sidebar";



export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen w-full bg-background"> 
      <AdminSidebar /> 
      <div className="flex flex-col flex-1 overflow-x-hidden"> 
        <header className="md:hidden sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-card px-6 z-10">
           
          <Link href="/admin" className="text-lg font-semibold">
            Livraria Admin
          </Link>
          
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/10 dark:bg-zinc-900/50">
          {children}
          <Toaster/>
        </main>
      </div>
    </div>
  );
}