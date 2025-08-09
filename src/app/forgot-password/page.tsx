
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { DocSaferLogo } from '@/components/doc-safer-logo';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email) {
      setError("Por favor, introduce tu correo electrónico.");
      setIsLoading(false);
      return;
    }

    try {
      if (!auth) {
        throw new Error("La autenticación de Firebase no está disponible.");
      }
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Correo de recuperación enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
      });
      router.push('/login');
    } catch (err: any) {
      console.error("Error al enviar el correo de recuperación:", err);
      let errorMessage = "Ocurrió un error. Inténtalo de nuevo.";
      if (err.code === 'auth/user-not-found') {
        errorMessage = "No se encontró ninguna cuenta con este correo electrónico.";
      }
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <Link href="/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Volver a Iniciar Sesión
          </Link>
        </div>
        <Card className="shadow-lg animate-fadeIn border-primary/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <DocSaferLogo className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">Recuperar Contraseña</CardTitle>
            <CardDescription>Introduce tu correo para recibir un enlace de recuperación.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={error ? 'border-destructive' : ''}
                  aria-describedby={error ? "email-error" : undefined}
                />
                {error && (
                  <p id="email-error" className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar Correo de Recuperación'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
