# Quick Start: Docker in Codespace

This is a quick reference guide for using Docker in your GitHub Codespace with Ecme-lite-cesar.

## 🚀 Quick Commands

### Development Mode (Recommended for Codespace)

Start the application in development mode with hot reload:

```bash
npm run docker:dev
```

Access your application:
- Frontend: http://localhost:5175
- Backend API: http://localhost:3001
- Backend Health: http://localhost:3001/api/health

### Production Mode

Build and run production containers:

```bash
# Build images
npm run docker:build

# Start services
npm run docker:prod
```

Access your application:
- Frontend: http://localhost (port 80)
- Backend API: http://localhost:3001

## 📋 Common Tasks

### View Logs

```bash
# Development logs
npm run docker:logs:dev

# Production logs
npm run docker:logs

# View specific service
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Stop Services

```bash
# Stop development
npm run docker:stop:dev

# Stop production
npm run docker:stop
```

### Restart Services

```bash
# Development
docker-compose -f docker-compose.dev.yml restart

# Production
docker-compose restart
```

### Check Service Status

```bash
# List running containers
docker ps

# Check health
curl http://localhost:3001/api/health
curl http://localhost/health  # Production only
```

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Kill processes on port 3001
lsof -ti:3001 | xargs kill -9

# Kill processes on port 5175 (dev) or 80 (prod)
lsof -ti:5175 | xargs kill -9
lsof -ti:80 | xargs kill -9
```

### Container Won't Start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Remove and rebuild
npm run docker:stop
docker-compose build --no-cache
npm run docker:dev
```

### Changes Not Reflected

Development mode should auto-reload. If not:

```bash
# Restart the container
docker-compose -f docker-compose.dev.yml restart frontend
```

For production mode, you need to rebuild:

```bash
npm run docker:stop
npm run docker:build
npm run docker:prod
```

## 🎯 Best Practices in Codespace

1. **Use Development Mode**: Always use `npm run docker:dev` in Codespaces for faster iteration
2. **Monitor Resources**: Check Docker stats regularly: `docker stats`
3. **Clean Up**: Periodically clean unused images: `docker system prune -a`
4. **Forward Ports**: Codespace should auto-forward ports, but verify in the Ports tab
5. **Environment Variables**: Use `.env` files for configuration (see `backend/.env.example`)

## 📚 More Information

For comprehensive documentation, see:
- [DOCKER_GUIDE.md](DOCKER_GUIDE.md) - Complete Docker setup and usage guide
- [README.md](README.md) - Project overview and installation

## 🆘 Getting Help

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Verify Docker is running: `docker ps`
3. Check port availability: `lsof -ti:3001`
4. Rebuild containers: `docker-compose build --no-cache`
5. Check service health: `curl http://localhost:3001/api/health`

## 📝 Notes

- The devcontainer is pre-configured with Docker-in-Docker support
- Volume mounts enable hot reload in development mode
- Production mode uses optimized multi-stage builds
- All services are connected via Docker network for inter-service communication
