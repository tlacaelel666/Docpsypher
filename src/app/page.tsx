import { Button } from "@/components/ui/button";
import { FolderLock, ShieldCheck, BrainCircuit } from "lucide-react";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col">
      <header className="container mx-auto py-4 px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FolderLock className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold font-headline tracking-tighter">
            DocSafer
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Registrarse</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-3xl">
          <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30">
            Seguridad de Próxima Generación
          </Badge>
          <h2 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tighter mb-4 animate-fadeIn">
            Tu Bóveda Digital, Reimaginada.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Una plataforma revolucionaria para almacenar, verificar y compartir tu documentación más importante con seguridad cuántica y auditoría inteligente.
          </p>
          <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" asChild>
              <Link href="/signup">Comienza Gratis</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="container mx-auto py-8 px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <ShieldCheck className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-bold mb-1">Verificación por IA</h3>
            <p className="text-sm text-muted-foreground">Análisis forense de documentos para detectar anomalías y garantizar la autenticidad.</p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <BrainCircuit className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-bold mb-1">Huella Cuántica</h3>
            <p className="text-sm text-muted-foreground">Aprovechamos la decoherencia para crear una firma de seguridad única e inclonable.</p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <FolderLock className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-bold mb-1">Auditoría Transparente</h3>
            <p className="text-sm text-muted-foreground">Control total sobre quién accede a tus documentos y cuándo, con un registro inmutable.</p>
          </div>
        </div>
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DocSafer by smokapp software &amp; AI powered by Gemini &amp; Firebase Studio. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
      {...props}
    />
  );
}
