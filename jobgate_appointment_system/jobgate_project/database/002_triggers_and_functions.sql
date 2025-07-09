-- JOBGATE Appointment System - Triggers and Functions
-- Description: Create database triggers and functions for business logic
-- Version: 1.0
-- Date: July 9, 2025

BEGIN;

-- Function to update slot booking count
CREATE OR REPLACE FUNCTION update_slot_booking_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE calendar_slots 
        SET current_bookings = current_bookings + 1,
            status = CASE 
                WHEN current_bookings + 1 >= max_capacity THEN 'fully_booked'
                ELSE 'available'
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.calendar_slot_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE calendar_slots 
        SET current_bookings = current_bookings - 1,
            status = 'available',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.calendar_slot_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes (e.g., cancelled appointments)
        IF OLD.status != NEW.status AND NEW.status = 'cancelled' THEN
            UPDATE calendar_slots 
            SET current_bookings = current_bookings - 1,
                status = 'available',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.calendar_slot_id;
        ELSIF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
            UPDATE calendar_slots 
            SET current_bookings = current_bookings + 1,
                status = CASE 
                    WHEN current_bookings + 1 >= max_capacity THEN 'fully_booked'
                    ELSE 'available'
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.calendar_slot_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for appointment booking count
CREATE TRIGGER trigger_update_slot_booking_count
    AFTER INSERT OR DELETE OR UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_slot_booking_count();

-- Function to check staff time conflicts
CREATE OR REPLACE FUNCTION check_staff_time_conflict()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM calendar_slots cs
        WHERE cs.staff_id = NEW.staff_id
        AND cs.slot_date = NEW.slot_date
        AND cs.id != COALESCE(NEW.id, 0)
        AND (
            (NEW.start_time >= cs.start_time AND NEW.start_time < cs.end_time) OR
            (NEW.end_time > cs.start_time AND NEW.end_time <= cs.end_time) OR
            (NEW.start_time <= cs.start_time AND NEW.end_time >= cs.end_time)
        )
    ) THEN
        RAISE EXCEPTION 'Time slot conflicts with existing appointment for this staff member';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for staff time conflict check
CREATE TRIGGER trigger_check_staff_time_conflict
    BEFORE INSERT OR UPDATE ON calendar_slots
    FOR EACH ROW EXECUTE FUNCTION check_staff_time_conflict();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_universities_updated_at
    BEFORE UPDATE ON universities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_university_staff_updated_at
    BEFORE UPDATE ON university_staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_appointment_themes_updated_at
    BEFORE UPDATE ON appointment_themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_agendas_updated_at
    BEFORE UPDATE ON agendas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_calendar_slots_updated_at
    BEFORE UPDATE ON calendar_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_appointment_statistics_updated_at
    BEFORE UPDATE ON appointment_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log all changes to critical tables
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        created_at
    ) VALUES (
        COALESCE(current_setting('app.current_user_id', true)::integer, 0),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
        CURRENT_TIMESTAMP
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to critical tables
CREATE TRIGGER audit_appointments 
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_calendar_slots 
    AFTER INSERT OR UPDATE OR DELETE ON calendar_slots
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_agendas 
    AFTER INSERT OR UPDATE OR DELETE ON agendas
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
        NEW.booking_reference := 'APT-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEW.id::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking reference generation
CREATE TRIGGER trigger_generate_booking_reference
    BEFORE INSERT ON appointments
    FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();

-- Function to calculate daily statistics
CREATE OR REPLACE FUNCTION calculate_daily_statistics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
DECLARE
    stat_record RECORD;
BEGIN
    -- Delete existing statistics for the target date
    DELETE FROM appointment_statistics WHERE date = target_date;
    
    -- Calculate and insert new statistics
    FOR stat_record IN
        SELECT 
            u.id as university_id,
            at.id as theme_id,
            us.id as staff_id,
            target_date as date,
            COUNT(cs.id) as total_slots,
            COUNT(a.id) FILTER (WHERE a.status != 'cancelled') as booked_slots,
            COUNT(a.id) FILTER (WHERE a.status = 'completed') as completed_appointments,
            COUNT(a.id) FILTER (WHERE a.status = 'cancelled') as cancelled_appointments,
            COUNT(a.id) FILTER (WHERE a.status = 'no_show') as no_show_appointments,
            COALESCE(SUM(ag.slot_duration_minutes) FILTER (WHERE a.status = 'completed'), 0) as total_duration_minutes,
            COUNT(DISTINCT a.talent_id) FILTER (WHERE a.status != 'cancelled') as unique_talents_count,
            AVG(a.rating) FILTER (WHERE a.rating IS NOT NULL) as average_rating
        FROM universities u
        JOIN agendas ag ON u.id = ag.university_id
        JOIN appointment_themes at ON ag.theme_id = at.id
        JOIN calendar_slots cs ON ag.id = cs.agenda_id AND cs.slot_date = target_date
        JOIN university_staff us ON cs.staff_id = us.id
        LEFT JOIN appointments a ON cs.id = a.calendar_slot_id
        GROUP BY u.id, at.id, us.id
    LOOP
        INSERT INTO appointment_statistics (
            university_id, theme_id, staff_id, date,
            total_slots, booked_slots, completed_appointments,
            cancelled_appointments, no_show_appointments,
            total_duration_minutes, unique_talents_count, average_rating
        ) VALUES (
            stat_record.university_id, stat_record.theme_id, stat_record.staff_id, stat_record.date,
            stat_record.total_slots, stat_record.booked_slots, stat_record.completed_appointments,
            stat_record.cancelled_appointments, stat_record.no_show_appointments,
            stat_record.total_duration_minutes, stat_record.unique_talents_count, stat_record.average_rating
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh materialized views (if any are created later)
CREATE OR REPLACE FUNCTION refresh_daily_stats()
RETURNS void AS $$
BEGIN
    -- Calculate statistics for yesterday and today
    PERFORM calculate_daily_statistics(CURRENT_DATE - INTERVAL '1 day');
    PERFORM calculate_daily_statistics(CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

COMMIT;

