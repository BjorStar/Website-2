// =========================
// CONFIG
// =========================

const API_BASE = "https://website-testing-teqc.onrender.com";

const authMessage = document.getElementById("auth-message");
const profilesList = document.getElementById("profiles-list");
const authSection = document.getElementById("auth");
const searchSection = document.getElementById("search");
const accountSection = document.getElementById("my-account");

// =========================
// DEMO PROFILES (always shown)
// =========================

const demoProfiles = [
  {username:'Aino (DEMO)', age:27, bio:'Coffee lover and weekend hiker', interests:['hiking','coffee','photography']},
  {username:'Mikko (DEMO)', age:31, bio:'Tech nerd who cooks', interests:['cooking','tech','gaming']},
  {username:'Sara (DEMO)', age:24, bio:'Yoga instructor and plant parent', interests:['yoga','plants','travel']},
  {username:'Jon (DEMO)', age:29, bio:'Board games and craft beer', interests:['board games','beer','hiking']},
  {username:'Liisa (DEMO)', age:26, bio:'Designer who loves cats', interests:['design','cats','art']},
];

// =========================
// RENDER PROFILES
// =========================

function renderProfiles(items) {
  profilesList.innerHTML = "";

  items.forEach(p => {
    const li = document.createElement("li");
    li.className = "profile";
    li.innerHTML = `
      <div class="avatar">${p.username.charAt(0).toUpperCase()}</div>
      <div class="meta">
        <h4>${p.username}, <span style="color:var(--muted);">${p.age}</span></h4>
        <p>${p.bio}</p>
        <div class="tags">${p.interests.map(i => `<span class="tag">${i}</span>`).join("")}</div>
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
// ALWAYS SHOW DEMO + REAL
// =========================

async function loadProfiles(interest) {
  profilesList.innerHTML = "<li>Loading...</li>";

  let realProfiles = [];

  try {
    const url = interest
      ? `${API_BASE}/api/profiles/search?interest=${encodeURIComponent(interest)}`
      : `${API_BASE}/api/profiles`;

    const res = await fetch(url);
    const text = await res.text();

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) realProfiles = parsed;
    } catch {
      // ignore, fallback to demo only
    }
  } catch {
    // ignore, fallback to demo only
  }

  // ALWAYS show demo + real
  const combined = [...demoProfiles, ...realProfiles];
  renderProfiles(combined);
}

document.getElementById("load-profiles").addEventListener("click", () => loadProfiles());

// =========================
// SEARCH (demo + real)
// =========================

document.getElementById("search-button").addEventListener("click", () => {
  const interest = document.getElementById("search-interest").value.trim().toLowerCase();
  loadProfiles(interest || null);
});

// =========================
// LOGIN STATE HELPERS
// =========================

function applyLoggedInUI(username) {
  document.getElementById("user-display").textContent = username;
  document.getElementById("welcome-box").style.display = "block";
  document.getElementById("logout-btn").style.display = "inline-block";
  document.getElementById("my-account-btn").style.display = "inline-block";

  document.getElementById("show-login").style.display = "none";
  document.getElementById("show-register").style.display = "none";
}

function applyLoggedOutUI() {
  document.getElementById("welcome-box").style.display = "none";
  document.getElementById("user-display").textContent = "";
  document.getElementById("logout-btn").style.display = "none";
  document.getElementById("my-account-btn").style.display = "none";

  document.getElementById("show-login").style.display = "inline-block";
  document.getElementById("show-register").style.display = "inline-block";
}

// =========================
// RESTORE LOGIN
// =========================

const savedUser = localStorage.getItem("loggedInUser");
if (savedUser) applyLoggedInUI(savedUser);

// =========================
// REGISTER
// =========================

document.getElementById("register-form").addEventListener("submit", async e => {
  e.preventDefault();

  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value;
  const age = document.getElementById("reg-age").value;
  const bio = document.getElementById("reg-bio").value.trim();
  const interestsRaw = document.getElementById("reg-interests").value.trim();

  const interests = interestsRaw ? interestsRaw.split(",").map(i => i.trim()).filter(Boolean) : [];

  try {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, age, bio, interests })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    authMessage.textContent = `Registered as ${data.user.username}`;
    authMessage.style.color = "var(--accent-2)";

    localStorage.setItem("loggedInUser", data.user.username);
    applyLoggedInUI(data.user.username);

  } catch (err) {
    authMessage.textContent = err.message;
    authMessage.style.color = "var(--accent)";
  }
});

// =========================
// LOGIN
// =========================

document.getElementById("login-form").addEventListener("submit", async e => {
  e.preventDefault();

  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    authMessage.textContent = `Welcome back, ${data.user.username}`;
    authMessage.style.color = "var(--accent-2)";

    localStorage.setItem("loggedInUser", data.user.username);
    applyLoggedInUI(data.user.username);

  } catch (err) {
    authMessage.textContent = err.message;
    authMessage.style.color = "var(--accent)";
  }
});

// =========================
// UI SWITCHING
// =========================

document.getElementById("show-login").addEventListener("click", () => {
  authSection.style.display = "block";
  searchSection.style.display = "none";
  accountSection.style.display = "none";

  document.getElementById("login-form").style.display = "block";
  document.getElementById("register-form").style.display = "none";
});

document.getElementById("show-register").addEventListener("click", () => {
  authSection.style.display = "block";
  searchSection.style.display = "none";
  accountSection.style.display = "none";

  document.getElementById("register-form").style.display = "block";
  document.getElementById("login-form").style.display = "none";
});

// =========================
// LOGOUT
// =========================

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  applyLoggedOutUI();

  authMessage.textContent = "";

  authSection.style.display = "none";
  accountSection.style.display = "none";
  searchSection.style.display = "block";
});

// =========================
// MY ACCOUNT
// =========================

document.getElementById("my-account-btn").addEventListener("click", async () => {
  const username = localStorage.getItem("loggedInUser");
  if (!username) return;

  try {
    const res = await fetch(`${API_BASE}/api/profiles/${username}`);
    const data = await res.json();

    document.getElementById("acc-username").textContent = data.username;
    document.getElementById("acc-age").textContent = data.age;
    document.getElementById("acc-bio").textContent = data.bio;

    const list = document.getElementById("acc-interests");
    list.innerHTML = "";
    data.interests.forEach(i => {
      const li = document.createElement("li");
      li.textContent = i;
      list.appendChild(li);
    });

    authSection.style.display = "none";
    searchSection.style.display = "none";
    accountSection.style.display = "block";

  } catch {
    alert("Could not load your account.");
  }
});

// =========================
// MD LOGO → FULL REFRESH
// =========================

document.getElementById("home-button").addEventListener("click", () => {
  window.location.reload();
});

// =========================
// INITIAL RENDER
// =========================

renderProfiles([...demoProfiles]);
