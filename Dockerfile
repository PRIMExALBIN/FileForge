# Build stage (Debian based - better compatibility)
FROM node:20-slim AS builder

WORKDIR /app


# Copy package.json only (ignore lockfile for build to fix native deps)
COPY package.json ./

# Delete lockfile to force Linux native binary resolution
RUN rm -f package-lock.json && npm install --legacy-peer-deps


# Copy source
COPY . .

# Remove test folders before build
RUN rm -rf src/tests src/__tests__

# Build
RUN npm run build

# Production stage (Alpine is fine here - only serving static files)
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
