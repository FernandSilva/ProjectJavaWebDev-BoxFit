# ─────────────────────────────────────────────
# Stage 1: Build (installs devDeps, compiles TS)
# ─────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Install deps (including dev) deterministically
COPY package*.json ./
RUN npm ci

# Copy sources and tsconfig, then build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Runtime (prod-only deps + compiled JS)
# ─────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled code from build stage
COPY --from=build /app/dist ./dist

# Optional: keep example env for docs
COPY .env.example ./.env.example

# Render injects its own PORT; your server must use process.env.PORT
EXPOSE 3001
CMD ["node", "dist/server.js"]
