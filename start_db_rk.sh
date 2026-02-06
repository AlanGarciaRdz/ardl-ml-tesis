#!/bin/bash
set -e

DB_INSTANCE_ID="i-0d5d3557daf2d956d"
API_ENV_PATH="/opt/servicios/tesis/.env.production"
APP_DIR="/opt/servicios/tesis"

echo "🚀 Starting DB instance..."
aws ec2 start-instances --instance-ids "$DB_INSTANCE_ID"

echo "⏳ Waiting for DB instance to be running..."
aws ec2 wait instance-running --instance-ids "$DB_INSTANCE_ID"

echo "🔍 Fetching DB public IP..."
DB_IP=$(aws ec2 describe-instances \
  --instance-ids "$DB_INSTANCE_ID" \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text)

if [ -z "$DB_IP" ] || [ "$DB_IP" = "None" ]; then
  echo "❌ Failed to fetch DB IP"
  exit 1
fi

echo "✅ DB IP: $DB_IP"

echo "📝 Updating POSTGRES_HOST in .env.production..."
sudo sed -i "s/^POSTGRES_HOST=.*/POSTGRES_HOST=$DB_IP/" "$API_ENV_PATH"

echo "♻️ Reloading PM2 ecosystem..."
cd "$APP_DIR"
pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
pm2 save

echo "🎉 Done. API now points to DB at $DB_IP"
