#!/usr/bin/env bash

# ============================================
# AWS ECR Push Script for Servilogics App
# Uses AWS Free Tier ECR to push Docker images
# ============================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-}"
IMAGE_PREFIX="servilogics"
VERSION="${1:-latest}"

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error()   { echo -e "${RED}✗ $1${NC}"; }

# ---- Pre-flight checks ----
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Install it from https://aws.amazon.com/cli/"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed."
    exit 1
fi

if [ -z "$AWS_ACCOUNT_ID" ]; then
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || true)
    if [ -z "$AWS_ACCOUNT_ID" ]; then
        print_error "AWS_ACCOUNT_ID is not set and could not be detected. Run 'aws configure' first."
        exit 1
    fi
fi

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

print_header "Pushing Docker Images to AWS ECR (Free Tier)"
echo "Registry : ${ECR_REGISTRY}"
echo "Region   : ${AWS_REGION}"
echo "Version  : ${VERSION}"
echo ""

# ---- Authenticate Docker with ECR ----
print_header "Authenticating with ECR"
aws ecr get-login-password --region "${AWS_REGION}" | \
  docker login --username AWS --password-stdin "${ECR_REGISTRY}"
print_success "ECR authentication successful"

# ---- Create repositories if they don't exist ----
for REPO in "${IMAGE_PREFIX}-backend" "${IMAGE_PREFIX}-frontend"; do
    if ! aws ecr describe-repositories --repository-names "${REPO}" --region "${AWS_REGION}" &> /dev/null; then
        echo "Creating ECR repository: ${REPO}"
        aws ecr create-repository \
            --repository-name "${REPO}" \
            --region "${AWS_REGION}" \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES256
        print_success "Repository created: ${REPO}"
    else
        print_success "Repository exists: ${REPO}"
    fi
done

# ---- Build images ----
print_header "Building Docker Images"
docker build -f Dockerfile.backend  -t "${IMAGE_PREFIX}-backend:${VERSION}"  .
docker build -f Dockerfile.frontend -t "${IMAGE_PREFIX}-frontend:${VERSION}" .
print_success "Images built"

# ---- Tag and push ----
for REPO in backend frontend; do
    FULL="${ECR_REGISTRY}/${IMAGE_PREFIX}-${REPO}"
    docker tag "${IMAGE_PREFIX}-${REPO}:${VERSION}" "${FULL}:${VERSION}"
    docker tag "${IMAGE_PREFIX}-${REPO}:${VERSION}" "${FULL}:latest"

    print_header "Pushing ${IMAGE_PREFIX}-${REPO}"
    docker push "${FULL}:${VERSION}"
    docker push "${FULL}:latest"
    print_success "Pushed ${FULL}:${VERSION}"
done

print_header "Push Complete"
echo "Images available at:"
echo "  ${ECR_REGISTRY}/${IMAGE_PREFIX}-backend:${VERSION}"
echo "  ${ECR_REGISTRY}/${IMAGE_PREFIX}-frontend:${VERSION}"
echo ""
echo "To pull on another machine:"
echo "  aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"
echo "  docker pull ${ECR_REGISTRY}/${IMAGE_PREFIX}-backend:${VERSION}"
echo "  docker pull ${ECR_REGISTRY}/${IMAGE_PREFIX}-frontend:${VERSION}"
