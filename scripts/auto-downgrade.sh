#!/bin/bash
# Auto-Downgrade System for NPM Dependencies
# This script finds the latest working version of a dependency by testing versions
# between the current version and the failed update version.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Parse command line arguments
PACKAGE_NAME="$1"
CURRENT_VERSION="$2"
FAILED_VERSION="$3"

if [ -z "$PACKAGE_NAME" ] || [ -z "$CURRENT_VERSION" ] || [ -z "$FAILED_VERSION" ]; then
    log_error "Usage: $0 <package-name> <current-version> <failed-version>"
    log_error "Example: $0 next 14.0.0 14.2.0"
    exit 1
fi

log_info "Starting auto-downgrade process"
log_info "Package: $PACKAGE_NAME"
log_info "Current version: $CURRENT_VERSION"
log_info "Failed version: $FAILED_VERSION"

# Fetch all available versions from npm (stable versions only)
log_info "Fetching available stable versions from npm..."
ALL_VERSIONS=$(npm view "$PACKAGE_NAME" versions --json | jq -r '.[]' | \
  grep -v -E '(alpha|beta|rc|canary|next)' | sort -V)

if [ -z "$ALL_VERSIONS" ]; then
    log_error "Could not fetch versions for package $PACKAGE_NAME"
    exit 1
fi

# Filter versions between current and failed (exclusive)
log_info "Filtering versions between $CURRENT_VERSION and $FAILED_VERSION..."
CANDIDATE_VERSIONS=$(echo "$ALL_VERSIONS" | awk -v current="$CURRENT_VERSION" -v failed="$FAILED_VERSION" '
    BEGIN { include = 0 }
    $0 == current { include = 1; next }
    $0 == failed { include = 0 }
    include { print }
' | sort -Vr)  # Sort in reverse to test newest first

if [ -z "$CANDIDATE_VERSIONS" ]; then
    log_warn "No versions found between $CURRENT_VERSION and $FAILED_VERSION"
    log_info "Staying with current version $CURRENT_VERSION"
    exit 0
fi

VERSION_COUNT=$(echo "$CANDIDATE_VERSIONS" | wc -l | tr -d ' ')
log_info "Found $VERSION_COUNT candidate versions to test"

# Test each version (newest first)
FOUND_WORKING_VERSION=""
for VERSION in $CANDIDATE_VERSIONS; do
    log_info "Testing version $VERSION..."
    
    # Create a backup of package.json and package-lock.json
    cp package.json package.json.backup
    cp package-lock.json package-lock.json.backup 2>/dev/null || true
    
    # Try installing the version
    log_info "Installing $PACKAGE_NAME@$VERSION..."
    if npm install --legacy-peer-deps "${PACKAGE_NAME}@${VERSION}" > /tmp/npm-install.log 2>&1; then
        log_info "Installation successful, testing build..."
        
        # Try building
        if npm run build > /tmp/npm-build.log 2>&1; then
            log_info "Build successful with version $VERSION!"
            FOUND_WORKING_VERSION="$VERSION"
            break
        else
            log_warn "Build failed with version $VERSION"
            cat /tmp/npm-build.log
        fi
    else
        log_warn "Installation failed with version $VERSION"
        cat /tmp/npm-install.log
    fi
    
    # Restore backup
    mv package.json.backup package.json
    mv package-lock.json.backup package-lock.json 2>/dev/null || true
    
    # Clean up node_modules
    rm -rf node_modules
    npm install --legacy-peer-deps > /dev/null 2>&1 || true
done

# Report results
if [ -n "$FOUND_WORKING_VERSION" ]; then
    log_info "SUCCESS: Found working version $FOUND_WORKING_VERSION"
    echo "$FOUND_WORKING_VERSION" > /tmp/working-version.txt
    exit 0
else
    log_error "FAILURE: No working version found between $CURRENT_VERSION and $FAILED_VERSION"
    log_warn "Recommendation: Stay with current version $CURRENT_VERSION"
    echo "$CURRENT_VERSION" > /tmp/working-version.txt
    exit 1
fi
