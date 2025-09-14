#!/bin/bash

# Deploy script for VPS (using Docker Hub image)
# Usage: ./scripts/deploy.sh

set -e

echo "🚀 Starting deployment..."

# Check if required environment variables are set
if [ -z "$VPS_HOST" ] || [ -z "$VPS_USER" ] || [ -z "$MONGODB_URI" ]; then
    echo "❌ Error: Required environment variables not set"
    echo "Please set: VPS_HOST, VPS_USER, MONGODB_URI"
    exit 1
fi

# Create production .env file
echo "📝 Creating production .env file..."
echo "MONGODB_URI=$MONGODB_URI" > .env

# Copy docker-compose and env to VPS
echo "📤 Copying docker-compose and env to VPS..."
scp docker-compose.yml $VPS_USER@$VPS_HOST:~/organizandotudo-api/
scp .env $VPS_USER@$VPS_HOST:~/organizandotudo-api/

# Deploy on VPS
echo "🔧 Deploying on VPS..."
ssh $VPS_USER@$VPS_HOST << 'EOF'
    cd ~/organizandotudo-api
    
    # Stop existing containers (only this project)
    echo "🛑 Stopping existing containers..."
    docker-compose down || true
    
    # Remove old images to free space
    echo "🧹 Cleaning up old images..."
    docker image prune -f
    
    # Pull latest image and start containers
    echo "📥 Pulling latest image from Docker Hub..."
    docker-compose pull
    
    echo "🚀 Starting containers..."
    docker-compose up -d
    
    # Show logs
    echo "📊 Showing recent logs..."
    docker-compose logs --tail=50
EOF
