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
ARG VITE_RECAPTCHA_SITE_KEY

RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY startup.sh /
RUN chmod +x /startup.sh

EXPOSE 80
CMD ["/startup.sh"]
