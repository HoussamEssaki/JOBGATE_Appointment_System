# JOBGATE Appointment System

A comprehensive appointment management system designed for universities to manage career counseling, academic advising, and other appointment-based services for students and talents.

## 🚀 Features

### Core Functionality
- **User Management**: Multi-role system (Admin, University Staff, Talents)
- **Appointment Booking**: Real-time calendar-based appointment scheduling
- **Agenda Management**: Flexible appointment types and themes
- **Calendar Integration**: Visual calendar interface with availability management
- **Email Notifications**: Automated confirmations, reminders, and cancellations
- **Real-time Updates**: Live appointment status updates

### Advanced Features
- **n8n Integration**: Workflow automation for notifications and integrations
- **Multi-University Support**: Manage multiple universities in one system
- **Responsive Design**: Mobile-friendly interface
- **API-First Architecture**: RESTful API for integrations
- **Background Tasks**: Celery-powered email sending and reminders
- **Audit Logging**: Complete activity tracking
- **Statistics & Reporting**: Appointment analytics and insights

## 🛠 Technology Stack

### Backend
- **Framework**: Django 5.2.4 with Django REST Framework
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Task Queue**: Celery with Redis broker
- **Authentication**: JWT-based authentication
- **API Documentation**: Django REST Framework browsable API

### Frontend
- **Framework**: React.js 18 with Vite
- **State Management**: React Query (TanStack Query)
- **UI Components**: Custom components with modern CSS
- **Calendar**: React Big Calendar
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: NGINX (reverse proxy & static files)
- **Process Management**: Docker Compose orchestration
- **Automation**: n8n workflow engine
- **Monitoring**: Health checks and logging

## 📋 Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git
- 4GB+ RAM
- 10GB+ disk space

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd jobgate_project
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Deploy the System
```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy complete system
./deploy.sh deploy
```

### 4. Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api/
- **Admin Panel**: http://localhost/admin/

### Default Credentials
- **Username**: admin
- **Password**: admin123

⚠️ **Important**: Change the default password after first login!

## 📖 Detailed Setup

### Environment Configuration

Edit the `.env` file with your specific configuration:

```bash
# Database
DB_NAME=jobgate_db
DB_USER=jobgate_user
DB_PASSWORD=your_secure_password

# Email (Gmail example)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Security
SECRET_KEY=your-long-random-secret-key
```

### Manual Deployment

If you prefer manual deployment:

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### Development Setup

For development with hot reloading:

```bash
# Start only database and Redis
docker-compose up -d postgres redis

# Run backend locally
cd backend
pip install -r requirements.txt
python manage.py runserver

# Run frontend locally (in another terminal)
cd frontend/jobgate_frontend
pnpm install
pnpm run dev
```

## 🔧 Management Commands

### Deployment Script Usage

```bash
# Deploy complete system
./deploy.sh deploy

# Start services
./deploy.sh start

# Stop services
./deploy.sh stop

# View logs
./deploy.sh logs
./deploy.sh logs backend

# Create backup
./deploy.sh backup

# Restore from backup
./deploy.sh restore backups/backup_file.sql

# Update system
./deploy.sh update

# Cleanup
./deploy.sh cleanup
```

### Docker Compose Commands

```bash
# View service status
docker-compose ps

# View logs
docker-compose logs -f [service_name]

# Execute commands in containers
docker-compose exec backend python manage.py shell
docker-compose exec postgres psql -U jobgate_user jobgate_db

# Scale services
docker-compose up -d --scale celery_worker=3
```

## 📊 Database Schema

The system uses a comprehensive database schema with the following main entities:

- **Users**: Multi-role user management
- **Universities**: Institution management
- **Agendas**: Appointment type definitions
- **Calendar Slots**: Available time slots
- **Appointments**: Booking records
- **Email Reminders**: Notification tracking
- **Audit Logs**: Activity tracking

See `database/README.md` for detailed schema documentation.

## 🔌 API Documentation

### Authentication
```bash
# Login
POST /api/auth/login/
{
  "username": "user@example.com",
  "password": "password"
}

# Response
{
  "access": "jwt_token",
  "refresh": "refresh_token",
  "user": {...}
}
```

### Appointments
```bash
# List appointments
GET /api/appointments/

# Create appointment
POST /api/appointments/
{
  "calendar_slot": 1,
  "talent_notes": "Looking forward to the session"
}

# Cancel appointment
DELETE /api/appointments/{id}/
```

### Calendar Slots
```bash
# List available slots
GET /api/calendar-slots/?agenda=1&date=2024-01-15

# Create slot (staff only)
POST /api/calendar-slots/
{
  "agenda": 1,
  "slot_date": "2024-01-15",
  "start_time": "14:00",
  "end_time": "15:00",
  "meeting_type": "online"
}
```

## 📧 Email Notifications

The system sends automated emails for:

- **Appointment Confirmations**: Sent immediately after booking
- **Appointment Reminders**: 24 hours and 2 hours before appointments
- **Cancellation Notices**: When appointments are cancelled
- **Staff Notifications**: When new appointments are booked

### Email Templates

Email templates are customizable and include:
- HTML and plain text versions
- University branding
- Appointment details
- Action buttons and links

## 🔄 n8n Integration

The system integrates with n8n for advanced workflow automation:

### Setup n8n Workflows

1. Import workflow from `backend/n8n_workflows/appointment_notifications.json`
2. Configure credentials (SendGrid, Slack, etc.)
3. Update webhook URL in Django settings
4. Test the integration

### Supported Integrations

- **Email**: SendGrid, SMTP
- **SMS**: Twilio, AWS SNS
- **Chat**: Slack, Microsoft Teams
- **Analytics**: Google Analytics, Mixpanel
- **CRM**: Salesforce, HubSpot

## 🔒 Security

### Security Features

- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based access control
- **HTTPS**: SSL/TLS encryption (production)
- **CSRF Protection**: Cross-site request forgery protection
- **Rate Limiting**: API rate limiting
- **Input Validation**: Comprehensive input sanitization
- **Security Headers**: HSTS, CSP, X-Frame-Options

### Security Best Practices

1. **Change Default Passwords**: Update admin credentials
2. **Use Strong Secrets**: Generate secure SECRET_KEY
3. **Enable HTTPS**: Configure SSL certificates
4. **Regular Updates**: Keep dependencies updated
5. **Monitor Logs**: Review access and error logs
6. **Backup Data**: Regular database backups

## 📈 Monitoring & Logging

### Health Checks

All services include health checks:
- **Backend**: `/api/health/`
- **Frontend**: `/health`
- **Database**: PostgreSQL connection check
- **Redis**: Redis ping check

### Logging

Logs are stored in:
- **Backend**: `backend/logs/`
- **NGINX**: Container logs
- **Database**: PostgreSQL logs

### Monitoring Commands

```bash
# View real-time logs
./deploy.sh logs

# Check service health
docker-compose ps

# Monitor resource usage
docker stats
```

## 🔧 Troubleshooting

### Common Issues

#### Services Won't Start
```bash
# Check logs
./deploy.sh logs

# Verify environment
cat .env

# Restart services
./deploy.sh restart
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready

# Reset database
docker-compose down -v
./deploy.sh deploy
```

#### Email Not Sending
```bash
# Check email configuration
docker-compose exec backend python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Test message', 'from@example.com', ['to@example.com'])

# Check Celery worker
./deploy.sh logs celery_worker
```

#### Frontend Not Loading
```bash
# Check NGINX configuration
./deploy.sh logs nginx

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Performance Optimization

#### Database Optimization
- Enable connection pooling
- Add database indexes
- Regular VACUUM and ANALYZE

#### Redis Optimization
- Configure memory limits
- Enable persistence
- Monitor memory usage

#### NGINX Optimization
- Enable gzip compression
- Configure caching headers
- Optimize buffer sizes

## 🚀 Production Deployment

### Production Checklist

- [ ] Update environment variables
- [ ] Configure SSL certificates
- [ ] Set up domain name
- [ ] Configure email service
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Update security settings
- [ ] Test all functionality

### SSL Configuration

1. Obtain SSL certificates
2. Place certificates in `docker/nginx/ssl/`
3. Update NGINX configuration
4. Enable HTTPS redirect

### Backup Strategy

```bash
# Automated daily backups
0 2 * * * /path/to/jobgate_project/deploy.sh backup

# Backup retention (keep 30 days)
find backups/ -name "*.sql" -mtime +30 -delete
```

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Code Standards

- **Python**: Follow PEP 8
- **JavaScript**: Use ESLint configuration
- **Git**: Conventional commit messages
- **Documentation**: Update README for changes

### Testing

```bash
# Backend tests
docker-compose exec backend python manage.py test

# Frontend tests
docker-compose exec frontend npm test

# Integration tests
./deploy.sh deploy
# Run manual testing checklist
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- **API Docs**: http://localhost/api/docs/
- **Database Schema**: `database/README.md`
- **n8n Workflows**: `backend/n8n_workflows/README.md`

### Getting Help
- Check troubleshooting section
- Review logs for errors
- Consult API documentation
- Check GitHub issues

### Reporting Issues
When reporting issues, include:
- System information
- Error messages
- Steps to reproduce
- Log files

## 🔄 Updates & Maintenance

### Regular Maintenance
- Update dependencies monthly
- Review security advisories
- Monitor system performance
- Clean up old logs and backups

### Version Updates
```bash
# Update to latest version
git pull origin main
./deploy.sh update
```

---

**JOBGATE Appointment System** - Streamlining university appointment management with modern technology.

