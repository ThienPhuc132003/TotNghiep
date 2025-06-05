# Multi-stage build for production optimization
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install dependencies with optimizations
RUN npm ci --only=production --silent --no-audit --no-fund && \
    npm cache clean --force && \
    rm -rf ~/.npm /tmp/*

# Copy source files
COPY . .

# Set memory limits for build process
ENV NODE_OPTIONS="--max-old-space-size=3072"
ENV NODE_ENV="production"
ENV GENERATE_SOURCEMAP="false"

# Build the application with memory optimization
RUN npm run build && \
    npm prune --production && \
    rm -rf node_modules src public *.md *.json *.js *.ts && \
    rm -rf .git .gitignore

# Production stage
FROM nginx:alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Add nginx cache cleanup script
RUN echo '#!/bin/sh\n\
while true; do\n\
  find /var/cache/nginx -type f -mtime +1 -delete\n\
  sleep 3600\n\
done' > /usr/local/bin/cache-cleanup.sh && \
chmod +x /usr/local/bin/cache-cleanup.sh

# Set up proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx

EXPOSE 80

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start nginx and cache cleanup
CMD ["sh", "-c", "/usr/local/bin/cache-cleanup.sh & nginx -g 'daemon off;'"]