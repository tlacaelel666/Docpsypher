# --- STAGE 1: Dependency Installation ---
# Usamos una imagen base ligera de Node para instalar dependencias.
FROM node:20-slim AS deps

# Crear un directorio de trabajo y copiar los archivos de configuración
WORKDIR /app
COPY package.json package-lock.json ./

# Instalar las dependencias. Usamos --omit=dev para ignorar dependencias de desarrollo.
RUN npm install --omit=dev

# --- STAGE 2: Build Stage (Compilación de la aplicación) ---
# Usamos una imagen Node más completa para el proceso de construcción, ya que se necesitan herramientas de compilación.
FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# El archivo .env (si existe) NO debe copiarse aquí si contiene secretos de producción.
# Para Next.js, la variable ENV 'NEXT_TELEMETRY_DISABLED' es opcional, pero ayuda a acelerar el build.
ENV NEXT_TELEMETRY_DISABLED 1

# Compilar la aplicación Next.js. Esto crea los directorios .next y standalones.
RUN npm run build

# --- STAGE 3: Production Runner (Imagen final y ligera) ---
# Usamos una imagen súper ligera para el entorno de producción.
FROM node:20-slim AS runner

# Establecer la configuración regional (opcional, pero buena práctica)
ENV LANG C.UTF-8
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Copiar archivos esenciales:
# 1. El directorio .next/standalone
# 2. El directorio public
# 3. node_modules necesarios para el runtime (los de producción)
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# El puerto por defecto para Next.js en producción es 3000
EXPOSE 3000

# Comando para iniciar la aplicación en modo standalone
CMD ["node", "server.js"]
