"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

const prettyAuthError = (error: string): string => {
  switch (error) {
    case "CredentialsSignin":
      return "Email ou senha inválidos. Por favor, tente novamente.";
    case "Callback":
    case "OAuthAccountNotLinked":
    case "OAuthCallback":
    case "OAuthCreateAccount":
    case "EmailCreateAccount":
    case "EmailSignin":
    case "OAuthSignin":
      return `Erro durante o login com provedor externo: ${error}. Tente outro método.`;
    case "SessionRequired":
        return "Sessão necessária. Por favor, faça login.";
    default:
      return "Ocorreu um erro inesperado durante o login. Tente novamente mais tarde.";
  }
};

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error"); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(errorParam ? prettyAuthError(errorParam) : null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  useEffect(() => {
    if (errorParam && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({ path: url.toString() }, '', url.toString());
    }
  }, [errorParam]);


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email || !password) {
        setError("Por favor, preencha o email e a senha.");
        setIsLoading(false);
        return;
    }

    try {
      const result = await signIn("credentials", {
        redirect: false, 
        email,
        password,
        callbackUrl: callbackUrl 
      });

      if (result?.error) {
        console.error("SignIn Error:", result.error);
        setError(prettyAuthError(result.error));
      } else if (result?.ok && result?.url) {
        router.push(callbackUrl); 
      } else if (result?.ok && !result.url) {
        router.push(callbackUrl);
      } else {
        setError("Falha no login. Verifique suas credenciais.");
      }
    } catch (err) {
      console.error("Catch Error:", err);
      setError("Ocorreu um erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card>
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <LogIn className="h-8 w-8" />
          </motion.div>
          <CardTitle className="text-3xl font-bold">Bem-vindo de Volta!</CardTitle>
          <CardDescription>
            Faça login para continuar na Seboso Livraria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erro de Autenticação</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || status === 'authenticated'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || status === 'authenticated'}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || status === 'authenticated'}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
           <p className="text-sm text-muted-foreground">
            Esqueceu sua senha?{" "}
            <Link href="/auth/reset-password" 
                className="font-medium text-primary hover:underline">
                Recuperar senha
            </Link>
            </p>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}