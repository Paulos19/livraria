import { PageLoading } from '@/app/components/LoadingSpinner';
import { Suspense } from 'react';
import SignInForm from './SignInForm';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4 md:p-8">
      {}
      <Suspense fallback={<PageLoading message="Carregando formulário de login..." />}>
        <SignInForm />
      </Suspense>
    </div>
  );
}