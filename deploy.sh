#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Deploying Youngcap Web..."
npm install
npm run build

# Copy static assets to the standalone directory
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# Restart/Start standalone server using PM2
pm2 restart "ycapricorn-web" || pm2 start .next/standalone/server.js --name "ycapricorn-web"

echo "Youngcap Web deployed successfully!"
