# 📝 OrganizandoTudo API

A modern, secure, and scalable REST API for managing users and notes with JWT authentication, data encryption, and soft delete functionality.

## 🚀 Features

- **🔐 JWT Authentication** - Secure user authentication with JWT tokens
- **🔒 Data Encryption** - Sensitive data (notes content) encrypted with AES-256-GCM
- **🛡️ Password Hashing** - Passwords hashed with bcrypt (irreversible)
- **🗑️ Soft Delete** - Notes are marked as deleted, not permanently removed
- **📄 Pagination** - Efficient data loading with pagination support
- **🔍 Search** - Full-text search across notes
- **🌐 Public/Private Notes** - Toggle note visibility
- **📊 API Documentation** - Complete OpenAPI 3.0 specification
- **🐳 Docker Ready** - Containerized with Docker and Docker Compose
- **🚀 Auto Deploy** - Automated deployment with GitHub Actions

## 🛠️ Tech Stack

### **Backend**
- **Node.js** - JavaScript runtime
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **crypto** - Data encryption (AES-256-GCM)

### **DevOps & Deployment**
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD pipeline
- **Docker Hub** - Container registry
- **Linux VPS** - Production hosting in AWS

### **Security & Validation**
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **class-validator** - Data validation
- **class-transformer** - Data transformation
- **compression** - Response compression

## 📋 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### **Users**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### **Notes**
- `GET /api/notes` - List user notes (paginated)
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Soft delete note
- `PATCH /api/notes/:id/toggle-public` - Toggle note visibility

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- Docker
- MongoDB (local or cloud)

### **1. Clone Repository**
```bash
git clone https://github.com/thaleslj/organizandotudo.api.git
cd organizandotudo.api
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://USER:PASSWORD@SERVER/OrganizandoTudo

# Encryption
ENCRYPTION_KEY=your-encryption-key-here

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=30d
```

### **4. Run Application**

#### **Development Mode**
```bash
# Start with hot reload
npm run start:dev

# Or start normally
npm run start
```

#### **Production Mode**
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

### **5. Test API**
```bash
# Health check
curl http://localhost:3000/api

## 🐳 Docker Deployment

### **Local Docker**
```bash
# Build image
docker build -t organizandotudo-api .

# Run container
docker run -p 3000:3000 --env-file .env organizandotudo-api
```

### **Docker Compose**
```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f api
```

## 🚀 Automatic Deployment

This project includes automated deployment using GitHub Actions:

### **How It Works**
1. **Code Push** → Push to `master` branch
2. **GitHub Actions** → Builds Docker image
3. **Docker Hub** → Pushes image to registry
4. **VPS Deploy** → Pulls and runs new image

### **Setup Requirements**
1. **VPS with Docker** installed
2. **GitHub Secrets** configured:
   - `VPS_SSH_KEY` - SSH private key
   - `VPS_HOST` - VPS IP/domain
   - `VPS_USER` - SSH username
   - `MONGODB_URI` - Database connection
   - `DOCKER_USERNAME` - Docker Hub username
   - `DOCKER_PASSWORD` - Docker Hub token

### **Deploy Process**
```bash
# 1. Make changes
git add .
git commit -m "feat: new feature"
git push origin master

# 2. GitHub Actions automatically:
#    - Builds Docker image
#    - Pushes to Docker Hub
#    - Deploys to VPS
#    - Restarts application
```

For detailed deployment instructions, see [DEPLOY.md](./DEPLOY.md).

## 👨‍💻 Author

**Thales LJ**
- GitHub: [@thaleslj](https://github.com/thaleslj)
- Email: thaleslimadejesus@gmail.com

## 🆘 Support

- **Documentation**: Check the API documentation files
- **Issues**: Open an issue on GitHub
- **Email**: thaleslimadejesus@gmail.com

---
