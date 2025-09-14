# 🚀 Deploy Guide

This guide explains how to deploy the application to VPS using GitHub Actions.

## 📋 Prerequisites

### 1. Linux VPS
- Ubuntu/CentOS/Debian
- Docker and Docker Compose installed
- User with sudo permissions
- Port 3000 open in firewall

### 2. GitHub Secrets
Configure the following secrets in your GitHub repository:

| Secret | Description | Example |
|--------|-------------|---------|
| `VPS_SSH_KEY` | Content of the .pem file | `-----BEGIN RSA PRIVATE KEY-----...` |
| `VPS_HOST` | VPS IP or domain | `192.168.1.100` or `api.yourdomain.com` |
| `VPS_USER` | VPS SSH user | `ubuntu` or `root` |
| `MONGODB_URI` | MongoDB Cloud connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `DOCKER_USERNAME` | Docker Hub username | `thaleslj` |
| `DOCKER_PASSWORD` | Docker Hub access token | `dckr_pat_...` |

## 🔧 VPS Setup

### 1. Install Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Configure SSH
```bash
# Create application directory
mkdir -p ~/organizandotudo-api
cd ~/organizandotudo-api

# Configure SSH key (if needed)
ssh-keygen -t rsa -b 4096 -C "deploy@organizandotudo"
```

## 🚀 Automatic Deploy

### 1. Push to master
Deploy happens automatically when you push to the `master` branch.

### 2. Manual Deploy
You can also deploy manually:
1. Go to "Actions" tab on GitHub
2. Select "Build and Deploy to VPS"
3. Click "Run workflow"

## 🔄 How Deploy Works

### 1. Build on GitHub Actions
- ✅ Code is built on GitHub Actions
- ✅ Docker image is created and pushed to Docker Hub
- ✅ Automatic tags: `latest`, `master`, `sha-abc123`

### 2. Deploy to VPS
- ✅ Only `docker-compose.yml` and `.env` are sent to VPS
- ✅ VPS does `docker-compose pull` to download ready image
- ✅ Much faster and more efficient deploy

### 3. Advantages
- ⚡ **Fast build**: On GitHub Actions (unlimited resources)
- ⚡ **Fast deploy**: Just pull the ready image
- 💾 **Resource savings**: VPS doesn't need to build
- 🔒 **Security**: Pre-validated image on GitHub

## 🔄 Updates

To update the application:
1. Make changes to the code
2. Commit and push to `main`
3. GitHub Actions will deploy automatically
4. Application will restart with new changes
