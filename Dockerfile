# ---- build: compila el SPA con Vite ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite incrusta estas variables en el bundle en tiempo de BUILD (import.meta.env), no se
# pueden cambiar después en un contenedor ya corriendo -- ver src/services/core/http.ts.
# Por defecto apuntan a la API pública ya desplegada (igual que .env.example); pásalas con
# --build-arg para apuntar a otra API (p. ej. la del contenedor "api" en la misma red).
ARG VITE_API_URL=https://api-parku-e017.onrender.com/api
ARG VITE_API_TIMEOUT=60000
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_TIMEOUT=${VITE_API_TIMEOUT}

RUN npm run build

# ---- runtime: sirve los archivos estáticos con nginx ----
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
