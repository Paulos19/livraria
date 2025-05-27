// components/ui/LoadingSpinner.tsx (Exemplo simples)
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
      sm: "h-6 w-6",
      md: "h-10 w-10",
      lg: "h-16 w-16",
    };
    return (
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`} />
    );
  }
  
  export function PageLoading({ message = "Carregando..."}: {message?: string}) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
              <LoadingSpinner size="lg" />
              <p className="text-lg text-muted-foreground">{message}</p>
          </div>
      );
  }