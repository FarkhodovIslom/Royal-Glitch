# Docker Setup for Royal Glitch

This document provides instructions for running the Royal Glitch application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed (usually comes with Docker Desktop)

## Quick Start

### Production Mode

Build and run the application in production mode:

```bash
# Build and start containers
docker-compose up --build

# Run in detached mode (background)
docker-compose up -d --build
```

The application will be available at:
- **Client**: http://localhost:3000
- **Server**: http://localhost:3001

### Development Mode

For development with hot reload:

```bash
# Build and start development containers
docker-compose -f docker-compose.dev.yml up --build

# Run in detached mode
docker-compose -f docker-compose.dev.yml up -d --build
```

## Available Commands

### Start Containers
```bash
# Production
docker-compose up

# Development
docker-compose -f docker-compose.dev.yml up
```

### Stop Containers
```bash
# Production
docker-compose down

# Development
docker-compose -f docker-compose.dev.yml down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
```

### Rebuild Containers
```bash
# Production
docker-compose up --build

# Development
docker-compose -f docker-compose.dev.yml up --build

# Force rebuild without cache
docker-compose build --no-cache
```

### Execute Commands in Containers
```bash
# Server
docker-compose exec server sh

# Client
docker-compose exec client sh
```

## Environment Variables

You can customize environment variables by creating a `.env` file in the root directory:

```env
# Server
PORT=3001
CLIENT_URL=http://localhost:3000

# Client
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

For production deployments, update the `NEXT_PUBLIC_SOCKET_URL` to point to your server's actual URL.

## Docker Architecture

The setup includes:

- **Multi-stage builds**: Optimized production images with separate build and runtime stages
- **Development mode**: Hot reload support with volume mounting
- **Networking**: Isolated Docker network for inter-service communication
- **Health checks**: Server health monitoring
- **Volume management**: Persistent data and optimized node_modules handling

## Troubleshooting

### Port Conflicts
If ports 3000 or 3001 are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Change host port
```

### Container Restart
If containers stop unexpectedly:

```bash
# View logs
docker-compose logs

# Restart specific service
docker-compose restart server
```

### Clean Rebuild
To completely rebuild from scratch:

```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Rebuild
docker-compose up --build
```

### Development Hot Reload Not Working
If hot reload isn't working in development mode, ensure:
1. Volume mounts are correct in `docker-compose.dev.yml`
2. Your Docker installation supports file watching (required on Windows/Mac)

## Production Deployment

For production deployment:

1. Update environment variables in `.env` or `docker-compose.yml`
2. Consider using a reverse proxy (nginx, traefik) for SSL/TLS
3. Set up proper logging and monitoring
4. Use Docker secrets for sensitive data
5. Consider using Docker Swarm or Kubernetes for orchestration

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker-compose)
