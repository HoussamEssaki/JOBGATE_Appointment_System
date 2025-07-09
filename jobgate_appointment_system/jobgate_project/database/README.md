# JOBGATE Appointment System Database

This directory contains the database schema, migrations, and setup scripts for the JOBGATE appointment booking system.

## Files Overview

- `001_initial_migration.sql` - Initial database schema creation with all tables, indexes, and default data
- `002_triggers_and_functions.sql` - Database triggers and functions for business logic
- `003_sample_data.sql` - Sample data for testing and demonstration
- `setup_database.sh` - Shell script to set up the database
- `README.md` - This documentation file

## Database Setup

### Prerequisites

- PostgreSQL 12+ installed and running
- Database user with CREATE DATABASE privileges
- Redis server for caching (optional for basic setup)

### Quick Setup

1. **Create Database and User:**
```bash
sudo -u postgres psql
CREATE DATABASE jobgate_db;
CREATE USER jobgate_user WITH PASSWORD 'jobgate_password';
GRANT ALL PRIVILEGES ON DATABASE jobgate_db TO jobgate_user;
ALTER USER jobgate_user CREATEDB;
\q
```

2. **Run Migration Scripts:**
```bash
# Navigate to database directory
cd /path/to/jobgate_project/database

# Run migrations in order
psql -h localhost -U jobgate_user -d jobgate_db -f 001_initial_migration.sql
psql -h localhost -U jobgate_user -d jobgate_db -f 002_triggers_and_functions.sql
psql -h localhost -U jobgate_user -d jobgate_db -f 003_sample_data.sql
```

3. **Or use the setup script:**
```bash
chmod +x setup_database.sh
./setup_database.sh
```

## Database Schema Overview

### Core Tables

1. **users** - User accounts (talents, university staff, admins)
2. **universities** - University/career center information
3. **university_staff** - Staff member profiles and associations
4. **appointment_themes** - Categories for different types of appointments
5. **agendas** - Appointment agendas created by university staff
6. **calendar_slots** - Available time slots for appointments
7. **appointments** - Booked appointments
8. **appointment_statistics** - Aggregated statistics for reporting
9. **email_reminders** - Email notification logs
10. **user_preferences** - User notification and preference settings

### Supporting Tables

- **agenda_staff_assignments** - Many-to-many relationship between agendas and staff
- **talent_eligibility_criteria** - Rules for who can book specific agendas
- **appointment_attachments** - File attachments for appointments
- **audit_logs** - System audit trail

## Key Features

### Automatic Triggers

- **Booking Count Management**: Automatically updates `current_bookings` and `status` in calendar slots
- **Time Conflict Prevention**: Prevents overlapping appointments for the same staff member
- **Audit Logging**: Tracks all changes to critical tables
- **Timestamp Updates**: Automatically updates `updated_at` columns

### Business Logic Functions

- `update_slot_booking_count()` - Manages slot availability
- `check_staff_time_conflict()` - Prevents scheduling conflicts
- `calculate_daily_statistics()` - Generates daily statistics
- `generate_booking_reference()` - Creates unique booking references

### Performance Optimizations

- Composite indexes for frequent queries
- JSONB indexes for flexible data structures
- Full-text search indexes using pg_trgm
- Partitioning strategy for large tables (appointments)

## Sample Data

The sample data includes:

- 5 universities (Harvard, Stanford, MIT, Oxford, University of Toronto)
- 5 university staff members
- 8 talent users
- 1 admin user
- 7 sample agendas with different themes
- 20+ calendar slots
- 4 sample appointments
- Default appointment themes (CV Review, Career Counseling, etc.)

### Default Login Credentials

**Admin User:**
- Username: `admin`
- Email: `admin@jobgate.com`
- Password: `admin123` (change in production)

**Sample Staff:**
- Username: `john.smith`
- Email: `john.smith@harvard.edu`
- Password: `staff123`

**Sample Talent:**
- Username: `alice.cooper`
- Email: `alice.cooper@email.com`
- Password: `talent123`

*Note: All passwords are hashed using Django's PBKDF2 algorithm*

## Environment Variables

Set these environment variables for the Django application:

```bash
DB_NAME=jobgate_db
DB_USER=jobgate_user
DB_PASSWORD=jobgate_password
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379/0
```

## Maintenance

### Daily Statistics

Run daily statistics calculation:
```sql
SELECT calculate_daily_statistics(CURRENT_DATE);
```

### Cleanup Old Audit Logs

```sql
DELETE FROM audit_logs WHERE created_at < CURRENT_DATE - INTERVAL '90 days';
```

### Backup Database

```bash
pg_dump -h localhost -U jobgate_user jobgate_db > backup_$(date +%Y%m%d).sql
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure the database user has proper privileges
2. **Extension Not Found**: Install PostgreSQL contrib package for uuid-ossp and pg_trgm
3. **Connection Refused**: Check PostgreSQL service status and connection parameters

### Useful Queries

**Check appointment statistics:**
```sql
SELECT u.name, COUNT(a.id) as total_appointments
FROM universities u
JOIN agendas ag ON u.id = ag.university_id
JOIN calendar_slots cs ON ag.id = cs.agenda_id
JOIN appointments a ON cs.id = a.calendar_slot_id
GROUP BY u.name;
```

**View available slots:**
```sql
SELECT ag.name, cs.slot_date, cs.start_time, cs.end_time, cs.status
FROM calendar_slots cs
JOIN agendas ag ON cs.agenda_id = ag.id
WHERE cs.status = 'available' AND cs.slot_date >= CURRENT_DATE
ORDER BY cs.slot_date, cs.start_time;
```

## Security Considerations

- All passwords are hashed using Django's secure password hashing
- Audit logging tracks all critical operations
- Row-level security can be implemented for multi-tenant scenarios
- Regular backups should be scheduled
- Database connections should use SSL in production

## Performance Monitoring

Monitor these key metrics:

- Query execution times
- Index usage statistics
- Connection pool utilization
- Cache hit ratios (Redis)
- Disk space usage

Use PostgreSQL's built-in monitoring tools:
```sql
-- Query performance
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC LIMIT 10;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

