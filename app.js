const USERS_KEY = "classified_users";
const ADS_KEY = "classified_ads";
const CURRENT_USER_KEY = "classified_current_user";
const PROFILE_ACTIVE_KEY = "classified_profile_active";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const adForm = document.getElementById("adForm");
const postAdSection = document.getElementById("postAdSection");
const enterProfileBtn = document.getElementById("enterProfileBtn");
const logoutBtn = document.getElementById("logoutBtn");
const adsList = document.getElementById("adsList");
const adsScopeHint = document.getElementById("adsScopeHint");
const authStatus = document.getElementById("authStatus");
const profileHint = document.getElementById("profileHint");
const toast = document.getElementById("toast");

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  return readJSON(USERS_KEY, []);
}

function getAds() {
  return readJSON(ADS_KEY, []);
}

function getCurrentUser() {
  return localStorage.getItem(CURRENT_USER_KEY);
}

function setCurrentUser(username) {
  if (username) {
    localStorage.setItem(CURRENT_USER_KEY, username);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

function normalizeState(value) {
  return value.trim().toLowerCase();
}

function isProfileActive() {
  return localStorage.getItem(PROFILE_ACTIVE_KEY) === "true";
}

function setProfileActive(active) {
  localStorage.setItem(PROFILE_ACTIVE_KEY, active ? "true" : "false");
}

function hashPassword(password) {
  // Demo-only obfuscation; use proper server-side hashing in production.
  return btoa(password);
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => {
    toast.hidden = true;
  }, 2200);
}

function updateAuthUI() {
  const currentUser = getCurrentUser();
  const userRecord = currentUser ? getUsers().find((user) => user.username === currentUser) : null;

  if (userRecord) {
    authStatus.textContent = `Logged in as ${currentUser} (${userRecord.state})`;
  } else {
    authStatus.textContent = "Not logged in";
  }

  const profileActive = Boolean(userRecord) && isProfileActive();
  postAdSection.hidden = !profileActive;
  adForm.querySelector("button").disabled = !profileActive;
  enterProfileBtn.hidden = !userRecord || profileActive;
  logoutBtn.hidden = !userRecord;

  if (!userRecord) {
    profileHint.textContent = "Log in, then select into your profile to post ads.";
  } else if (!profileActive) {
    profileHint.textContent = "Select Enter Profile to unlock posting.";
  } else {
    profileHint.textContent = "Profile active. You can now post ads.";
  }
}

function renderAds() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    adsScopeHint.textContent = "Log in to see ads from your state.";
    adsList.innerHTML = "<p>Please log in to view local ads.</p>";
    return;
  }

  const userRecord = getUsers().find((user) => user.username === currentUser);
  if (!userRecord) {
    adsScopeHint.textContent = "Log in to see ads from your state.";
    adsList.innerHTML = "<p>Please log in to view local ads.</p>";
    return;
  }

  const ads = getAds()
    .filter((ad) => normalizeState(ad.state || "") === normalizeState(userRecord.state))
    .sort((a, b) => b.createdAt - a.createdAt);

  adsScopeHint.textContent = `Showing newest ads for ${userRecord.state}.`;
  if (!ads.length) {
    adsList.innerHTML = `<p>No ads posted yet for ${escapeHTML(userRecord.state)}.</p>`;
    return;
  }

  adsList.innerHTML = ads
    .map(
      (ad) => `
      <article class="ad-item">
        <div class="ad-title-row">
          <span>${escapeHTML(ad.title)}</span>
          <span>${escapeHTML(ad.price)}</span>
        </div>
        <p>${escapeHTML(ad.description)}</p>
        <p class="meta">Posted by ${escapeHTML(ad.author)} in ${escapeHTML(ad.state)} on ${new Date(ad.createdAt).toLocaleString()}</p>
      </article>
    `
    )
    .join("");
}

function escapeHTML(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);
  const username = String(formData.get("username")).trim().toLowerCase();
  const state = String(formData.get("state")).trim();
  const password = String(formData.get("password"));

  if (!state) {
    showToast("Please enter your state.");
    return;
  }

  const users = getUsers();
  const exists = users.some((user) => user.username === username);
  if (exists) {
    showToast("Username is already taken.");
    return;
  }

  users.push({ username, state, passwordHash: hashPassword(password) });
  writeJSON(USERS_KEY, users);
  registerForm.reset();
  showToast("Account created. You can login now.");
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const username = String(formData.get("username")).trim().toLowerCase();
  const password = String(formData.get("password"));

  const users = getUsers();
  const matchingUser = users.find(
    (user) => user.username === username && user.passwordHash === hashPassword(password)
  );

  if (!matchingUser) {
    showToast("Invalid username or password.");
    return;
  }

  setCurrentUser(username);
  setProfileActive(false);
  loginForm.reset();
  updateAuthUI();
  renderAds();
  showToast("Logged in successfully.");
});

enterProfileBtn.addEventListener("click", () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast("Log in first.");
    return;
  }
  setProfileActive(true);
  updateAuthUI();
  showToast("Profile selected. Posting is enabled.");
});

logoutBtn.addEventListener("click", () => {
  setCurrentUser(null);
  setProfileActive(false);
  updateAuthUI();
  renderAds();
  showToast("Logged out.");
});

adForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast("Please log in first.");
    return;
  }
  if (!isProfileActive()) {
    showToast("Select Enter Profile before posting.");
    return;
  }
  const currentUserRecord = getUsers().find((user) => user.username === currentUser);
  if (!currentUserRecord) {
    showToast("Your account could not be loaded. Please log in again.");
    return;
  }

  const formData = new FormData(adForm);
  const title = String(formData.get("title")).trim();
  const price = String(formData.get("price")).trim();
  const description = String(formData.get("description")).trim();

  const ads = getAds();
  ads.push({
    id: crypto.randomUUID(),
    title,
    price,
    description,
    author: currentUser,
    state: currentUserRecord.state,
    createdAt: Date.now(),
  });
  writeJSON(ADS_KEY, ads);
  adForm.reset();
  renderAds();
  showToast("Ad posted.");
});

updateAuthUI();
renderAds();
