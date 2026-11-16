# 1. Etapa para instalar dependencias de desarrollo (necesarias para compilar TypeScript)
FROM node:26-alpine AS dev-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# 2. Etapa para compilar el código TypeScript a JavaScript
FROM node:26-alpine AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Etapa para instalar solo las dependencias de producción
FROM node:26-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# 4. Etapa final (Runner) para ejecutar la aplicación
FROM node:26-alpine AS runner
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# Buenas prácticas: usar un usuario no root por seguridad
USER node

EXPOSE 3000
CMD ["npm", "start"]