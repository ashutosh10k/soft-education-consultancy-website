-- ================================================================
-- SOFT Education Consultancy — Database Schema
-- SQLite Version 3
-- ================================================================

PRAGMA foreign_keys = ON;

-- 1. ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    enquiry_type TEXT NOT NULL,
    interested_course TEXT,
    preferred_location TEXT,
    message TEXT,
    source_page TEXT NOT NULL,
    status TEXT DEFAULT 'New' CHECK(status IN ('New', 'Contacted', 'In Discussion', 'Enrolled', 'Closed')),
    priority TEXT DEFAULT 'Medium' CHECK(priority IN ('High', 'Medium', 'Low')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_enquiries_phone ON enquiries(phone);

-- 2. COURSES TABLE
DROP TABLE IF EXISTS courses;
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    duration TEXT,
    eligibility TEXT,
    popular INTEGER DEFAULT 1
);

-- 3. CAREER SERVICES TABLE
CREATE TABLE IF NOT EXISTS career_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_audience TEXT
);

-- 4. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SEED DATA
-- ================================================================

-- Default Settings
INSERT OR REPLACE INTO settings (key, value) VALUES
    ('consultancy_name', 'SOFT Education Consultancy'),
    ('founder_name', 'Ashutosh Kumar'),
    ('primary_phone', '+91 91176 96512'),
    ('whatsapp_number', '919117696512'),
    ('tagline', 'Your Career. Our Guidance.'),
    ('admin_pin', 'softadmin2026');

-- Courses Seed (Including BLIS, MLIS, PGDCA, PGDGC, ANM, GNM, B.Sc Nursing, BCA, BBA, MCA, MBA, B.Tech)
INSERT OR REPLACE INTO courses (code, title, category, duration, eligibility, popular) VALUES
    ('BLIS', 'Bachelor of Library and Information Science (BLIS)', 'Library Science', '1 Year', 'Graduation in any stream from recognized university', 1),
    ('MLIS', 'Master of Library and Information Science (MLIS)', 'Library Science', '1 Year', 'Bachelor of Library & Information Science (BLIS)', 1),
    ('PGDCA', 'Post Graduate Diploma in Computer Applications (PGDCA)', 'Computer & IT', '1 Year', 'Graduation in any stream with basic computer interest', 1),
    ('PGDGC', 'Post Graduate Diploma in Guidance and Counselling (PGDGC)', 'Education & Counselling', '1 Year', 'Graduation in any discipline (Psychology/Education preferred)', 1),
    ('ANM', 'Auxiliary Nurse Midwifery (ANM)', 'Nursing & Healthcare', '2 Years', '10+2 (Intermediate) in any stream with min 40-45%', 1),
    ('GNM', 'General Nursing and Midwifery (GNM)', 'Nursing & Healthcare', '3 Years', '10+2 with Science (PCB) or Arts/Commerce with min 40-45%', 1),
    ('BSC_NURSING', 'Bachelor of Science in Nursing (B.Sc Nursing)', 'Nursing & Healthcare', '4 Years', '10+2 with Physics, Chemistry, Biology & English with min 45-50%', 1),
    ('BCA', 'Bachelor of Computer Applications (BCA)', 'Computer & IT', '3 Years', '10+2 with Mathematics/CS preferred', 1),
    ('BBA', 'Bachelor of Business Administration (BBA)', 'Management & Business', '3 Years', '10+2 in any stream (Commerce/Arts/Science)', 1),
    ('BTECH', 'Bachelor of Technology (B.Tech - CSE, AI, IT)', 'Engineering & Tech', '4 Years', '10+2 with Physics, Chemistry & Maths', 1),
    ('MCA', 'Master of Computer Applications (MCA)', 'Computer & IT', '2 Years', 'BCA / B.Sc / Any Graduate with Maths at 10+2 or UG', 1),
    ('MBA', 'Master of Business Administration (MBA)', 'Management & Business', '2 Years', 'Graduation in any stream with min 50%', 1);

-- Career Services Seed
INSERT OR REPLACE INTO career_services (title, description, target_audience) VALUES
    ('Resume & Profile Optimization', 'Craft modern, ATS-compliant resumes and LinkedIn profiles that stand out to HR recruiters.', 'Freshers & Working Professionals'),
    ('Mock Interview Preparation', 'One-on-one mock interview sessions with feedback on technical & HR behavioral questions.', 'Job Seekers & Final Year Students'),
    ('Job Search & Application Strategy', 'Tailored direction on identifying legitimate hiring drives, company referrals, and job portals.', 'Graduates looking for placements'),
    ('Career Transition Counselling', 'Guidance for professionals looking to shift streams into IT, Management, or emerging technologies.', 'Experienced candidates');

-- Sample initial enquiries for testing & verification
INSERT OR IGNORE INTO enquiries (lead_id, name, phone, email, enquiry_type, interested_course, preferred_location, message, source_page, status, priority, notes) VALUES
    ('SOFT-2026-101', 'Rahul Sharma', '+91 98765 43210', 'rahul.s@example.com', 'College Admissions', 'BCA', 'Delhi NCR / Bangalore', 'Interested in top BCA colleges with placement support.', 'admissions.html', 'New', 'High', 'Scheduled initial callback'),
    ('SOFT-2026-102', 'Priya Patel', '+91 98123 45678', 'priya.p@example.com', 'College Admissions', 'B.Sc Nursing', 'Patna / Bangalore', 'Interested in INC approved B.Sc Nursing colleges with hospital training.', 'admissions.html', 'Contacted', 'High', 'Sent fee structure and hospital affiliation details'),
    ('SOFT-2026-103', 'Ritu Raj', '+91 97234 56789', 'ritu.raj@example.com', 'College Admissions', 'GNM', 'Patna / Ranchi', 'Completed 12th PCB. Looking for GNM Nursing admission.', 'admissions.html', 'In Discussion', 'Medium', 'Discussion on nursing entrance and hostel facilities'),
    ('SOFT-2026-104', 'Aman Verma', '+91 99345 67890', 'aman.verma@example.com', 'College Admissions', 'BLIS', 'Bihar / Distance & Regular', 'Graduated B.A. Wants to enroll in BLIS library science.', 'admissions.html', 'Enrolled', 'Medium', 'Enrolled in BLIS session with Ashutosh Sir');
