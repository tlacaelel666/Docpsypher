# Docpsypher

Es una aplicación Next.js con capacidades de IA integrada con Firebase Genkit,
🔧 Stack Tecnológico Principal
Framework y Runtime

Next.js 15.3.3 (última versión) con soporte para Turbopack
React 18.3.1
TypeScript 5
Puerto personalizado: 9002

# Inteligencia Artificial

Firebase Genkit (genkit, @genkit-ai/next, @genkit-ai/googleai)

Framework de Google para construir aplicaciones con IA
Integración con Google AI (probablemente Gemini)
Scripts dedicados para desarrollo de IA (genkit:dev, genkit:watch)



UI/UX - Biblioteca de Componentes
Usa Radix UI extensivamente (15+ componentes):

Sistema de diseño completo y accesible
Componentes: Dialog, Dropdown, Toast, Tabs, Select, etc.
shadcn/ui como base (CVA + Tailwind)

# Estilos

Tailwind CSS 3.4.1
tailwindcss-animate para animaciones
tailwind-merge para manejo de clases
class-variance-authority para variantes de componentes

Formularios y Validación

React Hook Form con Zod para validación
@hookform/resolvers para integración

Características Adicionales

Firebase 11.9.1 (autenticación, base de datos, storage)
QR Code generation (qrcode.react)
Recharts para visualización de datos
date-fns para manejo de fechas
Embla Carousel para carruseles
Lucide React para iconos

# Desarrollo con Turbopack (más rápido que Webpack)
npm run dev

# Desarrollo de funciones de IA
npm run genkit:dev      # Inicia el servidor de Genkit
npm run genkit:watch    # Con hot-reload

# Producción
npm run build
npm run start

# Calidad de código
npm run lint
npm run typecheck

 # Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
