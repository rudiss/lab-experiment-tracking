# Migration + seed runner. Not a long-running app — it applies migrations, seeds, exits.
FROM node:20-bookworm-slim

# Prisma needs OpenSSL present to pick its query-engine binary.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY tsconfig.json ./
COPY prisma ./prisma

# Generate the client for this (linux) platform at build time so the seed can run.
RUN npx prisma generate

# Apply all migrations, then load seed data, then exit 0.
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed"]
