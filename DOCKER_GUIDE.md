# Docker Setup and Deployment Guide

This guide explains how to build and deploy the Ecme-lite-cesar application using Docker in GitHub Codespaces or any Docker-enabled environment.

## Prerequisites

- Docker (with Docker-in-Docker support in Codespaces)
- Docker Compose (or `docker compose` plugin)
- Git

## Architecture

The application consists of two main services:

1. **Frontend**: React + TypeScript + Vite application served via Nginx
2. **Backend**: Node.js + Express API server

## Quick Start

### Development Mode (with Hot Reload)

To start the application in development mode with hot reloading:

```bash
# Using npm script
npm run docker:dev

# Or directly with docker-compose
docker-compose -f docker-compose.dev.yml up
```

This will start:
- Frontend on http://localhost:5175 (with hot reload)
- Backend on http://localhost:3001 (with hot reload)

### Production Mode

To build and run the application in production mode:

```bash
# Build Docker images
npm run docker:build

# Deploy to production
npm run docker:prod

# Or directly with docker-compose
docker-compose up -d
```

This will start:
- Frontend on http://localhost (port 80)
- Backend on http://localhost:3001

## Docker Commands

### Building Images

Build Docker images with a specific version tag:

```bash
./docker-build.sh v1.2.0
```

Or build with default latest tag:

```bash
./docker-build.sh
# or
npm run docker:build
```

### Deployment

Deploy in development mode:

```bash
./docker-deploy.sh dev
# or
npm run docker:dev
```

Deploy in production mode:

```bash
./docker-deploy.sh production
# or
npm run docker:prod
```

### Viewing Logs

View logs in development mode:

```bash
docker-compose -f docker-compose.dev.yml logs -f
# or
npm run docker:logs:dev
```

View logs in production mode:

```bash
docker-compose logs -f
# or
npm run docker:logs
```

View specific service logs:

```bash
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Stopping Services

Stop development services:

```bash
docker-compose -f docker-compose.dev.yml down
# or
npm run docker:stop:dev
```

Stop production services:

```bash
docker-compose down
# or
npm run docker:stop
```

### Managing Containers

List running containers:

```bash
docker ps
```

Execute commands in a running container:

```bash
docker exec -it ecme-frontend sh
docker exec -it ecme-backend sh
```

View container resource usage:

```bash
docker stats
```

## File Structure

```
.
├── Dockerfile.frontend          # Production frontend Dockerfile
├── Dockerfile.frontend.dev      # Development frontend Dockerfile
├── Dockerfile.backend           # Production backend Dockerfile
├── Dockerfile.backend.dev       # Development backend Dockerfile
├── docker-compose.yml           # Production orchestration
├── docker-compose.dev.yml       # Development orchestration
├── docker-build.sh              # Build script
├── docker-deploy.sh             # Deployment script
├── .dockerignore                # Files to exclude from Docker context
└── .devcontainer/
    └── devcontainer.json        # Codespace configuration with Docker support
```

## Environment Variables

### Backend Environment Variables

Configure in `docker-compose.yml` or create a `.env` file:

```env
NODE_ENV=production
PORT=3001
AGENT_HOST_ALLOWLIST=localhost,127.0.0.1,api.openai.com,*.openai.azure.com
AGENT_TIMEOUT_MS=60000
AGENT_MAX_REQ_BODY=262144
AGENT_MAX_NONSTREAM_RESP=2097152
AGENT_SSE_HEARTBEAT_MS=15000
```

## Docker in GitHub Codespaces

The devcontainer is configured with Docker-in-Docker support:

1. **Docker-in-Docker Feature**: Enables running Docker commands inside the Codespace
2. **Docker Socket Mounting**: Allows access to the host Docker daemon
3. **Docker Extension**: VS Code Docker extension for managing containers

### Using Docker in Codespaces

Once your Codespace is created:

1. Open the integrated terminal
2. All Docker commands are available
3. Use the provided scripts or npm commands

```bash
# Check Docker is available
docker --version
docker-compose --version

# Build and deploy
npm run docker:build
npm run docker:dev
```

## Health Checks

Both services include health checks:

### Backend Health Check

```bash
curl http://localhost:3001/health
```

### Frontend Health Check

```bash
curl http://localhost/health
```

## Troubleshooting

### Docker Not Available

If Docker is not available in your Codespace:

1. Rebuild the Codespace to apply devcontainer changes
2. Check that Docker-in-Docker feature is enabled
3. Verify Docker socket is mounted

### Port Already in Use

If ports are already in use:

```bash
# Stop existing services
docker-compose down
docker-compose -f docker-compose.dev.yml down

# Or kill processes on specific ports
lsof -ti:3001 | xargs kill -9
lsof -ti:5175 | xargs kill -9
```

### Container Build Failures

Check build logs:

```bash
docker-compose build --no-cache
```

View detailed build output:

```bash
docker build -f Dockerfile.frontend -t ecme-frontend:latest . --progress=plain
```

### Permission Issues

If you encounter permission issues:

```bash
# Ensure scripts are executable
chmod +x docker-build.sh docker-deploy.sh

# Check file ownership in containers
docker exec -it ecme-backend ls -la /app
```

### Network Issues

Reset Docker network:

```bash
docker-compose down
docker network prune
docker-compose up -d
```

## Volume Management

### View Volumes

```bash
docker volume ls
```

### Inspect Volume

```bash
docker volume inspect ecme-lite-cesar_backend-data
```

### Remove Volumes

```bash
docker-compose down -v
```

## Best Practices

1. **Development**: Always use `docker-compose.dev.yml` for local development
2. **Production**: Use `docker-compose.yml` for production deployments
3. **Logs**: Regularly check logs for errors and issues
4. **Updates**: Rebuild images after code changes in production mode
5. **Cleanup**: Periodically clean up unused images and containers

```bash
# Remove unused images
docker image prune -a

# Remove unused containers
docker container prune

# Remove unused volumes
docker volume prune

# Clean everything
docker system prune -a --volumes
```

## CI/CD Integration

The Docker setup can be integrated with CI/CD pipelines:

```bash
# Build
./docker-build.sh ${VERSION}

# Tag for registry
docker tag ecme-frontend:${VERSION} registry.example.com/ecme-frontend:${VERSION}
docker tag ecme-backend:${VERSION} registry.example.com/ecme-backend:${VERSION}

# Push to registry
docker push registry.example.com/ecme-frontend:${VERSION}
docker push registry.example.com/ecme-backend:${VERSION}
```

## Performance Optimization

### Multi-stage Builds

The frontend Dockerfile uses multi-stage builds to minimize final image size:
- Build stage: Full Node.js environment
- Production stage: Lightweight Nginx Alpine image

### Caching

Docker layer caching is optimized by:
1. Installing dependencies before copying source code
2. Using `.dockerignore` to exclude unnecessary files
3. Leveraging npm ci for reproducible builds

### Security

Security best practices implemented:
1. Non-root user in containers
2. Security headers in Nginx
3. Health checks for monitoring
4. Minimal base images (Alpine Linux)

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify service health: `curl http://localhost:3001/health`
3. Review container status: `docker ps -a`
4. Check resource usage: `docker stats`

## License

Private - All rights reserved © 2026 Marcos Mora
