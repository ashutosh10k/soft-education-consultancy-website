# SOFT Education Consultancy — Database & Administration Guide

## 📌 Overview

The **SOFT Education Consultancy** website is equipped with a complete, multi-tiered database system designed for reliability, offline capability, and production deployment.

---

## 🗄️ Database Architecture

The website incorporates a hybrid database architecture:

1. **SQLite Database (`database/consultancy.db`)**:
   - Location: `database/consultancy.db`
   - Schema file: `database/schema.sql`
   - Initialization script: `database/init_db.py`
   - Command-line export script: `database/export_csv.py`
   - Fully relational with foreign keys, indexes, and tables:
     - `enquiries` (Lead ID, Name, Phone, Email, Type, Course, Location, Status, Notes, Timestamps)
     - `courses` (B.Sc Nursing, GNM, ANM, BLIS, MLIS, PGDCA, PGDGC, BCA, BBA, MCA, MBA details)
     - `career_services` (Resume, Mock Interview, Job Search)
     - `settings` (Business configuration)

2. **Browser Client Database (`assets/database.js`)**:
   - Uses **IndexedDB** (`SOFT_Consultancy_DB`) with automatic **LocalStorage** fallback.
   - Saves every form submission instantly into local browser database even without internet or backend server.
   - Automatically syncs new records to the Python SQLite backend REST API (`POST /api/enquiries`) when the server is active.
   - Broadcasts real-time events (`soft-db-change`) so any open admin tab updates automatically without page reload.

---

## 🔐 Admin Dashboard Portal (`admin.html`)

The consultancy administrator can manage all student leads and inquiries:

- **URL:** [admin.html](file:///c:/Users/Aashutosh/OneDrive/Desktop/soft-education-consultancy-website/soft-education-consultancy/admin.html) or `http://localhost:5000/admin.html`
- **Default Security PIN / Password:** `softadmin2026` (or `91176`)

### Admin Features:
- 📊 **Real-Time Counters**: Total Inquiries, College Admissions Leads, Job & Career Leads, New / Pending Follow-ups.
- 🔍 **Live Search**: Instantly search by student name, phone, course, email, or Lead ID.
- 🎯 **Filter By**:
  - Category: College Admissions, Job Assistance, Course Guidance, General.
  - Status: New, Contacted, In Discussion, Enrolled / Placed, Closed.
- 📞 **1-Click Call & WhatsApp**: Click 📞 to call or 💬 to initiate WhatsApp chat with the lead.
- 🔄 **Status Dropdown**: Change lead status live in the table.
- 📝 **Lead Details & Staff Notes**: View complete candidate message and save follow-up conversation notes.
- 📥 **Export to Excel / CSV**: 1-click download of all stored leads formatted for Microsoft Excel or Google Sheets.
- ➕ **Add Manual Lead**: Enter walk-in candidates or phone inquiries directly into the database.

---

## 🚀 How to Run the Website & Server

### Option A: Direct Browser Use (No server needed)
Double-click any `.html` file (e.g. `index.html` or `admin.html`) in Google Chrome or Microsoft Edge.
Forms will save directly into browser IndexedDB and open WhatsApp.

### Option B: Local Python Web & Database Server
1. Double-click `run-website.bat`, or
2. Run in terminal:
   ```powershell
   cd soft-education-consultancy
   python server.py
   ```
3. Open `http://localhost:5000` in your browser.

---

## 📱 Responsive Views Included

1. **Desktop View (1024px – 1440px+)**:
   - Full 1200px container with sticky glassmorphism header
   - Topbar with direct phone and WhatsApp links
   - 2-Column Hero featuring official high-resolution logo showcase card and floating badges
   - 3-Column service cards and 4-column admission roadmap
   - Rich 4-column footer with quick links and office timings

2. **Tab / Tablet View (768px – 1024px, iPads & Android Tablets)**:
   - Proportional 2-column hero layout
   - 2-Column responsive cards grid
   - 2x2 step roadmap
   - Tablet-optimized navigation and form cards

3. **Mobile View (320px – 767px, Smartphones)**:
   - Compact sticky header with animated hamburger menu button
   - Full-height slide-in mobile navigation drawer with backdrop
   - Touch-friendly buttons (min 48px height)
   - 16px form inputs to prevent automatic iOS zoom
   - **Floating Bottom Action Bar**: Fixed bottom bar with 1-tap **Call Now** and **WhatsApp** buttons for maximum lead conversion on mobile phones!
