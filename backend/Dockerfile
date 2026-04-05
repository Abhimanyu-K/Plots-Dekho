# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code (ARG busts cache when code changes)
ARG CACHEBUST=1
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Verify build output exists
RUN ls -la dist/src/main.js

# Production stage
FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3001

# Start command - run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
