# ==============================================================================
# ConnectX — Production Multi-Stage Dockerfile
#
# Builds both:
#   1. React 19 + Vite frontend (output to /app/dist)
#   2. TypeScript + Express + Socket.IO backend (output to /app/backend/dist)
# Runs as a single unified service on port 5000 (or platform $PORT).
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Builder
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests for caching
COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/

# Install all dependencies (including devDependencies needed to build)
RUN npm ci --include=dev
RUN npm --prefix backend ci --include=dev

# Copy full application source
COPY . .

# Build frontend (Vite -> /app/dist) and backend (tsc -> /app/backend/dist)
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: Production Runner
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Production environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Copy manifests to install only backend production dependencies
COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/

# Install only production dependencies to keep the image lightweight
RUN npm --prefix backend ci --omit=dev

# Copy built frontend SPA static assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy compiled backend JavaScript from builder stage
COPY --from=builder /app/backend/dist ./backend/dist

# Expose default HTTP/WebSocket port
EXPOSE 5000

# Run the production backend server directly with Node for proper signal handling (SIGTERM/SIGINT)
CMD ["node", "backend/dist/server.js"]