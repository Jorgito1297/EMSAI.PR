# ============================================================
# CLERE Core Audit Engine — Backend Dockerfile
# Multi-stage build: deps → build → production
# ============================================================

# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app

# Copy only package files first (layer-cache friendly)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Stage 2: Production Image ----
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root user
RUN addgroup -S clere && adduser -S clere -G clere

# Copy production dependencies and application source
COPY --from=deps /app/node_modules ./node_modules
COPY src/ ./src/
COPY package.json ./

# Non-root ownership
RUN chown -R clere:clere /app
USER clere

# Expose backend port
EXPOSE 3000

# Health check so orchestrators can detect unhealthy containers
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
