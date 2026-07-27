# Silent Shift — production Dockerfile (multi-stage)

############################################
# 1. deps — install npm packages + compile native modules
############################################
FROM node:20-alpine AS deps
WORKDIR /app

# better-sqlite3 needs build tools to compile native bindings
RUN apk add --no-cache python3 make g++ libc6-compat

COPY package.json package-lock.json* ./
COPY scripts/harden-deps.js ./scripts/harden-deps.js
RUN npm ci

############################################
# 2. builder — build the Next.js app
############################################
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

############################################
# 3. runner — minimal production image
############################################
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat tini

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copy production artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Bring scripts + lib in so we can run the seed inside the container
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Create writable directories for the SQLite DB and uploads
RUN mkdir -p /app/data /app/public/uploads/covers /app/public/uploads/audio \
 && chown -R nextjs:nodejs /app/data /app/public/uploads

# Authentication secrets and bootstrap credentials must be supplied at runtime.
USER nextjs

EXPOSE 3000

# tini handles signals/zombies properly
ENTRYPOINT ["/sbin/tini", "--"]

# Default: run the production server.
# To seed first, use: docker compose run --rm app npm run seed
CMD ["npm", "start"]
