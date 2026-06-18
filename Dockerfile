# Build stage
FROM node:22-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN mkdir -p /app/public
RUN npx prisma generate
ENV DATABASE_URL="file:/tmp/build-placeholder.db"
RUN npm run build

# Production stage
FROM node:22-slim AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl
COPY package*.json ./
RUN npm ci --only=production
COPY prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
RUN mkdir -p /app/data && chmod 777 /app/data
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD sh -c "./node_modules/.bin/prisma db push --accept-data-loss && ./node_modules/.bin/next start -p ${PORT:-3000}"