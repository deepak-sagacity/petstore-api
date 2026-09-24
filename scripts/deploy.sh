#!/bin/bash
cd /home/ec2-user/petstore-api

# Ensure node packages and Prisma are ready
npm install
npx prisma generate
npx prisma db push
npm run build

# Restart or start the PM2 daemon
if pm2 describe petstore-api > /dev/null 2>&1; then
  pm2 restart petstore-api --update-env
else
  pm2 start dist/server.js --name "petstore-api"
fi

pm2 save