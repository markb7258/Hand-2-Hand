#!/bin/bash
set -e

# Daily Server Backup Script for GoFile
# Runs daily at 3:00 AM UTC via cron
# Backs up: Docker volumes, app files, SSL certs, configs
# Retention: 30 days

echo "[$(date)] Starting daily server backup..."

# Configuration
BACKUP_DIR="/tmp/server-backup-$(date +%Y%m%d-%H%M%S)"
BACKUP_NAME="$(date +%Y-%m-%d)-server-snapshot.tar.gz"
GOFILE_TOKEN="z9yW4VXg5Hu5qzNk7Rn0ywidKgvmTwsu"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Backing up Docker volumes..."
# Backup all Docker volumes
docker volume ls -q | while read -r volume; do
  echo "  - Backing up volume: $volume"
  mkdir -p "$BACKUP_DIR/volumes/$volume"
  docker run --rm -v "$volume:/volume" -v "$BACKUP_DIR/volumes:/backup" alpine \
    tar czf "/backup/$volume.tar.gz" -C /volume .
done

echo "[$(date)] Backing up application files..."
# Backup application code
if [ -d "/root/Hand-2-Hand" ]; then
  mkdir -p "$BACKUP_DIR/app"
  tar czf "$BACKUP_DIR/app/hand-2-hand-app.tar.gz" -C /root Hand-2-Hand \
    --exclude="node_modules" --exclude=".next" --exclude=".git"
fi

echo "[$(date)] Backing up SSL certificates..."
# Backup SSL certificates (Traefik volume)
if docker volume inspect traefik_certs >/dev/null 2>&1; then
  echo "  - Backing up Traefik certificates"
  mkdir -p "$BACKUP_DIR/ssl"
  docker run --rm -v traefik_certs:/certs -v "$BACKUP_DIR/ssl:/backup" alpine \
    tar czf /backup/traefik-certs.tar.gz -C /certs .
fi

echo "[$(date)] Backing up configurations..."
# Backup important configuration files
mkdir -p "$BACKUP_DIR/configs"
if [ -f "/root/Hand-2-Hand/docker-stack.yml" ]; then
  cp /root/Hand-2-Hand/docker-stack.yml "$BACKUP_DIR/configs/"
fi
if [ -f "/root/Hand-2-Hand/.env.local" ]; then
  cp /root/Hand-2-Hand/.env.local "$BACKUP_DIR/configs/"
fi
if [ -f "/root/.bashrc" ]; then
  cp /root/.bashrc "$BACKUP_DIR/configs/"
fi

echo "[$(date)] Creating snapshot archive..."
# Create final tar.gz archive
tar czf "/tmp/$BACKUP_NAME" -C "$BACKUP_DIR" .

echo "[$(date)] Uploading to GoFile..."
# Get GoFile server
SERVER_RESPONSE=$(curl -s "https://api.gofile.io/servers")
SERVER=$(echo "$SERVER_RESPONSE" | jq -r '.data.servers[0].name')

if [ -z "$SERVER" ] || [ "$SERVER" = "null" ]; then
  echo "ERROR: Failed to get GoFile server"
  rm -rf "$BACKUP_DIR" "/tmp/$BACKUP_NAME"
  exit 1
fi

echo "  - Using GoFile server: $SERVER"

# Upload to GoFile
UPLOAD_RESPONSE=$(curl -s -X POST \
  "https://$SERVER.gofile.io/contents/uploadfile" \
  -F "token=$GOFILE_TOKEN" \
  -F "file=@/tmp/$BACKUP_NAME")

UPLOAD_STATUS=$(echo "$UPLOAD_RESPONSE" | jq -r '.status')

if [ "$UPLOAD_STATUS" = "ok" ]; then
  FILE_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.fileId')
  DOWNLOAD_URL=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.downloadPage')
  echo "  ✅ Upload successful!"
  echo "  - File ID: $FILE_ID"
  echo "  - Download URL: $DOWNLOAD_URL"
else
  echo "  ❌ Upload failed:"
  echo "$UPLOAD_RESPONSE" | jq .
  rm -rf "$BACKUP_DIR" "/tmp/$BACKUP_NAME"
  exit 1
fi

echo "[$(date)] Cleaning up temporary files..."
rm -rf "$BACKUP_DIR" "/tmp/$BACKUP_NAME"

echo "[$(date)] Checking for old backups (retention: $RETENTION_DAYS days)..."
# Note: GoFile API doesn't provide easy way to list/delete old files
# Manual cleanup should be done via GoFile dashboard periodically
# Or implement custom tracking file to store file IDs for deletion

echo "[$(date)] Daily backup completed successfully!"
echo "---"
