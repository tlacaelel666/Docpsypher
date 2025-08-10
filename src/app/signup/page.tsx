
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { DocSaferLogo } from '@/components/doc-safer-logo';


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (!auth) {
        throw new Error("La autenticación de Firebase no está disponible.");
      }
      await createUserWithEmailAndPassword(auth, email, password);
      // Opcional: podrías actualizar el perfil del usuario aquí con el nombre
      toast({
        title: "¡Cuenta Creada!",
        description: "Te hemos redirigido a tu portafolio.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error al crear la cuenta:", error);
      let errorMessage = "Ocurrió un error al crear la cuenta. Inténtalo de nuevo.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo electrónico ya está en uso. Por favor, inicia sesión.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
      } else if (error.message.includes("Firebase no está disponible")) {
        errorMessage = "El servicio de registro no está disponible en este momento. Inténtalo más tarde."
      }
      toast({
        title: "Error de Registro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      if (!auth || !googleProvider) {
        throw new Error("La autenticación de Firebase no está configurada para Google.");
      }
      await signInWithPopup(auth, googleProvider);
      toast({
        title: "¡Sesión iniciada con Google!",
        description: "Te hemos redirigido a tu portafolio.",
      });
      router.push('/dashboard');
    } catch (error: any) {
       console.error("Error con el inicio de sesión de Google:", error);
       let errorMessage = "Ocurrió un error durante el inicio de sesión con Google.";
       let errorTitle = "Error de Registro con Google";

       switch (error.code) {
         case 'auth/popup-closed-by-user':
           errorMessage = "El proceso de registro fue cancelado.";
           break;
         case 'auth/account-exists-with-different-credential':
           errorTitle = "Cuenta ya existente";
           errorMessage = "Ya existe una cuenta con este correo electrónico. Por favor, inicia sesión con tu método original (correo y contraseña).";
           break;
         case 'auth/network-request-failed':
            errorMessage = "Error de red. Por favor, comprueba tu conexión a internet.";
            break;
       }

       toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <Link href="/" className="text-sm text-primary hover:underline">
            ‹ Volver al Inicio
          </Link>
        </div>
        <Card className="shadow-lg animate-fadeIn border-primary/20">
          <CardHeader className="text-center">
             <div className="flex justify-center mb-4">
              <DocSaferLogo className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">Crea tu Cuenta Segura</CardTitle>
            <CardDescription>Únete a la nueva era de la seguridad documental.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleGoogleSignUp}
                disabled={isLoading || isGoogleLoading}
              >
                {isGoogleLoading ? 'Cargando...' : 'Continuar con Google'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    O continúa con
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="Tu Nombre" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="tu@email.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Crea una contraseña segura" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                  {isLoading ? 'Creando cuenta...' : 'Crear Cuenta con Correo'}
                </Button>
              </form>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Inicia Sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
