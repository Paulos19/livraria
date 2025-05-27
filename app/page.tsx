"use client"; 

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton"; 
import { LivroSchema } from "./components/shared/BookCard";
import { HeroSection } from "./components/homepage/HeroSection";
import { BookCarouselSection } from "./components/homepage/BookCarouselSection";
import { FAQSection } from "./components/homepage/FAQSection";

function BookCarouselSkeleton() {
    return (
      <div className="space-y-8">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-9 w-1/3" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-flow-col auto-cols-[250px] sm:auto-cols-[280px] md:auto-cols-[300px] gap-6 overflow-x-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-[375px] w-full sm:h-[420px] md:h-[450px]" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/3 mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

export default function HomePage() {
  const [livrosNovidades, setLivrosNovidades] = useState<LivroSchema[]>([]);
  const [livrosFiccao, setLivrosFiccao] = useState<LivroSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllBooksData = async () => {
      setIsLoading(true);
      try {
        const responseNovidades = await fetch('/api/livros?page=1&limit=10&sortBy=createdAt&order=desc'); 
        if (!responseNovidades.ok) throw new Error('Falha ao buscar novidades');
        const dataNovidades = await responseNovidades.json();
        setLivrosNovidades(dataNovidades.data || []);

        const responseFiccao = await fetch('/api/livros?page=1&limit=10&search=Ficção'); 
        if (!responseFiccao.ok) throw new Error('Falha ao buscar ficção');
        const dataFiccao = await responseFiccao.json();
        setLivrosFiccao(dataFiccao.data || []);

      } catch (error) {
        console.error("Erro ao buscar livros para homepage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBooksData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      <div className="container mx-auto px-4 py-12 md:py-16 space-y-16 md:space-y-24">
        {isLoading ? (
            <>
                <BookCarouselSkeleton />
                <BookCarouselSkeleton />
            </>
        ) : (
            <>
                <BookCarouselSection
                    title="Novidades Fresquinhas"
                    livros={livrosNovidades}
                    viewAllLink="/livros?sort=novidades" 
                />
                <BookCarouselSection
                    title="Aventura na Ficção"
                    livros={livrosFiccao}
                    viewAllLink="/livros/categoria/ficcao" 
                />
                {}
                {}
            </>
        )}
      </div>

      <FAQSection />
    </div>
  );
}