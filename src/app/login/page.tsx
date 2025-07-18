
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderLock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    // Dummy user credentials for testing
    const dummyEmail = 'test@test.com';
    const dummyPassword = 'password';

    if (email === dummyEmail && password === dummyPassword) {
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de vuelta.",
      });
      router.push('/dashboard');
    } else {
      toast({
        title: "Error de inicio de sesión",
        description: "Las credenciales son incorrectas. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="shadow-lg animate-fadeIn">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <FolderLock className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">Bienvenido a DocSafer</CardTitle>
            <CardDescription>Inicia sesión para acceder a tu portafolio digital.</CardDescription>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
