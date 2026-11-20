#!/usr/bin/env python3
"""
Export Enquiries from SQLite Database to CSV
"""
import os
import sqlite3
import csv
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, 'consultancy.db')
TIMESTAMP = datetime.now().strftime('%Y%m%d_%H%M%S')
OUTPUT_CSV = os.path.join(BASE_DIR, f'enquiries_export_{TIMESTAMP}.csv')

def export_to_csv():
    if not os.path.exists(DB_FILE):
        print(f"Error: Database file not found at {DB_FILE}")
        return

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT lead_id, name, phone, email, enquiry_type, interested_course, 
               preferred_location, message, source_page, status, priority, notes, created_at
        FROM enquiries
        ORDER BY created_at DESC
    """)

    rows = cursor.fetchall()
    headers = [description[0] for description in cursor.description]

    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)

    print(f" Successfully exported {len(rows)} enquiries to:")
    print(f"   {OUTPUT_CSV}")

    conn.close()

if __name__ == '__main__':
    export_to_csv()
