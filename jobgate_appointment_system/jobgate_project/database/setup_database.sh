#!/bin/bash

# JOBGATE Appointment System Database Setup Script
# This script sets up the PostgreSQL database for the JOBGATE appointment system

set -e  # Exit on any error

# Configuration
DB_NAME="jobgate_db"
DB_USER="jobgate_user"
DB_PASSWORD="jobgate_password"
DB_HOST="localhost"
DB_PORT="5432"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if PostgreSQL is running
check_postgresql() {
    print_status "Checking PostgreSQL service..."
    if ! systemctl is-active --quiet postgresql; then
        print_warning "PostgreSQL is not running. Attempting to start..."
        sudo systemctl start postgresql
        if systemctl is-active --quiet postgresql; then
            print_success "PostgreSQL started successfully"
        else
            print_error "Failed to start PostgreSQL. Please start it manually."
            exit 1
        fi
    else
        print_success "PostgreSQL is running"
    fi
}

# Function to check if database exists
database_exists() {
    sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"
}

# Function to check if user exists
user_exists() {
    sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1
}

# Function to create database and user
setup_database_user() {
    print_status "Setting up database and user..."
    
    if user_exists; then
        print_warning "User '$DB_USER' already exists"
    else
        print_status "Creating user '$DB_USER'..."
        sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
        sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"
        print_success "User '$DB_USER' created"
    fi
    
    if database_exists; then
        print_warning "Database '$DB_NAME' already exists"
        read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Dropping existing database..."
            sudo -u postgres psql -c "DROP DATABASE $DB_NAME;"
            print_status "Creating database '$DB_NAME'..."
            sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
            print_success "Database '$DB_NAME' recreated"
        else
            print_warning "Using existing database"
        fi
    else
        print_status "Creating database '$DB_NAME'..."
        sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
        print_success "Database '$DB_NAME' created"
    fi
    
    # Grant privileges
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    print_success "Privileges granted to '$DB_USER'"
}

# Function to run SQL migration files
run_migrations() {
    print_status "Running database migrations..."
    
    # Check if migration files exist
    if [ ! -f "001_initial_migration.sql" ]; then
        print_error "Migration file 001_initial_migration.sql not found!"
        exit 1
    fi
    
    # Run initial migration
    print_status "Running initial migration..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f 001_initial_migration.sql
    print_success "Initial migration completed"
    
    # Run triggers and functions
    if [ -f "002_triggers_and_functions.sql" ]; then
        print_status "Running triggers and functions migration..."
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f 002_triggers_and_functions.sql
        print_success "Triggers and functions migration completed"
    fi
    
    # Run sample data
    if [ -f "003_sample_data.sql" ]; then
        read -p "Do you want to insert sample data? (Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            print_status "Inserting sample data..."
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f 003_sample_data.sql
            print_success "Sample data inserted"
        else
            print_warning "Skipping sample data insertion"
        fi
    fi
}

# Function to verify database setup
verify_setup() {
    print_status "Verifying database setup..."
    
    # Check if tables exist
    table_count=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    
    if [ "$table_count" -gt 10 ]; then
        print_success "Database setup verified - $table_count tables created"
    else
        print_error "Database setup verification failed - only $table_count tables found"
        exit 1
    fi
    
    # Check if sample data exists (if inserted)
    user_count=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
    if [ "$user_count" -gt 0 ]; then
        print_success "Sample data verified - $user_count users found"
    fi
}

# Function to create .env file
create_env_file() {
    print_status "Creating .env file for Django..."
    
    ENV_FILE="../backend/.env"
    
    cat > "$ENV_FILE" << EOF
# Database Configuration
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Django Configuration
SECRET_KEY=django-insecure-change-me-in-production
DEBUG=True

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=noreply@jobgate.com

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
EOF
    
    print_success ".env file created at $ENV_FILE"
}

# Function to display connection information
display_connection_info() {
    print_success "Database setup completed successfully!"
    echo
    echo "Connection Information:"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo "  Password: $DB_PASSWORD"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo
    echo "To connect manually:"
    echo "  psql -h $DB_HOST -U $DB_USER -d $DB_NAME"
    echo
    echo "Django settings:"
    echo "  DATABASE_URL: postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
}

# Main execution
main() {
    echo "========================================"
    echo "JOBGATE Database Setup Script"
    echo "========================================"
    echo
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_error "Please do not run this script as root"
        exit 1
    fi
    
    # Check if PostgreSQL is installed
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL client (psql) is not installed"
        print_status "Please install PostgreSQL first:"
        print_status "  Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
        print_status "  CentOS/RHEL: sudo yum install postgresql postgresql-server postgresql-contrib"
        exit 1
    fi
    
    check_postgresql
    setup_database_user
    run_migrations
    verify_setup
    create_env_file
    display_connection_info
    
    print_success "Setup completed! You can now start the Django application."
}

# Run main function
main "$@"

