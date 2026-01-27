#!/bin/bash

# ============================================
# Docker Validation Script for Ecme-lite-cesar
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check Docker availability
print_header "Validating Docker Setup"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not available."
    exit 1
else
    DOCKER_VERSION=$(docker --version)
    print_success "Docker is available: $DOCKER_VERSION"
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available."
        exit 1
    else
        COMPOSE_VERSION=$(docker compose version)
        print_success "Docker Compose plugin is available: $COMPOSE_VERSION"
        DOCKER_COMPOSE="docker compose"
    fi
else
    COMPOSE_VERSION=$(docker-compose --version)
    print_success "Docker Compose is available: $COMPOSE_VERSION"
    DOCKER_COMPOSE="docker-compose"
fi

# Check Docker daemon
if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running or not accessible."
    exit 1
else
    print_success "Docker daemon is running"
fi

# Validate Docker files
print_header "Validating Docker Configuration Files"

FILES=(
    "Dockerfile.frontend"
    "Dockerfile.frontend.dev"
    "Dockerfile.backend"
    "Dockerfile.backend.dev"
    "docker-compose.yml"
    "docker-compose.dev.yml"
    ".dockerignore"
    "docker-build.sh"
    "docker-deploy.sh"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file is missing"
        exit 1
    fi
done

# Validate scripts are executable
print_header "Validating Script Permissions"

SCRIPTS=("docker-build.sh" "docker-deploy.sh")

for script in "${SCRIPTS[@]}"; do
    if [ -x "$script" ]; then
        print_success "$script is executable"
    else
        print_warning "$script is not executable, fixing..."
        chmod +x "$script"
        print_success "$script made executable"
    fi
done

# Validate Docker Compose syntax
print_header "Validating Docker Compose Configuration"

if $DOCKER_COMPOSE -f docker-compose.yml config > /dev/null 2>&1; then
    print_success "docker-compose.yml is valid"
else
    print_error "docker-compose.yml has syntax errors"
    $DOCKER_COMPOSE -f docker-compose.yml config
    exit 1
fi

if $DOCKER_COMPOSE -f docker-compose.dev.yml config > /dev/null 2>&1; then
    print_success "docker-compose.dev.yml is valid"
else
    print_error "docker-compose.dev.yml has syntax errors"
    $DOCKER_COMPOSE -f docker-compose.dev.yml config
    exit 1
fi

# Check for required files
print_header "Validating Project Structure"

REQUIRED_FILES=(
    "package.json"
    "package-lock.json"
    "vite.config.ts"
    "backend/package.json"
    "backend/src/index.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file is missing"
        exit 1
    fi
done

# Test Docker build (optional, can be slow)
if [ "${1:-}" == "--build" ]; then
    print_header "Testing Docker Builds (This may take several minutes)"
    
    print_info "Building backend image..."
    if docker build -f Dockerfile.backend -t ecme-backend:test . > /tmp/backend-build.log 2>&1; then
        print_success "Backend image built successfully"
    else
        print_error "Backend build failed. Check /tmp/backend-build.log for details"
        tail -50 /tmp/backend-build.log
        exit 1
    fi
    
    print_info "Building frontend image (this may take 5-10 minutes)..."
    if timeout 600 docker build -f Dockerfile.frontend -t ecme-frontend:test . > /tmp/frontend-build.log 2>&1; then
        print_success "Frontend image built successfully"
    else
        print_error "Frontend build failed or timed out. Check /tmp/frontend-build.log for details"
        tail -50 /tmp/frontend-build.log
        exit 1
    fi
    
    # Clean up test images
    print_info "Cleaning up test images..."
    docker rmi ecme-backend:test ecme-frontend:test 2>/dev/null || true
fi

print_header "Validation Complete"
print_success "All Docker configuration files are valid and ready to use!"
echo ""
print_info "To start development environment: npm run docker:dev"
print_info "To build production images: npm run docker:build"
print_info "To deploy production: npm run docker:prod"
echo ""
if [ "${1:-}" != "--build" ]; then
    print_info "To test builds: ./docker-validate.sh --build"
fi
