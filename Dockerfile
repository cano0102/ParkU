# --- Etapa 1: build ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Las variables VITE_* se incrustan en el bundle en build-time, no en runtime,
# por eso van como build args y no como env vars del contenedor final.
ARG VITE_API_URL
ARG VITE_API_TIMEOUT
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_API_TIMEOUT=${VITE_API_TIMEOUT}

RUN npm run build

# --- Etapa 2: runtime ---
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
