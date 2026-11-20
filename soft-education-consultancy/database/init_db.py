#!/usr/bin/env python3
"""
Initialize and Seed SOFT Education Consultancy SQLite Database
"""
import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCHEMA_FILE = os.path.join(BASE_DIR, 'schema.sql')
DB_FILE = os.path.join(BASE_DIR, 'consultancy.db')

def init_database():
    print(f"Connecting to database: {DB_FILE}")
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
        schema_sql = f.read()

    cursor.executescript(schema_sql)
    conn.commit()

    # Verify counts
    cursor.execute("SELECT COUNT(*) FROM enquiries;")
    enquiries_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM courses;")
    courses_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM career_services;")
    services_count = cursor.fetchone()[0]

    print(" Database initialized successfully!")
    print(f"   Enquiries seeded: {enquiries_count}")
    print(f"   Courses available: {courses_count}")
    print(f"   Career services: {services_count}")
    conn.close()

if __name__ == '__main__':
    init_database()
