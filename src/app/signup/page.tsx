'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderLock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Aquí iría la lógica de registro real
    // Por ahora, solo redirigimos al dashboard
    router.push('/dashboard');
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="shadow-lg animate-fadeIn">
          <CardHeader className="text-center">
             <div className="flex justify-center mb-4">
              <FolderLock className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">Crea tu Cuenta Segura</CardTitle>
            <CardDescription>Únete a la nueva era de la seguridad documental.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" type="text" placeholder="Tu Nombre" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" placeholder="tu@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" placeholder="Crea una contraseña segura" required />
              </div>
              <Button type="submit" className="w-full">
                Crear Cuenta
              </Button>
            </form>
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
