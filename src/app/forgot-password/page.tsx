
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
import { ArrowLeft, Loader2 } from 'lucide-react';

// Basic email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email) {
      setError("Por favor, introduce tu correo electrónico.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
        setError("Por favor, introduce un correo electrónico válido.");
        return;
    }

    setIsLoading(true);

    try {
      if (!auth) {
        throw new Error("La configuración de Firebase no está disponible. No se puede enviar el correo.");
      }
      
      // The actionCodeSettings can help redirect the user back to your app
      // after they reset their password. This is optional but good practice.
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);

      toast({
        title: "Correo de recuperación enviado",
        description: `Si existe una cuenta para ${email}, recibirás un correo electrónico con instrucciones para restablecer tu contraseña.`,
      });
      // It's often better not to redirect immediately, so the user can read the toast.
      // But redirecting to login is also a common pattern.
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err: any) {
      console.error("Error al enviar el correo de recuperación:", err);
      
      let errorMessage = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.";
      
      // Firebase provides specific error codes that we can use for better user feedback.
      switch (err.code) {
        case 'auth/user-not-found':
          // For security, you might not want to reveal if an email is registered or not.
          // The generic success message handles this, but if you want to be specific, this is how.
          errorMessage = "No se encontró ninguna cuenta con este correo electrónico.";
           toast({
            title: "Correo de recuperación enviado",
            description: `Si existe una cuenta para ${email}, recibirás un correo electrónico con instrucciones.`,
          });
          break;
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/network-request-failed':
            errorMessage = "Error de red. Por favor, comprueba tu conexión a internet.";
            break;
        default:
          // This will catch other Firebase errors or the custom error thrown above.
          errorMessage = err.message || errorMessage;
          break;
      }
      
      // Only set the on-screen error for client-side validation issues.
      // For server errors, the toast is usually enough.
      if (err.code === 'auth/invalid-email'){
          setError(errorMessage);
      }

      // We show a toast for any error that occurs after submission.
       if(err.code !== 'auth/user-not-found'){
            toast({
                title: "Error al enviar correo",
                description: errorMessage,
                variant: "destructive",
            });
       }
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
                  <p id="email-error" className="text-sm text-destructive mt-1" role="alert">
                    {error}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                 ) : 'Enviar Correo de Recuperación'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
