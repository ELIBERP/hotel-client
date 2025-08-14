# Use a Node image that's not Alpine-based to avoid musl compatibility issues
FROM node:18 as build
WORKDIR /app

# Pull environment variables from Render build args
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Add Google Maps API key
ARG VITE_GOOGLEMAP_API_KEY
ENV VITE_GOOGLEMAP_API_KEY=$VITE_GOOGLEMAP_API_KEY

# Copy package files first
COPY package.json package-lock.json ./

# Remove any platform-specific rollup binaries before installing
RUN grep -v "@rollup/rollup-darwin-" package.json > package.json.tmp && mv package.json.tmp package.json

# Install dependencies
RUN npm install --no-package-lock

# Fix Rollup binary issues by ensuring the correct platform binary is available
RUN npm install --no-package-lock @rollup/rollup-linux-x64-gnu

# Copy the rest of the application
COPY . .

# Build the app with production configuration
RUN npm run build

# Use Nginx to serve the static files
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