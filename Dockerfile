# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_DISABLE_EMAIL=false
ARG VITE_ADMIN_PIN
ARG VITE_REGISTRATION_OPEN_DATE=2026-03-01T00:00:00
ARG VITE_GRACE_PERIOD_MINUTES=15
ARG VITE_SMARTCAPTCHA_SITE_KEY
ARG VITE_TURNSTILE_SITE_KEY

RUN npm run build

# Stage 2: Setup proxy dependencies
FROM node:22-alpine AS proxy-builder
WORKDIR /proxy
COPY proxy-package.json package.json
RUN npm ci --only=production

# Stage 3: Serve
FROM nginx:alpine
# Install Node.js runtime in nginx image
RUN apk add --no-cache nodejs npm

# Propagate Supabase URL to runtime so proxy-server.js can use it
ARG VITE_SUPABASE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy proxy server and dependencies
COPY --from=proxy-builder /proxy/node_modules /proxy/node_modules
COPY proxy-server.js /proxy/

# Copy startup script
COPY startup.sh /
RUN chmod +x /startup.sh

EXPOSE 80
CMD ["/startup.sh"]
