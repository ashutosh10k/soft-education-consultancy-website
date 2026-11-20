#!/usr/bin/env python3
"""
SOFT Education Consultancy — Full-Stack Backend Server
Python 3 standard library only (zero external pip dependencies).
Serves website files + provides REST API connected to SQLite database.
"""

import http.server
import socketserver
import os
import sys
import json
import sqlite3
import urllib.parse
from datetime import datetime

PORT = 5000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, 'database', 'consultancy.db')

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

class SoftAppHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def send_json(self, status_code, payload):
        data = json.dumps(payload).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/enquiries':
            self.handle_get_enquiries(parsed.query)
            return
        elif path == '/api/stats':
            self.handle_get_stats()
            return
        elif path == '/api/courses':
            self.handle_get_courses()
            return
        elif path == '/api/export-csv':
            self.handle_export_csv()
            return

        # Default static file handling
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/enquiries':
            self.handle_post_enquiry()
            return

        self.send_json(404, {'error': 'Endpoint not found'})

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith('/api/enquiries/'):
            lead_id = path.split('/')[-1]
            self.handle_put_enquiry(lead_id)
            return

        self.send_json(404, {'error': 'Endpoint not found'})

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith('/api/enquiries/'):
            lead_id = path.split('/')[-1]
            self.handle_delete_enquiry(lead_id)
            return

        self.send_json(404, {'error': 'Endpoint not found'})

    def parse_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            body = self.rfile.read(content_length).decode('utf-8')
            return json.loads(body)
        return {}

    # Handler Methods
    def handle_get_enquiries(self, query_string):
        query_params = urllib.parse.parse_qs(query_string)
        status_filter = query_params.get('status', [None])[0]

        conn = get_db()
        cursor = conn.cursor()

        if status_filter and status_filter != 'all':
            cursor.execute("SELECT * FROM enquiries WHERE LOWER(status) = LOWER(?) ORDER BY created_at DESC", (status_filter,))
        else:
            cursor.execute("SELECT * FROM enquiries ORDER BY created_at DESC")

        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        self.send_json(200, {'success': True, 'count': len(rows), 'data': rows})

    def handle_get_stats(self):
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM enquiries")
        total = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM enquiries WHERE LOWER(status) = 'new'")
        new_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM enquiries WHERE LOWER(status) = 'contacted'")
        contacted = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM enquiries WHERE LOWER(status) = 'enrolled'")
        enrolled = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM enquiries WHERE LOWER(enquiry_type) LIKE '%admission%'")
        admissions = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM enquiries WHERE LOWER(enquiry_type) LIKE '%job%' OR LOWER(enquiry_type) LIKE '%career%'")
        careers = cursor.fetchone()[0]

        conn.close()
        self.send_json(200, {
            'success': True,
            'total': total,
            'newCount': new_count,
            'contactedCount': contacted,
            'enrolledCount': enrolled,
            'admissionsCount': admissions,
            'careersCount': careers
        })

    def handle_get_courses(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM courses ORDER BY category, title")
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        self.send_json(200, {'success': True, 'data': rows})

    def handle_post_enquiry(self):
        try:
            data = self.parse_body()
            name = (data.get('name') or '').strip()
            phone = (data.get('phone') or '').strip()

            if not name or not phone:
                self.send_json(400, {'error': 'Name and phone are required'})
                return

            lead_id = data.get('id')
            if not lead_id:
                year = datetime.now().year
                cursor_lead = get_db().cursor()
                cursor_lead.execute("SELECT COUNT(*) FROM enquiries")
                lead_count = cursor_lead.fetchone()[0] + 1
                lead_id = f"SOFT-{year}-{100 + lead_count}"

            email = (data.get('email') or '').strip()
            enquiry_type = data.get('enquiry_type') or data.get('interest') or 'General Enquiry'
            course = data.get('interested_course') or data.get('course') or data.get('interest') or ''
            location = data.get('preferred_location') or data.get('location') or ''
            message = (data.get('message') or '').strip()
            source_page = data.get('source_page') or 'Website'
            status = data.get('status') or 'New'
            priority = data.get('priority') or 'Medium'
            notes = data.get('notes') or ''

            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO enquiries 
                (lead_id, name, phone, email, enquiry_type, interested_course, preferred_location, message, source_page, status, priority, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (lead_id, name, phone, email, enquiry_type, course, location, message, source_page, status, priority, notes))
            conn.commit()
            conn.close()

            self.send_json(201, {'success': True, 'lead_id': lead_id, 'message': 'Enquiry saved successfully to database'})
        except Exception as e:
            self.send_json(500, {'error': str(e)})

    def handle_put_enquiry(self, lead_id):
        try:
            data = self.parse_body()
            status = data.get('status')
            notes = data.get('notes')
            priority = data.get('priority')

            conn = get_db()
            cursor = conn.cursor()

            updates = []
            params = []
            if status is not None:
                updates.append("status = ?")
                params.append(status)
            if notes is not None:
                updates.append("notes = ?")
                params.append(notes)
            if priority is not None:
                updates.append("priority = ?")
                params.append(priority)

            updates.append("updated_at = CURRENT_TIMESTAMP")
            params.append(lead_id)

            sql = f"UPDATE enquiries SET {', '.join(updates)} WHERE lead_id = ? OR id = ?"
            params.append(lead_id)
            cursor.execute(sql, params)
            conn.commit()
            conn.close()

            self.send_json(200, {'success': True, 'message': 'Enquiry updated successfully'})
        except Exception as e:
            self.send_json(500, {'error': str(e)})

    def handle_delete_enquiry(self, lead_id):
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM enquiries WHERE lead_id = ? OR id = ?", (lead_id, lead_id))
            conn.commit()
            conn.close()
            self.send_json(200, {'success': True, 'message': f'Enquiry {lead_id} deleted'})
        except Exception as e:
            self.send_json(500, {'error': str(e)})

    def handle_export_csv(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT lead_id, name, phone, email, enquiry_type, interested_course, status, created_at, notes FROM enquiries ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()

        csv_lines = ["Lead ID,Name,Phone,Email,Enquiry Type,Interested Course,Status,Created At,Notes"]
        for r in rows:
            csv_lines.append(f'"{r[0]}","{r[1]}","{r[2]}","{r[3]}","{r[4]}","{r[5]}","{r[6]}","{r[7]}","{r[8] or ""}"')

        csv_data = "\r\n".join(csv_lines).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'text/csv; charset=utf-8')
        self.send_header('Content-Disposition', 'attachment; filename="enquiries.csv"')
        self.send_header('Content-Length', str(len(csv_data)))
        self.end_headers()
        self.wfile.write(csv_data)

def main():
    # Ensure database is initialized
    if not os.path.exists(DB_FILE):
        print("Database not found. Initializing...")
        from database.init_db import init_database
        init_database()

    print("=" * 60)
    print("  SOFT EDUCATION CONSULTANCY — WEB & DATABASE SERVER")
    print("=" * 60)
    print(f" SQLite Database: {DB_FILE}")
    print(f" Web & API Server: http://localhost:{PORT}")
    print(f" Admin Dashboard:  http://localhost:{PORT}/admin.html")
    print(f" Main Website:     http://localhost:{PORT}/index.html")
    print("-" * 60)
    print(" Press Ctrl+C to stop the server.")
    print("=" * 60)

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), SoftAppHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server cleanly...")
            httpd.server_close()

if __name__ == '__main__':
    main()
