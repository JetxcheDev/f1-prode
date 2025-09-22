"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import * as z from "zod"
import { LoginSchema } from "@/auth/schemas"

interface LoginFormProps extends React.ComponentProps<"div"> {
  onEmailLogin: (values: z.infer<typeof LoginSchema>) => Promise<{ success?: string; error?: string }>;
  onGoogleLogin: () => Promise<{ success?: string; error?: string }>;
}

export function LoginForm({
  className,
  onEmailLogin,
  onGoogleLogin,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = LoginSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error("Por favor, ingresa un email válido y una contraseña de al menos 6 caracteres");
      return;
    }

    startTransition(async () => {
      const response = await onEmailLogin({ email, password });
      if (response.success) {
        toast.success(response.success);
      } else if (response.error) {
        toast.error(response.error);
      }
    });
  };

  const handleGoogleLogin = () => {
    startTransition(async () => {
      const response = await onGoogleLogin();
      if (response.success) {
        toast.success(response.success);
      } else if (response.error) {
        toast.error(response.error);
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-2xl border-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleEmailSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  <Image
                    src="/logo.png"
                    alt="F1 Prode Logo"
                    width={80}
                    height={80}
                    className="mx-auto"
                  />
                </div>
                <h1 className="text-2xl font-bold">Bienvenido de vuelta</h1>
                <p className="text-muted-foreground text-balance">
                  Inicia sesión en tu cuenta de F1 Prode
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="tu@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  required 
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  required 
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11 cursor-pointer" disabled={isPending}>
                {isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-20 bg-background px-2 text-muted-foreground">
                  O continúa con
                </span>
              </div>
              <Button 
                type="button"
                variant="outline" 
                className="w-full h-11 cursor-pointer" 
                onClick={handleGoogleLogin}
                disabled={isPending}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                {isPending ? "Conectando..." : "Continuar con Google"}
              </Button>
              <div className="text-center text-sm">
                ¿No tienes una cuenta?{" "}
                <Link href="/register" className="underline underline-offset-4 text-primary hover:text-primary/80">
                  Regístrate
                </Link>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800 md:block">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Image
                  src="/logo.png"
                  alt="F1 Prode Logo"
                  width={120}
                  height={120}
                  className="mx-auto mb-6 opacity-90"
                />
                <h2 className="text-3xl font-bold mb-4">F1 Prode</h2>
                <p className="text-lg opacity-90 max-w-sm mx-auto">
                  Predice los resultados de la Fórmula 1 y compite con tus amigos
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
