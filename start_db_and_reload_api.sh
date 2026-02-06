#!/bin/bash
set -e

DB_INSTANCE_ID="i-0d5d3557daf2d956d"
API_INSTANCE_IP="100.24.31.252"
API_INSTANCE_ID="i-07e60aad151ef605a"
API_ENV_PATH="/opt/servicios/tesis/.env.production"
API_USER="ec2-user"
PM2_APP_NAME="tesis-api"
API_HOST="rk"

echo "🚀 Starting DB instance..."
aws ec2 start-instances --instance-ids $DB_INSTANCE_ID

echo "⏳ Waiting for DB instance to be running..."
aws ec2 wait instance-running --instance-ids $DB_INSTANCE_ID

echo "🔍 Fetching DB public IP..."
DB_IP=$(aws ec2 describe-instances \
  --instance-ids $DB_INSTANCE_ID \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text)

echo "✅ DB IP: $DB_IP"

echo "🔐 Connecting to API instance and updating env..."
ssh -i ~/Documents/RK/sistemas/monitoreo.pem ec2-user@100.24.31.252 << EOF
  set -e
  sed -i "s/^POSTGRES_HOST=.*/POSTGRES_HOST=$DB_IP/" /opt/servicios/tesis/.env.production
  cd /opt/servicios/tesis
  pm2 reload ecosystem.config.js --env production
  pm2 save
EOF

echo "🎉 Done. API now points to DB at $DB_IP"