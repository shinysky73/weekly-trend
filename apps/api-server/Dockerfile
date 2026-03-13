FROM node:20-slim

WORKDIR /app

RUN npm install -g pnpm

# Install dependencies (cache layer)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api-server/package.json ./apps/api-server/
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/api-server ./apps/api-server

# Prisma generate & build
RUN cd apps/api-server && npx prisma generate
RUN pnpm -F @weekly-trend/api-server build

# Upload directory
RUN mkdir -p /app/uploads

EXPOSE 3002

COPY apps/api-server/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

CMD ["/app/docker-entrypoint.sh"]
