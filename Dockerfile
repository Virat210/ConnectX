FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/

RUN npm ci --include=dev
RUN npm --prefix backend ci --include=dev

COPY . .

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/

RUN npm --prefix backend ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend/dist ./backend/dist

EXPOSE 5000

CMD ["npm", "--prefix", "backend", "start"]