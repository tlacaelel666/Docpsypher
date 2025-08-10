
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from '@/hooks/use-toast';
import { DocSaferLogo } from '@/components/doc-safer-logo';
import { ArrowLeft, Loader2, KeyRound } from 'lucide-react';

// SIMULATED CORRECT ANSWER
const CORRECT_ANSWER = "Quantum";

export default function RecoverByQuestionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!answer) {
      setError("Por favor, introduce tu respuesta.");
      return;
    }
    
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate checking the answer
    if (answer.toLowerCase() === CORRECT_ANSWER.toLowerCase()) {
      toast({
        title: "Respuesta Correcta",
        description: "Se ha simulado el reinicio de tu contraseña. Ahora serás redirigido.",
      });
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      setError("La respuesta es incorrecta. Por favor, inténtalo de nuevo.");
      toast({
        title: "Error de Recuperación",
        description: "La respuesta proporcionada no es correcta.",
        variant: "destructive",
      });
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
            <CardTitle className="font-headline text-3xl">Recuperación por Pregunta</CardTitle>
            <CardDescription>Responde a tu pregunta de seguridad para continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="security-question">¿Cuál es la palabra clave de nuestro cifrado?</Label>
                <p className="text-xs text-muted-foreground">Pista: Empieza con Q...</p>
                <Input
                  id="security-answer"
                  type="text"
                  placeholder="Tu respuesta secreta"
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={isLoading}
                  className={error ? 'border-destructive' : ''}
                  aria-describedby={error ? "answer-error" : undefined}
                />
                {error && (
                  <p id="answer-error" className="text-sm text-destructive mt-1" role="alert">
                    {error}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                 ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Verificar Respuesta
                  </>
                 )}
              </Button>
            </form>
          </CardContent>
           <CardFooter className="flex justify-center">
             <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                ¿Prefieres usar la recuperación por correo?
              </Link>
           </CardFooter>
        </Card>
      </div>
    </div>
  );
}

