// =========================
// CONFIG
// =========================

// IMPORTANT: Replace with YOUR Render backend URL
const API_BASE = "https://website-testing-teqc.onrender.com";

const authMessage = document.getElementById('auth-message');
const profilesList = document.getElementById('profiles-list');

// =========================
// DEMO PROFILES (fallback)
// =========================

const demoProfiles = [
  {username:'Aino', age:27, bio:'Coffee lover and weekend hiker', interests:['hiking','coffee','photography']},
  {username:'Mikko', age:31, bio:'Tech nerd who cooks', interests:['cooking','tech','gaming']},
  {username:'Sara', age:24, bio:'Yoga instructor and plant parent', interests:['yoga','plants','travel']},
  {username:'Jon', age:29, bio:'Board games and craft beer', interests:['board games','beer','hiking']},
  {username:'Liisa', age:26, bio:'Designer who loves cats', interests:['design','cats','art']},
];

// =========================
// RENDER PROFILES
// =========================

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
        <h4>${p.username}, <span style="font-weight:600;color:var(--muted)">${p.age}</span></h4>
        <p>${p.bio}</p>
        <div class="tags">${p.interests.map(i=>`<span class="tag">${i}</span>`).join('')}</div>
      </div>
      <div class="profile-actions">
        <button class="btn-ghost">Like</button>
        <button class="btn-ghost">Message</button>
      </div>
    `;
    profilesList.appendChild(li);
  });
}

// =========================
// LOAD PROFILES (backend + fallback)
// =========================

async function loadProfiles(interest) {
  profilesList.innerHTML = "<li>Loading...</li>";

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
      // Backend unreachable → fallback demo
      renderProfiles(demoProfiles);
      return;
    }

    // If backend has no users → fallback demo
    if (!Array.isArray(data) || data.length === 0) {
      renderProfiles(demoProfiles);
      return;
    }

    // Backend has users → show them
    renderProfiles(data);

  } catch (err) {
    // On any error → fallback demo
    renderProfiles(demoProfiles);
  }
}

document.getElementById('load-profiles').addEventListener('click', () => {
  loadProfiles();
});

// =========================
// SEARCH (backend + fallback)
// =========================

document.getElementById('search-button').addEventListener('click', () => {
  const interest = document.getElementById('search-interest').value.trim().toLowerCase();

  if (!interest) {
    loadProfiles();
    return;
  }

  // Try backend search first
  loadProfiles(interest);
});

// =========================
// REGISTER (real backend)
// =========================

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const age = document.getElementById('reg-age').value;
  const bio = document.getElementById('reg-bio').value.trim();
  const interestsRaw = document.getElementById('reg-interests').value.trim();

  const interests = interestsRaw
    ? interestsRaw.split(',').map(i => i.trim()).filter(Boolean)
    : [];

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
      throw new Error("Server returned invalid JSON (HTML instead). Check API_BASE.");
    }

    if (!res.ok) throw new Error(data.error || "Registration failed");

    authMessage.textContent = `Registered as ${data.user.username}`;
    authMessage.style.color = "var(--accent-2)";
  } catch (err) {
    authMessage.textContent = err.message;
    authMessage.style.color = "var(--accent)";
  }
});

// =========================
// LOGIN (real backend)
// =========================

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

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
      throw new Error("Server returned invalid JSON (HTML instead). Check API_BASE.");
    }

    if (!res.ok) throw new Error(data.error || "Login failed");

    authMessage.textContent = `Welcome back, ${data.user.username}`;
    authMessage.style.color = "var(--accent-2)";
  } catch (err) {
    authMessage.textContent = err.message;
    authMessage.style.color = "var(--accent)";
  }
});

// =========================
// LOGIN / REGISTER UI LOGIC
// =========================

const authSection = document.getElementById('auth');
const searchSection = document.getElementById('search');

const showLoginBtn = document.getElementById('show-login');
const showRegisterBtn = document.getElementById('show-register');

const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

// Hide everything at start
authSection.style.display = "none";
registerForm.style.display = "none";
loginForm.style.display = "none";

// Show login
showLoginBtn.addEventListener("click", () => {
  authSection.style.display = "block";
  searchSection.style.display = "none";

  loginForm.style.display = "block";
  registerForm.style.display = "none";

  document.getElementById("login-username").focus();
});

// Show register
showRegisterBtn.addEventListener("click", () => {
  authSection.style.display = "block";
  searchSection.style.display = "none";

  registerForm.style.display = "block";
  loginForm.style.display = "none";

  document.getElementById("reg-username").focus();
});

// =========================
// INITIAL DEMO RENDER
// =========================

renderProfiles(demoProfiles);
