# Multi-stage production Dockerfile for ConnectX
# Base stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and backend dependency manifests
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies for both frontend and backend
RUN npm ci
RUN cd backend && npm ci

# Copy full application source code
COPY . .

# Build both frontend SPA (Vite) and backend (TypeScript tsc)
RUN npm run build

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy root package.json for script execution
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install only production dependencies in backend
RUN cd backend && npm ci --omit=dev

# Copy built frontend assets
COPY --from=builder /app/dist ./dist

# Copy built backend code
COPY --from=builder /app/backend/dist ./backend/dist

# Expose server port
EXPOSE 5000

# Start production server
CMD ["npm", "--prefix", "backend", "start"]
