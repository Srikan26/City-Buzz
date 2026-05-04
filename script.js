  'use strict';

  // ────────────────────────────────────────────
  //  THEME TOGGLE
  // ────────────────────────────────────────────
  const themeBtn = document.getElementById('themeBtn');
  let darkMode = true;

  themeBtn.addEventListener('click', () => {
    darkMode = !darkMode;
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    themeBtn.setAttribute('aria-pressed', String(!darkMode));
    themeBtn.innerHTML = darkMode
      ? '<span aria-hidden="true">☀️</span> Light'
      : '<span aria-hidden="true">🌙</span> Dark';
    toast('info', darkMode ? '🌙 Dark mode on' : '☀️ Light mode on');
  });

  // ────────────────────────────────────────────
  //  PARTY MODE
  // ────────────────────────────────────────────
  const partyBtn = document.getElementById('partyBtn');
  let partyOn = false;

  partyBtn.addEventListener('click', () => {
    partyOn = !partyOn;
    document.body.classList.toggle('party-mode', partyOn);
    partyBtn.setAttribute('aria-pressed', String(partyOn));
    partyBtn.innerHTML = partyOn
      ? '<span aria-hidden="true">🛑</span> Stop'
      : '<span aria-hidden="true">🎉</span> Party';
    toast('info', partyOn ? '🎉 Party mode on!' : '😴 Party mode off');
  });

  // ────────────────────────────────────────────
  //  MOBILE NAV
  // ────────────────────────────────────────────
  const menuBtn    = document.getElementById('menuBtn');
  const mobileNav  = document.getElementById('mobileNav');
  const mobileClose= document.getElementById('mobileClose');

  function openMobile() {
    mobileNav.removeAttribute('hidden');
    mobileNav.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    mobileClose.focus();
  }
  function closeMobile() {
    mobileNav.setAttribute('hidden', '');
    mobileNav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.focus();
  }
  menuBtn.addEventListener('click', openMobile);
  mobileClose.addEventListener('click', closeMobile);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mobileNav.hasAttribute('hidden')) closeMobile(); });

  // ────────────────────────────────────────────
  //  EVENT FILTER
  // ────────────────────────────────────────────
  const filterPills = document.querySelectorAll('.filter-pill');
  const eventCards  = document.querySelectorAll('.event-card');
  const noResults   = document.getElementById('noResults');

  filterPills.forEach(btn => {
    btn.addEventListener('click', () => {
      filterPills.forEach(b => { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      const filter = btn.dataset.filter;
      let visible = 0;
      eventCards.forEach(card => {
        const show = filter === 'all' || card.dataset.cat === filter;
        card.hidden = !show;
        if (show) visible++;
      });
      noResults.hidden = visible > 0;
    });
  });

  // ────────────────────────────────────────────
  //  BOOKING MODAL
  // ────────────────────────────────────────────
  const overlay = document.getElementById('modalOverlay');
  const closeBtn= document.getElementById('modalCloseBtn');
  let modalPrice = 0;
  let seatCount  = 1;
  let lastFocusedEl = null;

  // Trap focus inside modal
  const focusableSelectors = 'button:not([disabled]), input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])';

  function trapFocus(e) {
    const focusable = Array.from(overlay.querySelectorAll(focusableSelectors));
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  function openModal(name, subtitle, price) {
    modalPrice = price;
    seatCount  = 1;
    document.getElementById('modal-title').textContent    = name;
    document.getElementById('modal-subtitle').textContent = subtitle;
    document.getElementById('mName').value  = '';
    document.getElementById('mEmail').value = '';
    clearFieldError('mName');
    clearFieldError('mEmail');
    updatePrice();
    lastFocusedEl = document.activeElement;
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('mName').focus(), 50);
    document.addEventListener('keydown', trapFocus);
  }

  function closeModal() {
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trapFocus);
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.getAttribute('aria-hidden') === 'false') closeModal(); });

  function chgSeats(delta) {
    seatCount = Math.max(1, Math.min(10, seatCount + delta));
    document.getElementById('seatNum').textContent = seatCount;
    document.getElementById('seatMinus').disabled  = seatCount <= 1;
    document.getElementById('seatPlus').disabled   = seatCount >= 10;
    updatePrice();
  }

  function updatePrice() {
    const total = modalPrice * seatCount;
    document.getElementById('priceLabel').textContent =
      modalPrice === 0
        ? `${seatCount} seat${seatCount > 1 ? 's' : ''} — Free`
        : `${seatCount} seat${seatCount > 1 ? 's' : ''} × $${modalPrice}`;
    document.getElementById('priceTotal').textContent =
      modalPrice === 0 ? 'FREE' : '$' + total;
  }

  function confirmBooking() {
    const name  = document.getElementById('mName').value.trim();
    const email = document.getElementById('mEmail').value.trim();
    let valid = true;
    clearFieldError('mName');  clearFieldError('mEmail');

    if (!name)  { setFieldError('mName',  'Please enter your name.');               valid = false; }
    if (!email) { setFieldError('mEmail', 'Please enter your email address.');       valid = false; }
    else if (!isValidEmail(email)) { setFieldError('mEmail', 'Please enter a valid email address.'); valid = false; }

    if (!valid) return;

    const evName = document.getElementById('modal-title').textContent;
    const totalStr = modalPrice === 0 ? 'Free' : '$' + (modalPrice * seatCount);
    closeModal();
    toast('success', `Booked! ${seatCount} seat${seatCount > 1 ? 's' : ''} for "${evName}" (${totalStr}) — confirmation sent to ${email}.`);
  }

  // ────────────────────────────────────────────
  //  ADD TO CALENDAR
  // ────────────────────────────────────────────
  function addToCalendar(name, time, loc) {
    const url = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(name)}&location=${encodeURIComponent(loc)}&details=${encodeURIComponent('CityBuzz – ' + name)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    toast('info', `Opening Google Calendar for "${name}"`);
  }

  // ────────────────────────────────────────────
  //  REVIEW FORM
  // ────────────────────────────────────────────
  function submitReview() {
    const name  = document.getElementById('revName').value.trim();
    const event = document.getElementById('revEvent').value;
    const text  = document.getElementById('revText').value.trim();
    let valid = true;
    clearFieldError('revName');  clearFieldError('revEvent');  clearFieldError('revText');

    if (!name)          { setFieldError('revName',  'Please enter your name.');         valid = false; }
    if (!event)         { setFieldError('revEvent', 'Please select an event.');          valid = false; }
    if (text.length < 10) { setFieldError('revText', 'Review must be at least 10 characters.'); valid = false; }
    if (!valid) return;

    const initial = name.trim()[0].toUpperCase();
    const card = document.createElement('article');
    card.className = 'testi-card';
    card.style.cssText = 'opacity:0;transform:translateY(12px);transition:all .4s ease;';
    card.innerHTML = `
      <div class="testi-stars" aria-label="5 out of 5 stars">★★★★★</div>
      <p class="testi-text">"${esc(text)}"</p>
      <footer class="testi-author">
        <div class="testi-avatar" aria-hidden="true">${esc(initial)}</div>
        <div>
          <div class="testi-name">${esc(name)}</div>
          <div class="testi-event">${esc(event)}</div>
        </div>
      </footer>`;
    document.getElementById('testiGrid').appendChild(card);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }));

    document.getElementById('reviewForm').reset();
    toast('success', `Thanks, ${name}! Your review has been added.`);
  }

  // ────────────────────────────────────────────
  //  RSVP FORM
  // ────────────────────────────────────────────
  function submitRSVP() {
    const name  = document.getElementById('rName').value.trim();
    const city  = document.getElementById('rCity').value.trim();
    const email = document.getElementById('rEmail').value.trim();
    const event = document.getElementById('rEvent').value;
    let valid = true;
    ['rName','rCity','rEmail','rEvent'].forEach(clearFieldError);

    if (!name)  { setFieldError('rName',  'Please enter your name.');           valid = false; }
    if (!city)  { setFieldError('rCity',  'Please enter your city and state.');  valid = false; }
    if (!email) { setFieldError('rEmail', 'Please enter your email.');           valid = false; }
    else if (!isValidEmail(email)) { setFieldError('rEmail', 'Please enter a valid email.'); valid = false; }
    if (!event) { setFieldError('rEvent', 'Please select an event.');            valid = false; }
    if (!valid) return;

    const li = document.createElement('li');
    li.className = 'attendee-item new';
    li.innerHTML = `<span class="attendee-dot" aria-hidden="true"></span>${esc(name)} from ${esc(city)} — ${esc(event)}`;
    document.getElementById('attendeeList').appendChild(li);

    const countEl = document.getElementById('rsvpCount');
    countEl.textContent = parseInt(countEl.textContent) + 1;

    document.getElementById('rsvpForm').reset();
    toast('success', `RSVP confirmed, ${name}! See you at ${event}. Confirmation sent to ${email}.`);
  }

  // ────────────────────────────────────────────
  //  TOAST SYSTEM
  // ────────────────────────────────────────────
  function toast(type, msg) {
    const region = document.getElementById('toastRegion');
    const el = document.createElement('div');
    el.className = `toast toast-${type === 'success' ? 'success' : type === 'info' ? 'success' : 'error'}`;
    el.setAttribute('role', 'status');
    const icon = type === 'success' ? '✅' : type === 'info' ? 'ℹ️' : '⚠️';
    el.innerHTML = `<span class="toast-icon" aria-hidden="true">${icon}</span><span class="toast-msg">${esc(msg)}</span>`;
    region.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'toastOut .25s ease forwards';
      setTimeout(() => el.remove(), 260);
    }, 4500);
  }

  // ────────────────────────────────────────────
  //  ANIMATED COUNTERS
  // ────────────────────────────────────────────
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseFloat(el.dataset.target);
      const sfx = el.dataset.suffix;
      const t0  = performance.now();
      const dur = 1300;
      function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        const v = Math.round((1 - Math.pow(1 - p, 3)) * end);
        el.textContent = v + sfx;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObs.observe(el));

  // ────────────────────────────────────────────
  //  SCROLL REVEAL
  // ────────────────────────────────────────────
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // ────────────────────────────────────────────
  //  FORM HELPERS
  // ────────────────────────────────────────────
  function setFieldError(id, msg) {
    const input = document.getElementById(id);
    const errEl = document.getElementById(id + 'Err');
    if (input) { input.setAttribute('aria-invalid', 'true'); }
    if (errEl) { errEl.textContent = msg; }
  }
  function clearFieldError(id) {
    const input = document.getElementById(id);
    const errEl = document.getElementById(id + 'Err');
    if (input) { input.removeAttribute('aria-invalid'); }
    if (errEl) { errEl.textContent = ''; }
  }
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ────────────────────────────────────────────
  //  INIT
  // ────────────────────────────────────────────
  // Set initial dark mode attribute
  document.documentElement.setAttribute('data-theme', 'dark');
