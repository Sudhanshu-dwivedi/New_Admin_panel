(function attachErrorOverlay(){
  const overlay = document.createElement('div');
  overlay.id = 'debug-overlay';
  overlay.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:99999;background:#2b1010;color:#ffdede;padding:10px;border-radius:8px;max-width:420px;box-shadow:0 6px 18px rgba(0,0,0,0.6);font-family:monospace;font-size:13px;display:none;white-space:pre-wrap';
  document.body.appendChild(overlay);

  function show(msg){
    overlay.style.display = 'block';
    overlay.textContent = msg;
    console.error('DEBUG OVERLAY:', msg);
  }

  window.showDebugOverlay = show;

  window.addEventListener('error', function(ev){
    try {
      show('Error: ' + (ev.message || 'unknown') + '\nAt: ' + (ev.filename || '') + ':' + (ev.lineno || '') + ':' + (ev.colno || ''));
    } catch(e) { console.error('overlay error', e); }
  });

  window.addEventListener('unhandledrejection', function(ev){
    try {
      const text = (ev.reason && ev.reason.stack) ? ev.reason.stack : String(ev.reason);
      show('Unhandled Promise rejection:\n' + text);
    } catch(e) { console.error('overlay error', e); }
  });

  overlay.addEventListener('click', ()=> overlay.style.display = 'none');
})();


const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const showElement = (el) => { if (!el) return; el.style.display = ''; };
const hideElement = (el) => { if (!el) return; el.style.display = 'none'; };

const setText = (el, text) => { if (!el) return; el.textContent = text; };

const loginBtn = $('#loginBtn');
const noticeEl = $('#notice');
const loginView = $('#loginView');
const adminApp = $('#adminApp');
const signedInUserEl = $('#signedInUser');

const navLinks = $$('.nav a');
const headerName = $('#header-page-name');

const statUsers = $('#stat-total-users');
const statVehicles = $('#stat-total-vehicles');
const statAlerts = $('#stat-active-alerts');

const dashboardAlertsTable = $('#dashboard-alerts-table');
const usersBlock = $('#page-users-block');
const reportsBlock = $('#page-reports-block');
const dashboardGrid = $('#dashboard-grid');

const usersTableBody = $('#users-table-body');
const accidentReportsTable = $('#accident-reports-table');
const theftReportsTable = $('#theft-reports-table');

const userModal = $('#user-modal');
const modalCloseBtn = $('#modal-close-btn');

const mockUsers = [
  {
    id: 1, name: "Shubham Sharma", email: "shubham@example.com", phone: "+91-9876543210",
    vehicle: { model: "Maruti Swift", plate: "UP70 AB 1234" },
    emergencyContacts: [{ name: "Father", phone: "+91-9876543211" }, { name: "Hospital", phone: "102" }]
  },
  {
    id: 2, name: "Utkarsh Malviya", email: "utkarsh@example.com", phone: "+91-9876543212",
    vehicle: { model: "Hyundai i20", plate: "UP70 CD 5678" },
    emergencyContacts: [{ name: "Mother", phone: "+91-9876543213" }]
  },
  {
    id: 3, name: "Sudhanshu Shekhar", email: "sudhanshu@example.com", phone: "+91-9876543214",
    vehicle: { model: "Tata Nexon", plate: "UP70 EF 9012" },
    emergencyContacts: [{ name: "Brother", phone: "+91-9876543215" }, { name: "Police", phone: "100" }]
  },
  {
    id: 4, name: "Aadarsh Srivastava", email: "aadarsh@example.com", phone: "+91-9876543216",
    vehicle: { model: "Kia Seltos", plate: "UP70 GH 3456" },
    emergencyContacts: [{ name: "Friend", phone: "+91-9876543217" }]
  }
];

const mockAlerts = [
  { id: 101, userId: 2, type: "accident", location: { lat: 25.3176, lng: 82.9739, address: "Civil Lines, Prayagraj" }, time: new Date(Date.now() - 1000 * 60 * 5), status: "active" },
  { id: 102, userId: 4, type: "theft", location: { lat: 25.4358, lng: 81.8463, address: "Naini, Prayagraj" }, time: new Date(Date.now() - 1000 * 60 * 30), status: "active" },
  { id: 103, userId: 1, type: "accident", location: { lat: 25.4748, lng: 81.8433, address: "Jhalwa, Prayagraj" }, time: new Date(Date.now() - 1000 * 60 * 120), status: "resolved" }
];

const validUsers = [
  { username: 'admin@collisioncatcher.local', password: 'Admin@1234' },
  { username: 'admin', password: 'Admin@1234' }
];

function showNotice(message, color = '#ffb4b4') {
  noticeEl.style.display = 'block';
  noticeEl.style.color = color;
  noticeEl.textContent = message;
}

function hideNotice() {
  noticeEl.style.display = 'none';
  noticeEl.textContent = '';
}

function findUserById(id) {
  return mockUsers.find(u => u.id === id);
}

function formatSimpleTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function switchToAdminView(username) {
  try {
    loginView.style.display = 'none';
    adminApp.classList.add('visible');
    adminApp.setAttribute('aria-hidden', 'false');
    setText(signedInUserEl, username);

    adminApp.scrollTop = 0;
    window.scrollTo(0, 0);

    initializeAdminPanel();
  } catch (err) {
    if (window.showDebugOverlay) {
      window.showDebugOverlay('switchToAdminView failed:\n' + (err.stack || String(err)));
    } else {
      console.error('switchToAdminView failed:', err);
      alert('Failed to open admin panel: ' + (err.message || err));
    }
  }
}

loginBtn.addEventListener('click', () => {
  hideNotice();
  const username = $('#username').value.trim();
  const password = $('#password').value;

  if (!username || !password) {
    showNotice('Please enter credentials.');
    return;
  }

  const matched = validUsers.some(u => (u.username === username || u.username === username.toLowerCase()) && u.password === password);
  if (matched) {
    hideNotice();
    switchToAdminView(username);
  } else {
    showNotice('Invalid username or password.');
  }
});

$('#forgotLink').addEventListener('click', (ev) => {
  ev.preventDefault();
  alert('Contact the owner to reset your password.');
});

$('#logoutBtn').addEventListener('click', () => {
  hideElement(adminApp);
  adminApp.classList.remove('visible');
  adminApp.setAttribute('aria-hidden', 'true');
  showElement(loginView);

  $('#username').value = '';
  $('#password').value = '';
  hideNotice();

  navLinks.forEach(n => n.classList.remove('active'));
  navLinks.forEach(n => n.classList.add('inactive'));
  $('#nav-dashboard').classList.remove('inactive');
  $('#nav-dashboard').classList.add('active');

  headerName.textContent = 'Dashboard';
  window.scrollTo(0, 0);
});

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.dataset.target || 'dashboard';

    navLinks.forEach(n => n.classList.remove('active'));
    navLinks.forEach(n => n.classList.add('inactive'));
    link.classList.remove('inactive');
    link.classList.add('active');

    headerName.textContent = link.textContent.trim();

    if (target === 'dashboard') {
      hideElement(usersBlock);
      hideElement(reportsBlock);
      showElement(dashboardGrid);
      renderDashboard();
    } else if (target === 'users') {
      hideElement(dashboardGrid);
      hideElement(reportsBlock);
      showElement(usersBlock);
      renderUsersPage();
    } else if (target === 'reports') {
      hideElement(dashboardGrid);
      hideElement(usersBlock);
      showElement(reportsBlock);
      renderReportsPage();
    }
  });
});

function renderDashboard() {
  const activeAlerts = mockAlerts.filter(a => a.status === 'active');

  setText(statUsers, String(mockUsers.length));
  setText(statVehicles, String(mockUsers.length));
  setText(statAlerts, String(activeAlerts.length));

  dashboardAlertsTable.innerHTML = '';
  if (activeAlerts.length === 0) {
    dashboardAlertsTable.innerHTML = '<tr><td colspan="4" class="muted" style="padding:14px;text-align:center">No active alerts.</td></tr>';
    return;
  }

  activeAlerts.forEach(alert => {
    const user = findUserById(alert.userId) || { name: 'Unknown' };
    const tr = document.createElement('tr');
    tr.className = 'row-hover';
    const typeLabel = alert.type === 'accident'
      ? `<span style="padding:6px 10px;border-radius:999px;font-weight:700;font-size:12px;background:#2b0610;color:#ffb4b4">Accident</span>`
      : `<span style="padding:6px 10px;border-radius:999px;font-weight:700;font-size:12px;background:#2b2a06;color:#fff0b4">Theft</span>`;

    tr.innerHTML = `
      <td class="p-3" style="font-weight:700">${user.name}</td>
      <td class="p-3">${typeLabel}</td>
      <td class="p-3">${alert.location.address}</td>
      <td class="p-3">${formatSimpleTime(alert.time)}</td>
    `;
    dashboardAlertsTable.appendChild(tr);
  });
}

function renderUsersPage() {
  usersTableBody.innerHTML = '';
  if (mockUsers.length === 0) {
    usersTableBody.innerHTML = '<tr><td colspan="5" class="muted" style="padding:12px;text-align:center">No users registered.</td></tr>';
    return;
  }

  mockUsers.forEach(user => {
    const tr = document.createElement('tr');
    tr.className = 'row-hover';
    tr.innerHTML = `
      <td class="p-3" style="font-weight:700">${user.name}</td>
      <td class="p-3">${user.email}</td>
      <td class="p-3">${user.phone}</td>
      <td class="p-3">${user.vehicle.plate} (${user.vehicle.model})</td>
      <td class="p-3"><button class="ghost view-user-btn" data-user-id="${user.id}" type="button">View Details</button></td>
    `;
    usersTableBody.appendChild(tr);
  });

  $$('.view-user-btn').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const id = parseInt(ev.currentTarget.dataset.userId, 10);
      openUserModal(id);
    });
  });
}

function renderReportsPage() {
  accidentReportsTable.innerHTML = '';
  theftReportsTable.innerHTML = '';

  const activeAlerts = mockAlerts.filter(a => a.status === 'active');
  const accidents = activeAlerts.filter(a => a.type === 'accident');
  const thefts = activeAlerts.filter(a => a.type === 'theft');

  if (accidents.length === 0) {
    accidentReportsTable.innerHTML = '<tr><td colspan="5" class="muted" style="padding:12px;text-align:center">No active accident reports.</td></tr>';
  } else {
    accidents.forEach(alert => {
      const user = findUserById(alert.userId) || {};
      const row = document.createElement('tr');
      row.className = 'row-hover';
      row.innerHTML = `
        <td class="p-3" style="font-weight:700">${user.name || 'Unknown'}</td>
        <td class="p-3">${user.vehicle ? user.vehicle.plate : 'N/A'}</td>
        <td class="p-3">${alert.location.address}</td>
        <td class="p-3">${formatSimpleTime(alert.time)}</td>
        <td class="p-3"><button class="btn resolve-btn" data-alert-id="${alert.id}" type="button">Resolve</button></td>
      `;
      accidentReportsTable.appendChild(row);
    });
  }

  if (thefts.length === 0) {
    theftReportsTable.innerHTML = '<tr><td colspan="5" class="muted" style="padding:12px;text-align:center">No active theft reports.</td></tr>';
  } else {
    thefts.forEach(alert => {
      const user = findUserById(alert.userId) || {};
      const row = document.createElement('tr');
      row.className = 'row-hover';
      row.innerHTML = `
        <td class="p-3" style="font-weight:700">${user.name || 'Unknown'}</td>
        <td class="p-3">${user.vehicle ? user.vehicle.plate : 'N/A'}</td>
        <td class="p-3">${alert.location.address}</td>
        <td class="p-3">${formatSimpleTime(alert.time)}</td>
        <td class="p-3"><button class="btn resolve-btn" data-alert-id="${alert.id}" type="button">Resolve</button></td>
      `;
      theftReportsTable.appendChild(row);
    });
  }

  $$('.resolve-btn').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const id = parseInt(ev.currentTarget.dataset.alertId, 10);
      resolveAlert(id);
    });
  });
}

function openUserModal(userId) {
  const user = findUserById(userId);
  if (!user) return;

  setText($('#modal-user-name'), user.name);
  setText($('#modal-user-email'), user.email);
  setText($('#modal-user-phone'), user.phone);
  setText($('#modal-user-vehicle-model'), user.vehicle.model);
  setText($('#modal-user-vehicle-plate'), user.vehicle.plate);

  const contactsList = $('#modal-user-contacts');
  contactsList.innerHTML = '';
  if (!user.emergencyContacts || user.emergencyContacts.length === 0) {
    contactsList.innerHTML = '<li class="muted">No emergency contacts added.</li>';
  } else {
    user.emergencyContacts.forEach(c => {
      const li = document.createElement('li');
      li.style.padding = '8px';
      li.style.marginBottom = '6px';
      li.style.borderRadius = '8px';
      li.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.01), transparent)';
      li.innerHTML = `<strong style="font-weight:700">${c.name}</strong> <span style="float:right">${c.phone}</span>`;
      contactsList.appendChild(li);
    });
  }

  userModal.style.display = 'flex';

  function onBackdropClick(e) {
    if (e.target === userModal) {
      closeModal();
      userModal.removeEventListener('click', onBackdropClick);
    }
  }
  userModal.addEventListener('click', onBackdropClick);
}

function closeModal() {
  userModal.style.display = 'none';
}

modalCloseBtn.addEventListener('click', closeModal);

function resolveAlert(alertId) {
  const alertObj = mockAlerts.find(a => a.id === alertId);
  if (!alertObj) return;
  alertObj.status = 'resolved';

  renderDashboard();
  renderReportsPage();
}

function initializeAdminPanel() {
  renderDashboard();
  renderUsersPage();
  renderReportsPage();

  $('#globalSearch').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      renderDashboard();
      return;
    }

    const results = mockUsers.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.vehicle.model.toLowerCase().includes(q)
    );

    if (results.length) {
      $('#nav-users').click();
      usersTableBody.innerHTML = '';
      results.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = 'row-hover';
        tr.innerHTML = `
          <td class="p-3" style="font-weight:700">${user.name}</td>
          <td class="p-3">${user.email}</td>
          <td class="p-3">${user.phone}</td>
          <td class="p-3">${user.vehicle.plate} (${user.vehicle.model})</td>
          <td class="p-3"><button class="ghost view-user-btn" data-user-id="${user.id}" type="button">View Details</button></td>
        `;
        usersTableBody.appendChild(tr);
      });

      $$('.view-user-btn').forEach(btn => {
        btn.addEventListener('click', (ev) => openUserModal(parseInt(ev.currentTarget.dataset.userId, 10)));
      });
    } else {
      alert('No results found.');
    }
  });

  $('#userSearch').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    usersTableBody.innerHTML = '';

    const filtered = mockUsers.filter(u => {
      if (!q) return true;
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.vehicle.model.toLowerCase().includes(q);
    });

    filtered.forEach(user => {
      const tr = document.createElement('tr');
      tr.className = 'row-hover';
      tr.innerHTML = `
        <td class="p-3" style="font-weight:700">${user.name}</td>
        <td class="p-3">${user.email}</td>
        <td class="p-3">${user.phone}</td>
        <td class="p-3">${user.vehicle.plate} (${user.vehicle.model})</td>
        <td class="p-3"><button class="ghost view-user-btn" data-user-id="${user.id}" type="button">View Details</button></td>
      `;
      usersTableBody.appendChild(tr);
    });

    $$('.view-user-btn').forEach(btn => {
      btn.addEventListener('click', (ev) => openUserModal(parseInt(ev.currentTarget.dataset.userId, 10)));
    });
  });

  $('#addUser').addEventListener('click', () => alert('Add user modal (demo). Implement form as needed.'));
  $('#notifBtn').addEventListener('click', () => alert('Notifications (demo)'));
}

$('#password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});