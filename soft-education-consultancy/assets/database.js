/**
 * SOFT Education Consultancy — Unified Client Database Engine
 * IndexedDB + LocalStorage Sync + REST API Bridge
 * Stores enquiries offline-first, persists in browser, and syncs with backend.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SoftDB = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DB_NAME = 'SOFT_Consultancy_DB';
  const DB_VERSION = 1;
  const STORE_NAME = 'enquiries';
  const STORAGE_KEY = 'soft_consultancy_enquiries_backup';

  const INITIAL_SEED = [
    {
      id: 'SOFT-2026-101',
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul.s@example.com',
      enquiry_type: 'College Admissions',
      interested_course: 'BCA',
      preferred_location: 'Delhi NCR / Bangalore',
      message: 'Interested in top BCA colleges with placement support.',
      source_page: 'admissions.html',
      status: 'New',
      priority: 'High',
      notes: 'Scheduled initial callback for tomorrow 11 AM',
      created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
    },
    {
      id: 'SOFT-2026-102',
      name: 'Priya Patel',
      phone: '+91 98123 45678',
      email: 'priya.p@example.com',
      enquiry_type: 'College Admissions',
      interested_course: 'MBA',
      preferred_location: 'Pune / Mumbai',
      message: 'Completed B.Com with 68%. Looking for MBA in Marketing & Finance.',
      source_page: 'index.html',
      status: 'Contacted',
      priority: 'Medium',
      notes: 'Sent fee structure and brochure via WhatsApp',
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 18).toISOString()
    },
    {
      id: 'SOFT-2026-103',
      name: 'Aman Verma',
      phone: '+91 97234 56789',
      email: 'aman.verma@example.com',
      enquiry_type: 'Job Assistance',
      interested_course: 'Freshers IT Opportunities',
      preferred_location: 'Bangalore / Remote',
      message: 'Graduated BCA in 2025. Needs resume guidance and entry-level software job.',
      source_page: 'careers.html',
      status: 'In Discussion',
      priority: 'High',
      notes: 'Resume review in progress. Scheduled mock HR interview',
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
      id: 'SOFT-2026-104',
      name: 'Sneha Kumari',
      phone: '+91 99345 67890',
      email: 'sneha.k@example.com',
      enquiry_type: 'Course Counselling',
      interested_course: 'MCA vs MBA',
      preferred_location: 'Patna / Kolkata',
      message: 'Confused whether to pursue MCA or MBA after BCA.',
      source_page: 'contact.html',
      status: 'Enrolled',
      priority: 'Medium',
      notes: 'Enrolled in MCA Guidance & Counselling Program with Ashutosh Sir',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ];

  let dbInstance = null;

  function openIndexedDB() {
    return new Promise((resolve, reject) => {
      if (dbInstance) return resolve(dbInstance);
      if (!window.indexedDB) {
        return resolve(null); // Fallback to localStorage
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = function (event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('enquiry_type', 'enquiry_type', { unique: false });
          store.createIndex('created_at', 'created_at', { unique: false });
          store.createIndex('phone', 'phone', { unique: false });
        }
      };

      request.onsuccess = function (event) {
        dbInstance = event.target.result;
        resolve(dbInstance);
      };

      request.onerror = function (event) {
        console.warn('IndexedDB failed to open, using LocalStorage fallback.', event.target.error);
        resolve(null);
      };
    });
  }

  function getLocalBackup() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }
    return [...INITIAL_SEED];
  }

  function saveLocalBackup(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  function generateLeadId() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `SOFT-${year}-${random}`;
  }

  const SoftDB = {
    async init() {
      const db = await openIndexedDB();
      const existing = await this.getAllEnquiries();
      if (!existing || existing.length === 0) {
        // Seed initial records
        for (const item of INITIAL_SEED) {
          await this.saveEnquiry(item, false);
        }
      }
      return true;
    },

    async saveEnquiry(record, triggerSync = true) {
      const db = await openIndexedDB();
      const now = new Date().toISOString();

      const item = {
        id: record.id || generateLeadId(),
        name: (record.name || '').trim(),
        phone: (record.phone || '').trim(),
        email: (record.email || '').trim(),
        enquiry_type: record.enquiry_type || record.interest || 'General Enquiry',
        interested_course: record.interested_course || record.course || record.interest || 'General Guidance',
        preferred_location: record.preferred_location || record.location || 'Not specified',
        message: (record.message || '').trim(),
        source_page: record.source_page || window.location.pathname.split('/').pop() || 'index.html',
        status: record.status || 'New',
        priority: record.priority || 'Medium',
        notes: record.notes || '',
        created_at: record.created_at || now,
        updated_at: now
      };

      // 1. Save in IndexedDB
      if (db) {
        await new Promise((resolve, reject) => {
          const tx = db.transaction([STORE_NAME], 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.put(item);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      }

      // 2. Keep LocalStorage in sync as immediate failover
      const current = getLocalBackup();
      const idx = current.findIndex(i => i.id === item.id);
      if (idx >= 0) {
        current[idx] = item;
      } else {
        current.unshift(item);
      }
      saveLocalBackup(current);

      // 3. Fire custom event for any open UI tabs/dashboards
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('soft-db-change', { detail: item }));
      }

      // 4. Try syncing with local backend if available
      if (triggerSync) {
        this.syncRecordToBackend(item).catch(() => {});
      }

      return item;
    },

    async getAllEnquiries(filter = {}) {
      const db = await openIndexedDB();
      let list = [];

      if (db) {
        list = await new Promise((resolve) => {
          const tx = db.transaction([STORE_NAME], 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve(getLocalBackup());
        });
      } else {
        list = getLocalBackup();
      }

      if (!list || list.length === 0) {
        list = getLocalBackup();
      }

      // Filter logic
      if (filter.status && filter.status !== 'all') {
        list = list.filter(i => (i.status || '').toLowerCase() === filter.status.toLowerCase());
      }
      if (filter.type && filter.type !== 'all') {
        list = list.filter(i => (i.enquiry_type || '').toLowerCase().includes(filter.type.toLowerCase()));
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        list = list.filter(i =>
          (i.name || '').toLowerCase().includes(q) ||
          (i.phone || '').includes(q) ||
          (i.email || '').toLowerCase().includes(q) ||
          (i.interested_course || '').toLowerCase().includes(q) ||
          (i.id || '').toLowerCase().includes(q)
        );
      }

      // Sort by newest first
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return list;
    },

    async getEnquiry(id) {
      const list = await this.getAllEnquiries();
      return list.find(i => i.id === id) || null;
    },

    async updateStatus(id, newStatus, notes) {
      const item = await this.getEnquiry(id);
      if (!item) return false;
      item.status = newStatus;
      if (notes !== undefined) item.notes = notes;
      item.updated_at = new Date().toISOString();
      await this.saveEnquiry(item, true);
      return item;
    },

    async deleteEnquiry(id) {
      const db = await openIndexedDB();
      if (db) {
        await new Promise((resolve) => {
          const tx = db.transaction([STORE_NAME], 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.delete(id);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        });
      }
      let current = getLocalBackup();
      current = current.filter(i => i.id !== id);
      saveLocalBackup(current);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('soft-db-change', { detail: { deleted: id } }));
      }

      try {
        await fetch(`/api/enquiries/${id}`, { method: 'DELETE' });
      } catch (e) {}

      return true;
    },

    async getStats() {
      const list = await this.getAllEnquiries();
      const today = new Date().toISOString().slice(0, 10);

      const stats = {
        total: list.length,
        todayCount: list.filter(i => (i.created_at || '').slice(0, 10) === today).length,
        newCount: list.filter(i => (i.status || '').toLowerCase() === 'new').length,
        contactedCount: list.filter(i => (i.status || '').toLowerCase() === 'contacted').length,
        discussionCount: list.filter(i => (i.status || '').toLowerCase() === 'in discussion').length,
        enrolledCount: list.filter(i => (i.status || '').toLowerCase() === 'enrolled').length,
        admissionsCount: list.filter(i => (i.enquiry_type || '').toLowerCase().includes('admissions')).length,
        careersCount: list.filter(i => (i.enquiry_type || '').toLowerCase().includes('job') || (i.enquiry_type || '').toLowerCase().includes('career')).length
      };

      return stats;
    },

    async exportToCSV() {
      const list = await this.getAllEnquiries();
      if (!list.length) {
        alert('No enquiries found in the database to export.');
        return;
      }

      const headers = [
        'Lead ID',
        'Date & Time',
        'Student / Candidate Name',
        'Phone Number',
        'Email Address',
        'Enquiry Type',
        'Course / Interest',
        'Preferred Location',
        'Status',
        'Priority',
        'Source Page',
        'Staff Notes',
        'Message'
      ];

      const rows = list.map(i => [
        `"${(i.id || '').replace(/"/g, '""')}"`,
        `"${new Date(i.created_at).toLocaleString()}"`,
        `"${(i.name || '').replace(/"/g, '""')}"`,
        `"${(i.phone || '').replace(/"/g, '""')}"`,
        `"${(i.email || '').replace(/"/g, '""')}"`,
        `"${(i.enquiry_type || '').replace(/"/g, '""')}"`,
        `"${(i.interested_course || '').replace(/"/g, '""')}"`,
        `"${(i.preferred_location || '').replace(/"/g, '""')}"`,
        `"${(i.status || '').replace(/"/g, '""')}"`,
        `"${(i.priority || '').replace(/"/g, '""')}"`,
        `"${(i.source_page || '').replace(/"/g, '""')}"`,
        `"${(i.notes || '').replace(/"/g, '""')}"`,
        `"${(i.message || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `SOFT_Enquiries_${new Date().toISOString().slice(0, 10)}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    async exportToJSON() {
      const list = await this.getAllEnquiries();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(list, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `SOFT_DB_Backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    },

    async syncRecordToBackend(item) {
      try {
        const response = await fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        return response.ok;
      } catch (err) {
        // Backend not running currently; client storage has safely persisted it
        return false;
      }
    }
  };

  // Initialize immediately
  SoftDB.init().catch(console.error);

  return SoftDB;
});
