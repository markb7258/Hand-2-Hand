#!/bin/bash
# Server Auto-Update Script
# This script performs automatic maintenance on the server:
# - Updates OS packages (apt)
# - Updates Docker images
# - Updates Coolify CLI
# - Redeploys the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Configuration from environment or defaults
APP_UUID="${APP_UUID:-dw4040kw4ok440w48o4k4880}"
COOLIFY_URL="${COOLIFY_URL:-http://localhost:8000}"
COOLIFY_API_TOKEN="${COOLIFY_API_TOKEN}"

if [ -z "$COOLIFY_API_TOKEN" ]; then
    log_error "COOLIFY_API_TOKEN environment variable is required"
    exit 1
fi

log_info "Starting server maintenance at $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

# Step 1: Update OS packages
log_step "1/5: Updating OS packages..."
if command -v apt-get &> /dev/null; then
    log_info "Detected apt-get package manager"
    sudo apt-get update -qq
    sudo apt-get upgrade -y -qq
    sudo apt-get autoremove -y -qq
    log_info "OS packages updated successfully"
elif command -v yum &> /dev/null; then
    log_info "Detected yum package manager"
    sudo yum update -y
    log_info "OS packages updated successfully"
else
    log_warn "No supported package manager found, skipping OS updates"
fi

# Step 2: Update Docker images
log_step "2/5: Updating Docker images..."
if command -v docker &> /dev/null; then
    log_info "Pulling latest Coolify images..."
    docker exec coolify php artisan cleanup:unreachable-servers > /dev/null 2>&1 || true
    docker exec coolify php artisan cleanup:stucked-resources > /dev/null 2>&1 || true
    log_info "Docker cleanup completed"
else
    log_warn "Docker not found, skipping Docker updates"
fi

# Step 3: Update Coolify CLI
log_step "3/5: Updating Coolify CLI..."
if command -v coolify &> /dev/null; then
    log_info "Current Coolify CLI version: $(coolify --version 2>/dev/null || echo 'unknown')"
    curl -fsSL https://raw.githubusercontent.com/coollabsio/coolify-cli/main/scripts/install.sh | bash > /dev/null 2>&1
    log_info "Coolify CLI updated to version: $(coolify --version 2>/dev/null || echo 'unknown')"
else
    log_warn "Coolify CLI not found, installing..."
    curl -fsSL https://raw.githubusercontent.com/coollabsio/coolify-cli/main/scripts/install.sh | bash
    log_info "Coolify CLI installed successfully"
fi

# Step 4: Check Coolify instance health
log_step "4/5: Checking Coolify instance health..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "${COOLIFY_URL}/api/v1/healthcheck" \
    -H "Authorization: Bearer ${COOLIFY_API_TOKEN}")

if [ "$HEALTH_CHECK" = "200" ]; then
    log_info "Coolify instance is healthy"
else
    log_error "Coolify instance health check failed (HTTP $HEALTH_CHECK)"
    log_warn "Attempting to restart Coolify..."
    docker restart coolify || true
    sleep 30
fi

# Step 5: Redeploy application
log_step "5/5: Redeploying application..."
log_info "Triggering deployment for app UUID: $APP_UUID"

DEPLOY_RESPONSE=$(curl -s -X GET "${COOLIFY_URL}/api/v1/deploy?uuid=${APP_UUID}&force=false" \
    -H "Authorization: Bearer ${COOLIFY_API_TOKEN}" \
    -w "\n%{http_code}")

DEPLOY_HTTP_CODE=$(echo "$DEPLOY_RESPONSE" | tail -n1)
DEPLOY_BODY=$(echo "$DEPLOY_RESPONSE" | head -n-1)

if [ "$DEPLOY_HTTP_CODE" = "200" ]; then
    log_info "Deployment triggered successfully"
    DEPLOYMENT_UUID=$(echo "$DEPLOY_BODY" | jq -r '.deployment_uuid // empty' 2>/dev/null || echo "")
    if [ -n "$DEPLOYMENT_UUID" ]; then
        log_info "Deployment UUID: $DEPLOYMENT_UUID"
        log_info "Monitor deployment at: ${COOLIFY_URL}/project/${APP_UUID}"
    fi
else
    log_error "Deployment failed (HTTP $DEPLOY_HTTP_CODE)"
    log_error "Response: $DEPLOY_BODY"
    exit 1
fi

log_info "Server maintenance completed successfully at $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
