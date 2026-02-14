// -----------------------------------------------------------------------------
// CONFIGURATION & STATE
// -----------------------------------------------------------------------------
const API_BASE = window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1")
  ? "/api" // Use relative path when served from the same origin
  : "http://localhost:4000/api"; // Fallback for file:// or other setups

let token = localStorage.getItem("ivo_token");
let currentUser = null;

// -----------------------------------------------------------------------------
// API HELPER
// -----------------------------------------------------------------------------
async function api(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  // If body is NOT FormData, set Content-Type to JSON
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    // Handle 204 No Content
    if (res.status === 204) return null;

    // Check content type to avoid JSON parsing errors on HTML responses (404/500)
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || `API Error: ${res.status}`);
        }
        return data;
    } else {
        if (!res.ok) {
            // If text response (e.g. 404 HTML)
            const text = await res.text();
            console.error("Non-JSON API Error:", text);
            throw new Error(`API Error: ${res.status} (Invalid Response)`);
        }
        return null; // Should not happen for valid API calls
    }
  } catch (error) {
    console.error(`API Call Failed [${endpoint}]:`, error);
    if (error.message.includes("Failed to fetch")) {
        throw new Error("Could not connect to server. Please check your internet connection.");
    }
    throw error;
  }
}

// -----------------------------------------------------------------------------
// UI HELPERS
// -----------------------------------------------------------------------------
function showNotification(msg, type = "info") {
  // Use a simple alert for now, or a custom toast if HTML exists
  // For better UX, let's create a temporary toast element
  const toast = document.createElement('div');
  toast.innerText = msg;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = type === 'error' ? '#d32f2f' : '#333';
  toast.style.color = '#fff';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '8px';
  toast.style.zIndex = '10000';
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  toast.style.transition = 'opacity 0.5s';
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'flex';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
}

function smoothScroll(target) {
  document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
}

// -----------------------------------------------------------------------------
// AUTHENTICATION
// -----------------------------------------------------------------------------
async function handleLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  if (!email || !password) {
    showNotification("Please enter email and password.", "error");
    return;
  }
  await login(email, password);
}

async function login(email, password) {
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    token = data.token;
    localStorage.setItem("ivo_token", token);
    localStorage.setItem("ivo_userId", data.userId);
    closeModal('login-modal');
    checkAuth();
    showNotification("Logged in successfully!");
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

async function signup() {
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const phone = document.getElementById('signup-number').value;
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm-password').value;

  if (password !== confirm) {
    showNotification("Passwords do not match.", "error");
    return;
  }

  try {
    const data = await api('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password })
    });
    token = data.token;
    localStorage.setItem("ivo_token", token);
    localStorage.setItem("ivo_userId", data.userId);
    closeModal('signup-modal');
    checkAuth();
    showNotification("Account created successfully!");
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

function switchModal(oldId, newId) {
  closeModal(oldId);
  openModal(newId);
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem("ivo_token");
  localStorage.removeItem("ivo_userId");
  checkAuth();
  showNotification("Logged out.");
}

function checkAuth() {
  const authControls = document.getElementById('auth-controls');
  const profileControls = document.getElementById('profile-controls');
  
  if (token) {
    if (authControls) authControls.style.display = 'none';
    if (profileControls) profileControls.style.display = 'block';
  } else {
    if (authControls) authControls.style.display = 'block';
    if (profileControls) profileControls.style.display = 'none';
  }
}

// -----------------------------------------------------------------------------
// WORKERS / PROFESSIONALS
// -----------------------------------------------------------------------------
async function searchWorkers() {
  const input = document.getElementById('search-input');
  const query = input ? input.value : '';
  
  try {
    const workers = await api(`/profile/professionals?search=${encodeURIComponent(query)}`);
    renderWorkers(workers);
  } catch (err) {
    console.error(err);
    showNotification("Failed to load professionals.", 'error');
  }
}

async function viewProfile(userId) {
  try {
    const user = await api(`/profile/${userId}`);
    document.getElementById('profile-name').innerText = user.name;
    document.getElementById('profile-title').innerText = user.headline || 'Professional';
    document.getElementById('profile-company').innerText = user.company || 'Freelance';
    document.getElementById('profile-skills').innerText = `Skills: ${user.skills ? user.skills.join(', ') : 'N/A'}`;
    openModal('profile-modal');
  } catch (err) {
    showNotification("Failed to load profile.", "error");
  }
}

async function showProfileDashboard() {
  if (!token) return;
  try {
    const user = await api('/profile/me');
    document.getElementById('my-profile-name').innerText = user.name;
    document.getElementById('my-profile-headline').innerText = user.headline || 'Add a headline';
    document.getElementById('my-profile-location').innerText = user.location || 'Location not set';
    document.getElementById('my-profile-contact').innerText = user.email;
    document.getElementById('my-profile-avatar').src = user.avatar || 'https://placehold.co/120x120/0d47a1/ffffff?text=ME';
    document.getElementById('my-profile-about').innerText = user.about || 'Tell us about yourself...';
    
    // Pre-fill edit modal
    document.getElementById('edit-name').value = user.name;
    document.getElementById('edit-headline').value = user.headline || '';
    document.getElementById('edit-location').value = user.location || '';
    document.getElementById('edit-contact').value = user.email || '';
    document.getElementById('edit-about').value = user.about || '';
    
    // Skills
    const skillsContainer = document.getElementById('my-profile-skills');
    skillsContainer.innerHTML = (user.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('');
    
    openModal('my-profile-modal');
  } catch (err) {
    showNotification("Failed to load dashboard.", "error");
  }
}

function openEditModal() {
  closeModal('my-profile-modal');
  openModal('edit-profile-modal');
}

async function saveProfileChanges() {
  const name = document.getElementById('edit-name').value;
  const headline = document.getElementById('edit-headline').value;
  const location = document.getElementById('edit-location').value;
  const contact = document.getElementById('edit-contact').value;
  const about = document.getElementById('edit-about').value;
  const avatarFile = document.getElementById('edit-avatar').files[0];

  const formData = new FormData();
  formData.append('name', name);
  formData.append('headline', headline);
  formData.append('location', location);
  formData.append('contact', contact);
  formData.append('about', about);
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }

  try {
    await api('/profile', {
      method: 'PATCH',
      body: formData
    });
    showNotification("Profile updated successfully!");
    closeModal('edit-profile-modal');
    showProfileDashboard(); // Re-open dashboard to see changes
    searchWorkers(); // Refresh grid
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

function renderWorkers(workers) {
  const grid = document.getElementById('user-grid');
  if (!grid) return;
  
  grid.innerHTML = workers.map(user => `
    <div class="card" onclick="viewProfile('${user._id}')">
      <div class="card-img" style="background-image: url('${user.avatar || 'https://placehold.co/600x400/png'}');"></div>
      <div class="card-content">
        <h3>${user.name}</h3>
        <p><strong>${user.headline || 'Professional'}</strong></p>
        <p>${user.company || 'Freelance'}</p>
        <p class="skills">${user.skills ? user.skills.join(', ') : ''}</p>
      </div>
    </div>
  `).join('');
}

// -----------------------------------------------------------------------------
// JOBS
// -----------------------------------------------------------------------------
async function loadJobs() {
  try {
    const jobs = await api('/jobs');
    renderJobs(jobs);
  } catch (err) {
    console.error(err);
  }
}

async function postJob() {
  if (!token) {
    showNotification("Please login to post a job.", 'error');
    return;
  }

  const title = document.getElementById('job-title').value;
  const company = document.getElementById('company').value;
  const description = document.getElementById('job-desc').value;

  try {
    await api('/jobs', {
      method: 'POST',
      body: JSON.stringify({ title, company, description })
    });
    showNotification("Job posted successfully!");
    document.getElementById('job-form').reset();
    loadJobs(); // Refresh list
  } catch (err) {
    showNotification(err.message, 'error');
  }
}

function renderJobs(jobs) {
  const grid = document.getElementById('job-grid');
  if (!grid) return;

  grid.innerHTML = jobs.map(job => `
    <div class="card">
      <div class="card-content">
        <h3>${job.title}</h3>
        <p><strong>${job.company}</strong></p>
        <p>${job.description.substring(0, 100)}...</p>
        <p>Posted: ${new Date(job.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  `).join('');
}

// -----------------------------------------------------------------------------
// AI AGENT
// -----------------------------------------------------------------------------
function toggleAIChat() {
  const win = document.getElementById('ai-chat-window');
  if (win.style.display === 'flex') {
    win.style.display = 'none';
  } else {
    win.style.display = 'flex';
    document.getElementById('ai-chat-input').focus();
  }
}

async function sendAIMessage() {
  const input = document.getElementById('ai-chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  // Add user message
  addChatMessage(msg, 'user');
  input.value = '';

  try {
    const data = await api('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message: msg })
    });
    addChatMessage(data.response, 'bot');
  } catch (err) {
    addChatMessage("Sorry, I'm having trouble connecting right now.", 'bot');
  }
}

function addChatMessage(text, sender) {
  const container = document.getElementById('ai-chat-messages');
  const div = document.createElement('div');
  div.className = `ai-message ${sender}`;
  div.innerText = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// -----------------------------------------------------------------------------
// INITIALIZATION
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  searchWorkers(); // Load initial workers
  loadJobs();      // Load initial jobs
  
  // Theme Toggle Logic
  const themeToggle = document.getElementById('theme-toggle');
  if(themeToggle) {
    themeToggle.addEventListener('click', () => {
      const body = document.body;
      const current = body.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      body.setAttribute('data-theme', next);
      themeToggle.innerHTML = next === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    });
  }

  // AI Toggle Logic
  const aiToggle = document.getElementById('ai-toggle');
  if(aiToggle) {
    aiToggle.addEventListener('click', toggleAIChat);
  }

  // Close modals on outside click
  window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
      event.target.style.display = "none";
    }
  };
});
