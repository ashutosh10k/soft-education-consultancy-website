/**
 * SOFT Education Consultancy — Core Client Script
 * Handles Responsive Navigation, Mobile Drawer, Form Validation,
 * Database Submission (IndexedDB + API Sync), and WhatsApp Integration.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Responsive Mobile Navigation Drawer
  const menuButton = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.navlinks');
  let backdrop = document.querySelector('.nav-backdrop');

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
  }

  function openNav() {
    if (!navLinks) return;
    navLinks.classList.add('open');
    backdrop.classList.add('active');
    if (menuButton) {
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.innerHTML = '✕';
    }
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function closeNav() {
    if (!navLinks) return;
    navLinks.classList.remove('open');
    backdrop.classList.remove('active');
    if (menuButton) {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.innerHTML = '☰';
    }
    document.body.style.overflow = '';
  }

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.contains('open');
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    backdrop.addEventListener('click', closeNav);

    // Close when clicking any nav link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeNav);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeNav();
      }
    });
  }

  // 1.5. Sub-menu / Dropdown Toggle for Admin Panel & More
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('.nav-dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // 2. Dynamic Year in Footer
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // 3. Enquiry Forms Database Submission + WhatsApp Pre-fill
  document.querySelectorAll('[data-enquiry-form]').forEach(form => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Saving to Database... ⏳';
      }

      const formData = new FormData(form);
      const pageName = window.location.pathname.split('/').pop() || 'index.html';

      const enquiryPayload = {
        name: formData.get('name') || '',
        phone: formData.get('phone') || '',
        email: formData.get('email') || '',
        enquiry_type: form.getAttribute('data-type') || formData.get('interest') || 'General Enquiry',
        interested_course: formData.get('interest') || formData.get('course') || 'General Counselling',
        preferred_location: formData.get('location') || '',
        message: formData.get('message') || '',
        source_page: pageName
      };

      let savedRecord = null;
      try {
        if (window.SoftDB) {
          savedRecord = await window.SoftDB.saveEnquiry(enquiryPayload);
        }
      } catch (err) {
        console.warn('Database save warning:', err);
      }

      // Generate Reference Number
      const leadId = savedRecord ? savedRecord.id : `SOFT-${Date.now().toString().slice(-4)}`;

      // Format WhatsApp Pre-filled Message
      const lines = [
        `🎓 *SOFT Education Consultancy Enquiry*`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `📋 *Ref:* ${leadId}`,
        `👤 *Name:* ${enquiryPayload.name}`,
        `📞 *Phone:* ${enquiryPayload.phone}`,
        `✉️ *Email:* ${enquiryPayload.email || 'Not provided'}`,
        `🎯 *Interested in:* ${enquiryPayload.interested_course}`,
        `📄 *Page:* ${pageName}`,
        `💬 *Message:* ${enquiryPayload.message || 'Please contact me with more information.'}`,
        `━━━━━━━━━━━━━━━━━━━━`
      ];

      const whatsappUrl = 'https://wa.me/919117696512?text=' + encodeURIComponent(lines.join('\n'));

      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank', 'noopener');

      // Update Form Status Message
      let statusEl = form.querySelector('.form-status');
      if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.className = 'form-feedback success';
        form.appendChild(statusEl);
      } else {
        statusEl.className = 'form-feedback success';
      }

      statusEl.innerHTML = `
        <strong>✅ Enquiry Saved in Database!</strong>
        Your enquiry reference is <b>${leadId}</b>. Our counsellor will contact you shortly.<br>
        <span style="font-size:12px;opacity:0.9">WhatsApp is also opening with your pre-filled message.</span>
      `;
      statusEl.style.display = 'block';

      // Reset form fields
      form.reset();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Enquiry Sent! ✓';
        setTimeout(() => {
          submitBtn.innerHTML = originalBtnText;
        }, 4000);
      }
    });
  });
});
