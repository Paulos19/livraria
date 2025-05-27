import { Suspense } from 'react';
import { Skeleton } from "@/components/ui/skeleton"; 
import LivrosClientPage from './LivrosClientPage';

function LivrosPageFallbackSkeleton() {
    return (
      <div className="container mx-auto px-4 py-8">
        {}
        <div className="mb-8 text-center">
          <Skeleton className="h-12 w-3/4 mx-auto mb-3" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>
        {}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-full sm:max-w-sm" />
          <Skeleton className="h-6 w-32" />
        </div>
        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {[...Array(12)].map((_, i) => ( 
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
        {}
        <div className="mt-12 flex justify-center">
            <Skeleton className="h-10 w-64"/>
        </div>
      </div>
    );
  }

export default function LivrosPage() {


  return (
    <Suspense fallback={<LivrosPageFallbackSkeleton />}>
      <LivrosClientPage />
    </Suspense>
  );
}