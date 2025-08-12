# Use a Node image that's not Alpine-based to avoid musl compatibility issues
FROM node:18 as build
WORKDIR /app

# 👇 pull from Render as build-arg and expose to the build env
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Fix Rollup binary issues
RUN npm install -g @rollup/rollup-linux-x64-gnu
RUN npm install @rollup/rollup-linux-x64-gnu

# Build the app
RUN npm run build

FROM nginx:alpine

# Default for local/dev; Render will inject/override PORT at runtime
ENV PORT=10000

# Static files
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx template -> auto-envsubst at startup
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Healthcheck tooling
RUN apk add --no-cache curl

# Healthcheck (shell form so $PORT expands at runtime)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD sh -c 'curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null || exit 1'

CMD ["nginx", "-g", "daemon off;"]