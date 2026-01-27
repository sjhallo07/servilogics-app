#!/bin/bash

# ============================================
# Docker Build Script for Ecme-lite-cesar
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_PREFIX="ecme"
VERSION="${1:-latest}"

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not available."
    exit 1
fi

print_header "Building Docker Images for Ecme-lite-cesar"

echo "Version: ${VERSION}"
echo ""

# Build backend image
print_header "Building Backend Image"
docker build -f Dockerfile.backend -t ${IMAGE_PREFIX}-backend:${VERSION} .
print_success "Backend image built: ${IMAGE_PREFIX}-backend:${VERSION}"

# Build frontend image
print_header "Building Frontend Image"
docker build -f Dockerfile.frontend -t ${IMAGE_PREFIX}-frontend:${VERSION} .
print_success "Frontend image built: ${IMAGE_PREFIX}-frontend:${VERSION}"

# Tag as latest if version is not latest
if [ "$VERSION" != "latest" ]; then
    docker tag ${IMAGE_PREFIX}-backend:${VERSION} ${IMAGE_PREFIX}-backend:latest
    docker tag ${IMAGE_PREFIX}-frontend:${VERSION} ${IMAGE_PREFIX}-frontend:latest
    print_success "Images tagged as latest"
fi

print_header "Build Complete"
echo "Images built successfully:"
echo "  - ${IMAGE_PREFIX}-backend:${VERSION}"
echo "  - ${IMAGE_PREFIX}-frontend:${VERSION}"
echo ""
echo "To run the application:"
echo "  docker-compose up -d"
echo ""
echo "To run in development mode:"
echo "  docker-compose -f docker-compose.dev.yml up"
