import { Suspense } from 'react';
import { Skeleton } from "@/components/ui/skeleton"; 
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLivrosClientPage from './components/AdminLivrosClientPage';

function AdminLivrosPageFallbackSkeleton() {
    return (
      <div className="space-y-6 p-1"> {}
        {}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Skeleton className="h-10 w-1/3" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        {}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(5)].map((_, i) => ( 
                    <TableHead key={i}><Skeleton className="h-5 w-full my-2" /></TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(ITEMS_PER_PAGE_ADMIN / 3 )].map((_, i) => ( 
                  <TableRow key={i}>
                    {[...Array(5)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full my-1" /></TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {}
        <div className="mt-8 flex justify-center">
            <Skeleton className="h-10 w-64"/>
        </div>
      </div>
    );
  }

const ITEMS_PER_PAGE_ADMIN = 15;

export default function AdminListarLivrosPageContainer() {
  return (
    <Suspense fallback={<AdminLivrosPageFallbackSkeleton />}>
      <AdminLivrosClientPage />
    </Suspense>
  );
}