// components/auth/RegisterForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react"; // Para redirecionar se já logado
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
import { AlertTriangle, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    // Se já estiver autenticado, redireciona para a home ou dashboard
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!name || !email || !password || !confirmPassword) {
      setError("Todos os campos são obrigatórios.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Falha ao registrar. Tente novamente.");
        if (data.issues) {
            // Se houver erros de validação do Zod, pode exibi-los
            const validationErrors = data.issues.map((issue: any) => issue.message).join("\n");
            setError(`Erro de validação:\n${validationErrors}`);
        }
      } else {
        setSuccessMessage(data.message || "Cadastro realizado com sucesso!");
        toast.success("Cadastro realizado!", {
            description: "Você será redirecionado para a página de login.",
            duration: 3000, // milissegundos
            onDismiss: () => router.push('/auth/signin'), // Redireciona após o toast
            onAutoClose: () => router.push('/auth/signin'),
        });
        // Limpa o formulário opcionalmente ou redireciona
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        // router.push('/auth/signin'); // Ou redireciona direto aqui
      }
    } catch (err) {
      console.error("Erro de rede ou parsing:", err);
      setError("Ocorreu um erro de conexão. Tente novamente mais tarde.");
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
            <UserPlus className="h-8 w-8" />
          </motion.div>
          <CardTitle className="text-3xl font-bold">Crie sua Conta</CardTitle>
          <CardDescription>
            Junte-se à Seboso Livraria e explore um universo de leitura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erro no Cadastro</AlertTitle>
                <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && !error && ( // Mostra sucesso apenas se não houver erro
              <Alert variant="default" className="bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-700">
                <UserPlus className="h-4 w-4 text-green-700 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-300">Sucesso!</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400">
                    {successMessage} Você será redirecionado em breve.
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-register">Email</Label>
              <Input
                id="email-register" // ID diferente do login para evitar conflitos de autocomplete
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-register">Senha</Label>
              <Input
                id="password-register"
                type="password"
                placeholder="Crie uma senha forte"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}