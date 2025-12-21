# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

# Copy package files first (better caching)
COPY package.json package-lock.json ./

# Install with explicit platform support
RUN npm ci --legacy-peer-deps

# Force install rollup native module for linux musl
RUN npm install @rollup/rollup-linux-x64-musl --save-optional --legacy-peer-deps || true

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
