# ---------- Admin Frontend (Next.js) ----------
# Chạy production build để deploy bằng Docker.

FROM node:20-alpine AS deps
WORKDIR /app

# Chỉ copy package files để cache layer
COPY package.json package-lock.json* ./

RUN npm ci --no-audit --no-fund

FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . ./

# Next.js build
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Next.js standalone vẫn chưa cấu hình sẵn ở project này,
# nên copy toàn bộ build output phổ biến.
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy Next config + required files
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Default command
CMD ["npm","run","start","--","-p","3000"]

