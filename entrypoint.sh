#!/bin/sh
# Run database migrations
npx prisma migrate deploy
# Start the Next.js standalone server
node server.js
