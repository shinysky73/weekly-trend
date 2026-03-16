#!/bin/sh
set -e

echo "Pushing Prisma schema to database..."
cd /app/apps/api-server && npx prisma db push --accept-data-loss

echo "Starting API server..."
exec node /app/apps/api-server/dist/src/main.js
