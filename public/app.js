// =========================
// CONFIG
// =========================

// If you have a backend, put its base URL here, e.g.:
// const API_BASE = 'https://your-backend-url';
const API_BASE = '';
const USE_API = API_BASE.trim() !== '';

const authMessage = document.getElementById('auth-message');
const profilesList = document.getElementById('profiles-list');

// =========================
// DEMO DATA (used when no API)
// =========================

const demoProfiles = [
  {username:'Aino', age:27, bio:'Coffee lover and weekend hiker', interests:['hiking','coffee','photography']},
  {username:'Mikko', age:31, bio:'Tech nerd who cooks', interests:['cooking','tech','gaming']},
  {username:'Sara', age:24, bio:'Yoga instructor and plant parent', interests:['yoga','plants','travel']},
  {username:'Jon', age:29, bio:'Board games and craft beer', interests:['board games','beer','hiking']},
  {username:'Liisa', age:26, bio:'Designer who loves cats', interests:['design','cats','art']},
];

function renderProfiles(items){
  profilesList.innerHTML = '';
  if(!items.length){
    profilesList.innerHTML = '<li style="color:var(--muted);padding:12px">No profiles found</li>';
    return;
  }
  items.forEach(p=>{
    const li = document.createElement('li');
    li.className = 'profile';
    li.innerHTML = `
      <div class="avatar">${p.username.charAt(0).toUpperCase()}</div>
      <div class="meta">
        <h4>${p.username}, <span style="font-weight:600;color:var(--muted)">${p.age ?? ''}</span></h4>
        <p>${p.bio || 'No bio'}</p>
        <div class="tags">${(p.interests || []).map(i=>`<span class="tag">${i}</span>`).join('')}</div>
      </div>
      <div class="profile-actions">
        <button class="btn-ghost" onclick="alert('Sent a like to ${p.username}')">Like</button>
        <button class="btn-ghost" onclick="alert('Open chat with ${p.username}')">Message</button>
      </div>
    `;
    profilesList.appendChild(li);
  });
}

// =========================
// AUTH FORM SUBMISSIONS
// =========================

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const age = document.getElementById('reg-age').value;
  const bio = document.getElementById('reg-bio').value.trim();
  const interestsRaw = document.getElementById('reg-interests').value.trim();

  const interests = interestsRaw
    ? interestsRaw.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  if (!USE_API) {
    // Demo behavior (no backend)
    authMessage.textContent = username ? `Account created for ${username}` : 'Please enter a username';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, age, bio, interests })
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Server did not return valid JSON (got HTML or error page). Check API_BASE or backend.');
    }

    if (!res.ok) throw new Error(data.error || 'Registration failed');
    authMessage.textContent = `Registered as ${data.user.username}`;
  } catch (err) {
    authMessage.textContent = err.message;
  }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  if (!USE_API) {
    // Demo behavior (no backend)
    authMessage.textContent = username ? `Welcome back, ${username}` : 'Login failed';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Server did not return valid JSON (got HTML or error page). Check API_BASE or backend.');
    }

    if (!res.ok) throw new Error(data.error || 'Login failed');
    authMessage.textContent = `Logged in as ${data.user.username}`;
  } catch (err) {
    authMessage.textContent = err.message;
  }
});

// =========================
// PROFILE LOADING + SEARCH
// =========================

document.getElementById('load-profiles').addEventListener('click', async () => {
  if (!USE_API) {
    renderProfiles(demoProfiles);
    return;
  }
  await loadProfiles();
});

document.getElementById('search-button').addEventListener('click', async () => {
  const interest = document.getElementById('search-interest').value.trim();
  if (!interest) {
    if (!USE_API) {
      renderProfiles(demoProfiles);
      return;
    }
    profilesList.innerHTML = '<li>Please enter an interest.</li>';
    return;
  }

  if (!USE_API) {
    const q = interest.toLowerCase();
    const filtered = demoProfiles.filter(p =>
      p.interests.some(i => i.toLowerCase().includes(q))
    );
    renderProfiles(filtered);
    return;
  }

  await loadProfiles(interest);
});

async function loadProfiles(interest) {
  profilesList.innerHTML = '<li>Loading...</li>';
  try {
    const url = interest
      ? `${API_BASE}/api/profiles/search?interest=${encodeURIComponent(interest)}`
      : `${API_BASE}/api/profiles`;

    const res = await fetch(url);
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Server did not return valid JSON (got HTML or error page). Check API_BASE or backend.');
    }

    if (!Array.isArray(data) || data.length === 0) {
      profilesList.innerHTML = '<li>No profiles found.</li>';
      return;
    }

    profilesList.innerHTML = '';
    data.forEach(p => {
      const li = document.createElement('li');
      li.className = 'profile-card';
      li.innerHTML = `
        <strong>${p.username}</strong> ${p.age ? `(${p.age})` : ''}<br/>
        ${p.bio || 'No bio'}<br/>
        <em>Interests:</em> ${(p.interests || []).join(', ') || 'None'}
      `;
      profilesList.appendChild(li);
    });
  } catch (err) {
    profilesList.innerHTML = `<li>Error: ${err.message}</li>`;
  }
}

// =========================
// LOGIN / REGISTER UI LOGIC
// =========================

const authSection = document.getElementById('auth');
const searchSection = document.getElementById('search');

const showLoginBtn = document.getElementById('show-login');
const showRegisterBtn = document.getElementById('show-register');

const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

// Hide auth section and both forms on load
authSection.style.display = "none";
registerForm.style.display = "none";
loginForm.style.display = "none";

// Show ONLY login
showLoginBtn.addEventListener("click", () => {
  authSection.style.display = "block";
  searchSection.style.display = "none";

  loginForm.style.display = "block";
  registerForm.style.display = "none";

  document.getElementById("login-username").focus();
});

// Show ONLY register
showRegisterBtn.addEventListener("click", () => {
  authSection.style.display = "block";
  searchSection.style.display = "none";

  registerForm.style.display = "block";
  loginForm.style.display = "none";

  document.getElementById("reg-username").focus();
});

// Initial demo render if no API
if (!USE_API) {
  renderProfiles(demoProfiles);
}
