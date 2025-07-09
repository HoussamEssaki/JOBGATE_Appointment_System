-- JOBGATE Appointment System - Sample Data
-- Description: Insert sample data for testing and demonstration
-- Version: 1.0
-- Date: July 9, 2025

BEGIN;

-- Insert sample universities
INSERT INTO universities (name, description, city, country, contact_email, contact_phone, is_active) VALUES
('Harvard University', 'Prestigious university in Cambridge, Massachusetts', 'Cambridge', 'USA', 'careers@harvard.edu', '+1-617-495-1000', true),
('Stanford University', 'Leading research university in California', 'Stanford', 'USA', 'careers@stanford.edu', '+1-650-723-2300', true),
('MIT', 'Massachusetts Institute of Technology', 'Cambridge', 'USA', 'careers@mit.edu', '+1-617-253-1000', true),
('University of Oxford', 'Historic university in England', 'Oxford', 'UK', 'careers@ox.ac.uk', '+44-1865-270000', true),
('University of Toronto', 'Top Canadian research university', 'Toronto', 'Canada', 'careers@utoronto.ca', '+1-416-978-2011', true);

-- Insert sample users
INSERT INTO users (username, email, first_name, last_name, user_type, phone_number, is_active, password) VALUES
-- University Staff
('john.smith', 'john.smith@harvard.edu', 'John', 'Smith', 'university_staff', '+1-617-495-1001', true, 'pbkdf2_sha256$600000$dummy$hash'),
('sarah.johnson', 'sarah.johnson@stanford.edu', 'Sarah', 'Johnson', 'university_staff', '+1-650-723-2301', true, 'pbkdf2_sha256$600000$dummy$hash'),
('michael.brown', 'michael.brown@mit.edu', 'Michael', 'Brown', 'university_staff', '+1-617-253-1001', true, 'pbkdf2_sha256$600000$dummy$hash'),
('emma.wilson', 'emma.wilson@ox.ac.uk', 'Emma', 'Wilson', 'university_staff', '+44-1865-270001', true, 'pbkdf2_sha256$600000$dummy$hash'),
('david.lee', 'david.lee@utoronto.ca', 'David', 'Lee', 'university_staff', '+1-416-978-2012', true, 'pbkdf2_sha256$600000$dummy$hash'),

-- Talents (Job Seekers)
('alice.cooper', 'alice.cooper@email.com', 'Alice', 'Cooper', 'talent', '+1-555-0101', true, 'pbkdf2_sha256$600000$dummy$hash'),
('bob.taylor', 'bob.taylor@email.com', 'Bob', 'Taylor', 'talent', '+1-555-0102', true, 'pbkdf2_sha256$600000$dummy$hash'),
('carol.white', 'carol.white@email.com', 'Carol', 'White', 'talent', '+1-555-0103', true, 'pbkdf2_sha256$600000$dummy$hash'),
('daniel.green', 'daniel.green@email.com', 'Daniel', 'Green', 'talent', '+1-555-0104', true, 'pbkdf2_sha256$600000$dummy$hash'),
('eva.black', 'eva.black@email.com', 'Eva', 'Black', 'talent', '+1-555-0105', true, 'pbkdf2_sha256$600000$dummy$hash'),
('frank.blue', 'frank.blue@email.com', 'Frank', 'Blue', 'talent', '+1-555-0106', true, 'pbkdf2_sha256$600000$dummy$hash'),
('grace.red', 'grace.red@email.com', 'Grace', 'Red', 'talent', '+1-555-0107', true, 'pbkdf2_sha256$600000$dummy$hash'),
('henry.yellow', 'henry.yellow@email.com', 'Henry', 'Yellow', 'talent', '+1-555-0108', true, 'pbkdf2_sha256$600000$dummy$hash'),

-- Admin
('admin', 'admin@jobgate.com', 'System', 'Administrator', 'admin', '+1-555-0000', true, 'pbkdf2_sha256$600000$dummy$hash');

-- Insert university staff records
INSERT INTO university_staff (user_id, university_id, position, department, bio, specializations, is_active) VALUES
(1, 1, 'Career Counselor', 'Career Services', 'Experienced career counselor specializing in tech industry placements', ARRAY['Technology', 'Software Engineering', 'Data Science'], true),
(2, 2, 'Senior Career Advisor', 'Student Affairs', 'Senior advisor with expertise in startup and entrepreneurship guidance', ARRAY['Entrepreneurship', 'Startups', 'Business Development'], true),
(3, 3, 'Career Development Specialist', 'Career Development', 'Specialist in engineering and research career paths', ARRAY['Engineering', 'Research', 'Academia'], true),
(4, 4, 'Careers Consultant', 'Careers Service', 'International careers consultant with focus on global opportunities', ARRAY['International Careers', 'Finance', 'Consulting'], true),
(5, 5, 'Career Services Coordinator', 'Career Centre', 'Coordinator specializing in Canadian job market and immigration', ARRAY['Canadian Job Market', 'Immigration', 'Healthcare'], true);

-- Insert user preferences for all users
INSERT INTO user_preferences (user_id, email_reminders_enabled, reminder_24h_enabled, reminder_1h_enabled, preferred_meeting_type, timezone, language) 
SELECT id, true, true, true, 'in_person', 'UTC', 'en' FROM users;

-- Insert sample agendas
INSERT INTO agendas (university_id, created_by_id, name, description, theme_id, slot_duration_minutes, max_capacity_per_slot, start_date, end_date, is_recurring, booking_deadline_hours, cancellation_deadline_hours, is_active) VALUES
(1, 1, 'Tech Career Guidance', 'One-on-one sessions for technology career planning and development', 2, 60, 1, '2025-01-15', '2025-03-15', false, 24, 12, true),
(1, 1, 'Resume Review Sessions', 'Professional resume and CV review for job applications', 1, 30, 1, '2025-01-10', '2025-02-28', false, 12, 6, true),
(2, 2, 'Startup Mentorship', 'Guidance for students interested in entrepreneurship and startups', 2, 45, 1, '2025-01-20', '2025-04-20', false, 48, 24, true),
(2, 2, 'Interview Preparation Workshop', 'Mock interviews and interview skills development', 3, 90, 3, '2025-02-01', '2025-03-01', false, 24, 12, true),
(3, 3, 'Engineering Career Paths', 'Career guidance for engineering students and graduates', 2, 60, 1, '2025-01-25', '2025-05-25', false, 24, 12, true),
(4, 4, 'International Opportunities', 'Guidance on international career opportunities and applications', 6, 45, 1, '2025-02-01', '2025-04-01', false, 48, 24, true),
(5, 5, 'Canadian Job Market Insights', 'Understanding the Canadian job market and application processes', 4, 60, 2, '2025-01-30', '2025-03-30', false, 24, 12, true);

-- Insert agenda staff assignments
INSERT INTO agenda_staff_assignments (agenda_id, staff_id, role, is_primary) VALUES
(1, 1, 'advisor', true),
(2, 1, 'advisor', true),
(3, 2, 'advisor', true),
(4, 2, 'coordinator', true),
(5, 3, 'advisor', true),
(6, 4, 'advisor', true),
(7, 5, 'advisor', true);

-- Insert sample calendar slots for the next few weeks
INSERT INTO calendar_slots (agenda_id, staff_id, slot_date, start_time, end_time, max_capacity, current_bookings, status, location, meeting_type) VALUES
-- Tech Career Guidance (Agenda 1)
(1, 1, '2025-01-20', '09:00', '10:00', 1, 0, 'available', 'Career Services Office, Room 101', 'in_person'),
(1, 1, '2025-01-20', '10:30', '11:30', 1, 0, 'available', 'Career Services Office, Room 101', 'in_person'),
(1, 1, '2025-01-20', '14:00', '15:00', 1, 0, 'available', 'Career Services Office, Room 101', 'in_person'),
(1, 1, '2025-01-22', '09:00', '10:00', 1, 0, 'available', 'https://zoom.us/j/123456789', 'online'),
(1, 1, '2025-01-22', '11:00', '12:00', 1, 0, 'available', 'https://zoom.us/j/123456789', 'online'),

-- Resume Review Sessions (Agenda 2)
(2, 1, '2025-01-15', '09:00', '09:30', 1, 0, 'available', 'Career Services Office, Room 102', 'in_person'),
(2, 1, '2025-01-15', '09:30', '10:00', 1, 0, 'available', 'Career Services Office, Room 102', 'in_person'),
(2, 1, '2025-01-15', '10:00', '10:30', 1, 0, 'available', 'Career Services Office, Room 102', 'in_person'),
(2, 1, '2025-01-15', '10:30', '11:00', 1, 0, 'available', 'Career Services Office, Room 102', 'in_person'),
(2, 1, '2025-01-17', '14:00', '14:30', 1, 0, 'available', 'https://zoom.us/j/987654321', 'online'),
(2, 1, '2025-01-17', '14:30', '15:00', 1, 0, 'available', 'https://zoom.us/j/987654321', 'online'),

-- Startup Mentorship (Agenda 3)
(3, 2, '2025-01-25', '10:00', '10:45', 1, 0, 'available', 'Innovation Hub, Room 201', 'in_person'),
(3, 2, '2025-01-25', '11:00', '11:45', 1, 0, 'available', 'Innovation Hub, Room 201', 'in_person'),
(3, 2, '2025-01-27', '15:00', '15:45', 1, 0, 'available', 'https://meet.google.com/abc-defg-hij', 'online'),

-- Interview Preparation Workshop (Agenda 4)
(4, 2, '2025-02-05', '13:00', '14:30', 3, 0, 'available', 'Workshop Room A', 'in_person'),
(4, 2, '2025-02-07', '13:00', '14:30', 3, 0, 'available', 'Workshop Room A', 'in_person'),
(4, 2, '2025-02-12', '10:00', '11:30', 3, 0, 'available', 'https://teams.microsoft.com/l/meetup-join/xyz', 'online'),

-- Engineering Career Paths (Agenda 5)
(5, 3, '2025-02-01', '09:00', '10:00', 1, 0, 'available', 'Engineering Building, Room 301', 'in_person'),
(5, 3, '2025-02-01', '10:30', '11:30', 1, 0, 'available', 'Engineering Building, Room 301', 'in_person'),
(5, 3, '2025-02-03', '14:00', '15:00', 1, 0, 'available', 'https://zoom.us/j/555666777', 'online'),

-- International Opportunities (Agenda 6)
(6, 4, '2025-02-10', '11:00', '11:45', 1, 0, 'available', 'International Office', 'in_person'),
(6, 4, '2025-02-12', '14:00', '14:45', 1, 0, 'available', 'https://zoom.us/j/888999000', 'online'),

-- Canadian Job Market Insights (Agenda 7)
(7, 5, '2025-02-05', '10:00', '11:00', 2, 0, 'available', 'Career Centre, Main Hall', 'in_person'),
(7, 5, '2025-02-07', '15:00', '16:00', 2, 0, 'available', 'Career Centre, Main Hall', 'in_person');

-- Insert some sample appointments
INSERT INTO appointments (calendar_slot_id, talent_id, booking_reference, status, talent_notes, booked_at) VALUES
(1, 6, 'APT-20250115-000001', 'confirmed', 'Looking for guidance on transitioning from academia to tech industry', '2025-01-10 14:30:00'),
(6, 7, 'APT-20250115-000002', 'confirmed', 'Need help with resume formatting for software engineering positions', '2025-01-11 09:15:00'),
(12, 8, 'APT-20250125-000003', 'confirmed', 'Interested in starting a tech startup, need mentorship', '2025-01-12 16:45:00'),
(16, 9, 'APT-20250201-000004', 'confirmed', 'Recent engineering graduate seeking career path advice', '2025-01-13 11:20:00');

-- Insert default appointment themes
INSERT INTO appointment_themes (name, description, color_code, icon) VALUES
('CV Review', 'Resume and CV review sessions', '#3498db', 'document'),
('Career Counseling', 'General career guidance and planning', '#2ecc71', 'compass'),
('Interview Preparation', 'Mock interviews and interview coaching', '#e74c3c', 'microphone'),
('Job Search Strategy', 'Job search techniques and networking', '#f39c12', 'search'),
('Skills Assessment', 'Technical and soft skills evaluation', '#9b59b6', 'chart-bar'),
('Industry Insights', 'Industry-specific career guidance', '#1abc9c', 'industry'),
('Internship Guidance', 'Internship search and application support', '#34495e', 'graduation-cap'),
('Networking Workshop', 'Professional networking strategies', '#e67e22', 'users');

-- Update calendar slots booking counts for booked appointments
UPDATE calendar_slots SET current_bookings = 1, status = 'fully_booked' WHERE id IN (1, 6, 12, 16);

-- Insert some eligibility criteria
INSERT INTO talent_eligibility_criteria (agenda_id, criteria_type, criteria_value, is_required) VALUES
(1, 'field_of_study', 'Computer Science', false),
(1, 'field_of_study', 'Information Technology', false),
(1, 'field_of_study', 'Software Engineering', false),
(3, 'year_of_study', 'Final Year', false),
(3, 'year_of_study', 'Graduate', false),
(5, 'field_of_study', 'Engineering', true),
(7, 'university', 'University of Toronto', false);

COMMIT;

