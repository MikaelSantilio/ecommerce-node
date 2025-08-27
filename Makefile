# Ecommerce Microservices Makefile

.PHONY: help install build dev prod docker-build docker-up docker-down docker-dev health clean

# Default target
help:
	@echo "Ecommerce Microservices - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make install     - Install dependencies for all services"
	@echo "  make build       - Build all services"
	@echo "  make dev         - Run all services in development mode (requires tmux)"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build - Build all Docker images"
	@echo "  make docker-up   - Run all services in Docker (production)"
	@echo "  make docker-dev  - Run all services in Docker (development)"
	@echo "  make docker-down - Stop all Docker containers"
	@echo "  make health      - Check health of all services"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean       - Clean node_modules and dist folders"
	@echo "  make clean-docker - Clean all Docker containers, volumes and images"

# Install dependencies
install:
	@echo "📦 Installing dependencies for all services..."
	@./install-all.sh

# Build all services
build:
	@echo "🔨 Building all services..."
	@npm run build:all

# Development mode with tmux
dev:
	@echo "🚀 Starting all services in development mode..."
	@./dev-all.sh

# Docker commands
docker-build:
	@echo "🐳 Building Docker images..."
	@docker-compose build

docker-up:
	@echo "🐳 Starting all services with Docker (production)..."
	@docker-compose up -d
	@echo "✅ All services started! Check status with 'make health'"

docker-dev:
	@echo "🐳 Starting all services with Docker (development)..."
	@docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ All services started in dev mode!"

docker-down:
	@echo "🐳 Stopping all Docker containers..."
	@docker-compose down
	@docker-compose -f docker-compose.dev.yml down

# Health check
health:
	@./health-check.sh

# Clean commands
clean:
	@echo "🧹 Cleaning node_modules and dist folders..."
	@rm -rf packages/*/node_modules packages/*/dist
	@echo "✅ Cleanup completed!"

clean-docker:
	@echo "🧹 Cleaning all Docker containers, volumes and images..."
	@docker-compose down -v --rmi all --remove-orphans
	@docker-compose -f docker-compose.dev.yml down -v --rmi all --remove-orphans
	@echo "✅ Docker cleanup completed!"

# Production deployment
prod: docker-build docker-up health
