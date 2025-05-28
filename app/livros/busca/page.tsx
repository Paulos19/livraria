// app/livros/busca/page.tsx
import { Suspense } from 'react';
import { Skeleton } from "@/components/ui/skeleton"; // Para o fallback
import BuscaResultadosClientPage from '../BuscaResultadosClientPage';

function BuscaPageFallbackSkeleton() {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
}

export default function BuscaLivrosPage() {
  // Como esta página depende de searchParams, é bom envolvê-la em Suspense.
  return (
    <Suspense fallback={<BuscaPageFallbackSkeleton />}>
      <BuscaResultadosClientPage />
    </Suspense>
  );
}