# JOBGATE Appointment System

![Python](https://img.shields.io/badge/python-v3.10+-blue.svg)
![Django](https://img.shields.io/badge/django-v4.2+-green.svg)
![React](https://img.shields.io/badge/react-v18+-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-v5+-blue.svg)
![Docker](https://img.shields.io/badge/docker-compose-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A comprehensive web application designed to streamline appointment management between universities, staff, and external talents or recruiters. Built with Django REST Framework backend and React TypeScript frontend.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core Functionality
- **Multi-role Authentication**: Support for Admin, University Staff, Talent, and Recruiter roles
- **Appointment Management**: Create, book, cancel, and manage appointments
- **Calendar Integration**: Interactive calendar with slot management
- **University Profiles**: Manage university information and staff assignments
- **Agenda System**: Flexible appointment themes and scheduling
- **Real-time Notifications**: Email reminders and system notifications

### 🔧 Advanced Features
- **Background Tasks**: Asynchronous processing with Celery
- **AI Integration**: CrewAI for intelligent automation
- **Statistics & Analytics**: Comprehensive reporting dashboard
- **File Management**: Attachment support for appointments
- **Multi-language Support**: Internationalization ready

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Core language |
| Django | 4.2+ | Web framework |
| Django REST Framework | 3.14+ | API development |
| PostgreSQL | 16 | Database |
| Redis | Latest | Cache & message broker |
| Celery | 5.3+ | Background tasks |
| CrewAI | Latest | AI automation |
| Docker | Latest | Containerization |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18+ | UI framework |
| TypeScript | 5+ | Type safety |
| Vite | 5+ | Build tool |
| Material-UI | 6+ | UI components |
| Zustand | 4+ | State management |
| React Query | 5+ | Data fetching |
| Axios | 1+ | HTTP client |

## 📁 Project Structure

```
jobgate_appointment_system/
├── 📁 backend/
│   ├── 📁 appointments/          # Appointment management app
│   ├── 📁 common/               # Shared utilities
│   ├── 📁 universities/         # University management
│   ├── 📁 users/               # User authentication & profiles
│   ├── 📁 crewai-service/      # AI automation service
│   ├── 🐳 docker-compose.yml   # Container orchestration
│   └── 📄 requirements.txt     # Python dependencies
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable React components
│   │   ├── 📁 pages/          # Application pages
│   │   ├── 📁 services/       # API service layers
│   │   ├── 📁 stores/         # Zustand state stores
│   │   ├── 📁 types/          # TypeScript definitions
│   │   └── 📁 utils/          # Utility functions
│   ├── 📄 package.json        # Frontend dependencies
│   └── ⚡ vite.config.ts      # Vite configuration
└── 📖 README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:
- [Docker](https://www.docker.com/products/docker-desktop) (with Docker Compose)
- [Node.js](https://nodejs.org/) (v18+ for frontend development)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/jobgate-appointment-system.git
cd jobgate-appointment-system
```

### 2. Environment Setup

Create the environment file for backend services:

```bash
cp backend/envs/.env.example backend/envs/.env.dev
```

Edit `backend/envs/.env.dev` with your configuration:

```env
# Django Settings
DEBUG=True
SECRET_KEY=your_super_secret_key_here
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database
DB_NAME=jobgate_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# Redis & Celery
REDIS_URL=redis://redis:6379/1
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# JWT Configuration
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=7
JWT_SIGNING_KEY=your_jwt_signing_key

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Frontend URLs
VITE_API_URL=http://localhost:8001/api
VITE_ENABLE_DEVTOOLS=true
```

### 3. Start Backend Services

```bash
# Build and start all backend services
docker-compose up --build -d

# Initialize database
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Load sample data (optional)
docker-compose exec backend python manage.py loaddata fixtures/sample_data.json
```

### 4. Start Frontend Development Server

```bash
cd frontend
npm install
npm run dev
```

### 5. Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main application |
| **Backend API** | http://localhost:8001/api | REST API |
| **Admin Panel** | http://localhost:8001/admin | Django admin |
| **Flower** | http://localhost:9000 | Celery monitoring |

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Enable debug mode | `True` |
| `SECRET_KEY` | Django secret key | Required |
| `DB_NAME` | Database name | `jobgate_db` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379/1` |
| `JWT_ACCESS_TOKEN_LIFETIME` | Access token lifetime (minutes) | `60` |
| `JWT_REFRESH_TOKEN_LIFETIME` | Refresh token lifetime (days) | `7` |

### Docker Services

The application runs the following services:

- **db**: PostgreSQL database (port 5431)
- **backend**: Django application (port 8001)
- **worker**: Celery worker for background tasks
- **redis**: Redis server (port 6371)
- **crewai**: AI automation service (port 80)
- **flower**: Celery monitoring (port 9000)

## 📚 API Documentation

### Authentication

All API endpoints require JWT authentication except for registration and login.

#### Get Access Token
```http
POST /api/auth/jwt/create/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Use Token
```http
Authorization: Bearer <access_token>
```

### Key Endpoints

#### User Management
```http
POST   /api/auth/registration/           # Register new user
GET    /api/auth/users/me/              # Get current user profile
PATCH  /api/users/profile/              # Update user profile
GET    /api/users/preferences/          # Get user preferences
```

#### Universities
```http
GET    /api/universities/               # List universities
POST   /api/universities/               # Create university (admin only)
GET    /api/universities/{id}/          # Get university details
GET    /api/universities/my-universities/ # Get user's university
```

#### Appointments
```http
GET    /api/appointments/themes/        # List appointment themes
GET    /api/appointments/agendas/       # List agendas
POST   /api/appointments/agendas/       # Create agenda
GET    /api/appointments/slots/         # List calendar slots
POST   /api/appointments/book/          # Book appointment
POST   /api/appointments/{id}/cancel/   # Cancel appointment
GET    /api/appointments/statistics/    # Get statistics
```

## 💻 Development

### Backend Development

```bash
# Run tests
docker-compose exec backend python manage.py test

# Create migrations
docker-compose exec backend python manage.py makemigrations

# Apply migrations
docker-compose exec backend python manage.py migrate

# Shell access
docker-compose exec backend python manage.py shell

# View logs
docker-compose logs backend -f
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

### Code Quality

#### Backend
- **Linting**: Follow PEP 8 standards
- **Testing**: Use Django's test framework
- **Documentation**: Docstrings for all functions/classes

#### Frontend
- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured with React and TypeScript rules
- **Prettier**: Code formatting
- **Testing**: Jest and React Testing Library

## 🚢 Deployment

### Production Environment

1. **Environment Configuration**
```bash
# Create production environment file
cp backend/envs/.env.example backend/envs/.env.prod

# Update with production values
SECRET_KEY=strong_production_secret_key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DB_PASSWORD=strong_database_password
```

2. **Build and Deploy**
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with production compose
docker-compose -f docker-compose.prod.yml up -d

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

### CI/CD Pipeline

The project includes GitHub Actions workflows for:
- ✅ Automated testing
- 🔍 Code quality checks
- 🚀 Deployment to staging/production
- 📦 Docker image building

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests for new functionality**
5. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Commit Convention

We use [Conventional Commits](https://conventionalcommits.org/):
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d db
docker-compose exec backend python manage.py migrate
```

#### Frontend Build Issues
```bash
# Clear node modules and reinstall
rm -rf frontend/node_modules frontend/package-lock.json
cd frontend && npm install
```

#### Port Conflicts
If you encounter port conflicts, update the ports in `docker-compose.yml`:
```yaml
services:
  backend:
    ports:
      - "8002:8000"  # Change from 8001 to 8002
```

### Getting Help

- 📧 **Email**: support@jobgate.com
- 💬 **Discord**: [Join our community](https://discord.gg/jobgate)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-username/jobgate-appointment-system/issues)
- 📖 **Documentation**: [Full Documentation](https://docs.jobgate.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Django REST Framework team for the excellent API framework
- React team for the fantastic frontend library
- Material-UI team for the beautiful components
- All contributors who helped make this project possible

---

<div align="center">
  <p>Made with ❤️ by the JOBGATE Team</p>
  <p>
    <a href="https://github.com/your-username/jobgate-appointment-system">🌟 Star us on GitHub</a> •
    <a href="https://twitter.com/jobgate">🐦 Follow on Twitter</a> •
    <a href="https://linkedin.com/company/jobgate">💼 Connect on LinkedIn</a>
  </p>
</div>
