# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Create startup script
RUN printf '#!/bin/sh\nnpx prisma db push --skip-generate\nexec node_modules/.bin/next start\n' > /app/start.sh && chmod +x /app/start.sh

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.mjs ./

# Create directory for SQLite database
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000

# Initialize database on startup
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/start.sh ./start.sh

EXPOSE 3000

CMD ["/app/start.sh"]
