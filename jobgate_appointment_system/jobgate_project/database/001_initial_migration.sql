-- JOBGATE Appointment System - Initial Migration
-- Description: Create all tables for the appointment booking system
-- Version: 1.0
-- Date: July 9, 2025

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create tables in dependency order

-- 1. Users Table (Extended from existing JOBGATE schema)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    date_joined TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('talent', 'recruiter', 'university_staff', 'admin')),
    phone_number VARCHAR(20),
    profile_picture VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Universities/Career Centers Table
CREATE TABLE universities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    website_url VARCHAR(500),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. University Staff Table
CREATE TABLE university_staff (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    position VARCHAR(100),
    department VARCHAR(100),
    bio TEXT,
    specializations TEXT[], -- Array of specialization areas
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, university_id)
);

-- 4. Appointment Themes Table
CREATE TABLE appointment_themes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color_code VARCHAR(7), -- Hex color code for UI display
    icon VARCHAR(50), -- Icon identifier for UI
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Agendas Table
CREATE TABLE agendas (
    id SERIAL PRIMARY KEY,
    university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    created_by_id INTEGER NOT NULL REFERENCES university_staff(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    theme_id INTEGER NOT NULL REFERENCES appointment_themes(id),
    slot_duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (slot_duration_minutes > 0),
    max_capacity_per_slot INTEGER NOT NULL DEFAULT 1 CHECK (max_capacity_per_slot > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern JSONB DEFAULT '{}', -- Store recurrence rules (daily, weekly, etc.)
    booking_deadline_hours INTEGER DEFAULT 24, -- How many hours before appointment can be booked
    cancellation_deadline_hours INTEGER DEFAULT 24, -- How many hours before appointment can be cancelled
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- 6. Calendar Slots Table
CREATE TABLE calendar_slots (
    id SERIAL PRIMARY KEY,
    agenda_id INTEGER NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
    staff_id INTEGER NOT NULL REFERENCES university_staff(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 1,
    current_bookings INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'fully_booked', 'cancelled', 'blocked')),
    notes TEXT,
    location VARCHAR(255), -- Physical location or meeting link
    meeting_type VARCHAR(20) DEFAULT 'in_person' CHECK (meeting_type IN ('in_person', 'online', 'phone')),
    meeting_link VARCHAR(500), -- For online meetings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT valid_capacity CHECK (current_bookings <= max_capacity),
    UNIQUE(agenda_id, staff_id, slot_date, start_time)
);

-- 7. Appointments Table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    calendar_slot_id INTEGER NOT NULL REFERENCES calendar_slots(id) ON DELETE CASCADE,
    talent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_reference VARCHAR(50) UNIQUE NOT NULL DEFAULT uuid_generate_v4(), -- Generated unique reference
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    talent_notes TEXT, -- Notes from talent when booking
    staff_notes TEXT, -- Notes from staff after appointment
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Post-appointment rating
    feedback TEXT, -- Post-appointment feedback
    reminder_sent_24h BOOLEAN DEFAULT FALSE,
    reminder_sent_1h BOOLEAN DEFAULT FALSE,
    confirmation_sent BOOLEAN DEFAULT FALSE,
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Appointment Statistics Table
CREATE TABLE appointment_statistics (
    id SERIAL PRIMARY KEY,
    university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    theme_id INTEGER NOT NULL REFERENCES appointment_themes(id) ON DELETE CASCADE,
    staff_id INTEGER REFERENCES university_staff(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    total_slots INTEGER NOT NULL DEFAULT 0,
    booked_slots INTEGER NOT NULL DEFAULT 0,
    completed_appointments INTEGER NOT NULL DEFAULT 0,
    cancelled_appointments INTEGER NOT NULL DEFAULT 0,
    no_show_appointments INTEGER NOT NULL DEFAULT 0,
    total_duration_minutes INTEGER NOT NULL DEFAULT 0,
    unique_talents_count INTEGER NOT NULL DEFAULT 0,
    average_rating DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(university_id, theme_id, staff_id, date)
);

-- 9. Email Reminders Log Table
CREATE TABLE email_reminders (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('confirmation', '24_hour', '1_hour', 'cancellation', 'follow_up')),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
    error_message TEXT,
    email_provider_id VARCHAR(100), -- ID from email service provider
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. User Preferences Table
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_reminders_enabled BOOLEAN DEFAULT TRUE,
    reminder_24h_enabled BOOLEAN DEFAULT TRUE,
    reminder_1h_enabled BOOLEAN DEFAULT TRUE,
    preferred_meeting_type VARCHAR(20) DEFAULT 'in_person' CHECK (preferred_meeting_type IN ('in_person', 'online', 'phone', 'any')),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    notification_preferences JSONB DEFAULT '{}', -- Store various notification settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Agenda Staff Assignments Table
CREATE TABLE agenda_staff_assignments (
    id SERIAL PRIMARY KEY,
    agenda_id INTEGER NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
    staff_id INTEGER NOT NULL REFERENCES university_staff(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'advisor', -- advisor, coordinator, assistant
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agenda_id, staff_id)
);

-- 12. Talent Eligibility Criteria Table
CREATE TABLE talent_eligibility_criteria (
    id SERIAL PRIMARY KEY,
    agenda_id INTEGER NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
    criteria_type VARCHAR(50) NOT NULL, -- 'university', 'year_of_study', 'field_of_study', 'gpa_minimum'
    criteria_value VARCHAR(255) NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Appointment Attachments Table
CREATE TABLE appointment_attachments (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    uploaded_by_id INTEGER NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. System Audit Log Table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance optimization

-- Composite indexes for frequent queries
CREATE INDEX idx_calendar_slots_agenda_date ON calendar_slots(agenda_id, slot_date);
CREATE INDEX idx_calendar_slots_staff_date ON calendar_slots(staff_id, slot_date);
CREATE INDEX idx_appointments_talent_status ON appointments(talent_id, status);
CREATE INDEX idx_appointments_slot_status ON appointments(calendar_slot_id, status);

-- Date-based indexes for time-series queries
CREATE INDEX idx_appointments_booked_at ON appointments(booked_at);
CREATE INDEX idx_email_reminders_sent_at ON email_reminders(sent_at);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Status and filtering indexes
CREATE INDEX idx_agendas_university_active ON agendas(university_id, is_active);
CREATE INDEX idx_calendar_slots_status ON calendar_slots(status);
CREATE INDEX idx_users_type_active ON users(user_type, is_active);

-- Full-text search indexes
CREATE INDEX idx_agendas_name_trgm ON agendas USING gin(name gin_trgm_ops);
CREATE INDEX idx_appointment_themes_name_trgm ON appointment_themes USING gin(name gin_trgm_ops);

-- JSONB indexes for flexible queries
CREATE INDEX idx_agendas_recurrence ON agendas USING gin(recurrence_pattern);
CREATE INDEX idx_user_preferences_notifications ON user_preferences USING gin(notification_preferences);

COMMIT;

