#!/bin/bash

# ============================================
# Docker Deploy Script for Ecme-lite-cesar
# ============================================

set -e  # Exit on error

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

# Parse command line arguments
MODE="${1:-production}"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not available."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_warning "docker-compose not found. Trying docker compose..."
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

print_header "Deploying Ecme-lite-cesar"

if [ "$MODE" = "dev" ] || [ "$MODE" = "development" ]; then
    print_header "Starting Development Environment"
    echo "Mode: Development (with hot reload)"
    echo ""
    
    # Stop any running containers
    $DOCKER_COMPOSE -f docker-compose.dev.yml down
    
    # Start services
    $DOCKER_COMPOSE -f docker-compose.dev.yml up -d
    
    print_success "Development environment started"
    echo ""
    echo "📊 Development Services:"
    echo "   Frontend:  http://localhost:5175"
    echo "   Backend:   http://localhost:3001"
    echo ""
    echo "To view logs:"
    echo "   $DOCKER_COMPOSE -f docker-compose.dev.yml logs -f"
    echo ""
    echo "To stop services:"
    echo "   $DOCKER_COMPOSE -f docker-compose.dev.yml down"
    
elif [ "$MODE" = "prod" ] || [ "$MODE" = "production" ]; then
    print_header "Starting Production Environment"
    echo "Mode: Production"
    echo ""
    
    # Stop any running containers
    $DOCKER_COMPOSE down
    
    # Start services
    $DOCKER_COMPOSE up -d
    
    print_success "Production environment started"
    echo ""
    echo "📊 Production Services:"
    echo "   Frontend:  http://localhost"
    echo "   Backend:   http://localhost:3001"
    echo ""
    echo "To view logs:"
    echo "   $DOCKER_COMPOSE logs -f"
    echo ""
    echo "To stop services:"
    echo "   $DOCKER_COMPOSE down"
    
else
    print_error "Invalid mode: $MODE"
    echo "Usage: ./docker-deploy.sh [dev|production]"
    exit 1
fi

# Wait for services to be healthy
print_header "Checking Service Health"
sleep 5

# Check backend health
if curl -f http://localhost:3001/health &> /dev/null; then
    print_success "Backend is healthy"
else
    print_warning "Backend health check failed. It may still be starting up."
fi

# Check frontend health (only in production mode)
if [ "$MODE" = "prod" ] || [ "$MODE" = "production" ]; then
    if curl -f http://localhost/health &> /dev/null; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend health check failed. It may still be starting up."
    fi
fi

print_header "Deployment Complete"
