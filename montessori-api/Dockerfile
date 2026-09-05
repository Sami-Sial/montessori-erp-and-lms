FROM node:20-slim AS base
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Build / generate Prisma client
FROM base AS build
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npx prisma generate

# Production image
FROM base AS runner
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/src ./src
COPY --from=build /app/prisma ./prisma
COPY package.json ./

EXPOSE 4000

CMD ["node", "src/server.js"]
