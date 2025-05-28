// app/livros/categoria/[slug]/page.tsx
import { Suspense } from 'react';
import { Skeleton } from "@/components/ui/skeleton"; // Para o fallback
import CategoriaLivrosClientPage from '../../CategoriaLivrosClientPage';

// Interface para os parâmetros da rota
interface PageProps {
  params: {
    slug: string; // O nome do parâmetro dinâmico deve corresponder ao nome da pasta, [slug]
  };
  // searchParams também podem ser acessados aqui se necessário, mas o ClientComponent já os usa.
}

// Skeleton para a página de categoria
function CategoriaPageFallbackSkeleton() {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-1/2 mb-2" /> {/* Título da Categoria */}
          <Skeleton className="h-5 w-1/3" /> {/* Contagem */}
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
         <div className="mt-12 flex justify-center">
            <Skeleton className="h-10 w-64"/>
        </div>
      </div>
    );
}

export default function LivrosPorCategoriaPage({ params }: PageProps) {
  const { slug } = params; // Extrai o slug da categoria da URL

  // Opcional: Você pode gerar metadados dinâmicos aqui se desejar
  // export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  //   const categoryName = decodeURIComponent(params.slug).replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase());
  //   return {
  //     title: `Livros de ${categoryName} | Seboso Livraria`,
  //     description: `Explore nossa coleção de livros da categoria ${categoryName}.`,
  //   };
  // }

  return (
    <Suspense fallback={<CategoriaPageFallbackSkeleton />}>
      <CategoriaLivrosClientPage categorySlug={slug} />
    </Suspense>
  );
}