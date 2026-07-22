#!/bin/bash

# --- Configuration ---
VM_USER="azureuser"
VM_HOST="20.205.18.40"
KEY_PATH="$HOME/Downloads/u6620025-key.pem"
TARGET_DIR="~/backend-crud-api"

scp -r -i "$KEY_PATH" app.js package.json package-lock.json .env dist prisma \
"$VM_USER@$VM_HOST:$TARGET_DIR/"

echo "🔄 Step 2: Restarting application and copying static files to Nginx web root..."

ssh -i "$KEY_PATH" "$VM_USER@$VM_HOST" << EOF
cd ~/backend-crud-api
npm install
npx prisma generate
npx prisma migrate deploy
pm2 restart crud-api
sudo cp -R dist/* /var/www/html/
EOF

echo "✅ Deployment Complete!"