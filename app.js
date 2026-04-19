const USERS_KEY = "classified_users";
const ADS_KEY = "classified_ads";
const CURRENT_USER_KEY = "classified_current_user";
const PROFILE_ACTIVE_KEY = "classified_profile_active";
const PASSWORD_RESET_KEY = "classified_password_reset";
const AD_REPORTS_KEY = "classified_ad_reports";
const ADMIN_ALERTS_KEY = "classified_admin_alerts";
const ANALYTICS_KEY = "classified_analytics";

/** Seeded QA admin — password shown on dashboard; change after first login in a real deployment. */
const ADMIN_USERNAME = "qa_admin";
const ADMIN_DEFAULT_PASSWORD = "qa_admin_demo";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const recoveryForm = document.getElementById("recoveryForm");
const profileForm = document.getElementById("profileForm");
const adForm = document.getElementById("adForm");
const authSection = document.getElementById("authSection");
const postAdSection = document.getElementById("postAdSection");
const menuWrapper = document.getElementById("menuWrapper");
const menuToggleBtn = document.getElementById("menuToggleBtn");
const menuPanel = document.getElementById("menuPanel");
const menuProfileDetails = document.getElementById("menuProfileDetails");
const enterProfileBtn = document.getElementById("enterProfileBtn");
const exitProfileBtn = document.getElementById("exitProfileBtn");
const logoutBtn = document.getElementById("logoutBtn");
const profileStateSelect = document.getElementById("profileState");
const profilePhoneInput = document.getElementById("profilePhone");
const profileEmailInput = document.getElementById("profileEmail");
const adStateSelect = document.getElementById("adState");
const adCategorySelect = document.getElementById("adCategory");
const adSubCategorySelect = document.getElementById("adSubCategory");
const adImagesInput = document.getElementById("adImages");
const adsList = document.getElementById("adsList");
const adsSectionTitle = document.getElementById("adsSectionTitle");
const adDetailModal = document.getElementById("adDetailModal");
const closeAdDetailBtn = document.getElementById("closeAdDetailBtn");
const detailModalCard = document.getElementById("detailModalCard");
const detailGoldBanner = document.getElementById("detailGoldBanner");
const detailHeroImage = document.getElementById("detailHeroImage");
const detailThumbnails = document.getElementById("detailThumbnails");
const detailTitle = document.getElementById("detailTitle");
const detailPrice = document.getElementById("detailPrice");
const detailPhone = document.getElementById("detailPhone");
const detailDescription = document.getElementById("detailDescription");
const adGoldTierSelect = document.getElementById("adGoldTier");
const resetModal = document.getElementById("resetModal");
const resetPasswordForm = document.getElementById("resetPasswordForm");
const resetModalHint = document.getElementById("resetModalHint");
const cancelResetBtn = document.getElementById("cancelResetBtn");
const authStatus = document.getElementById("authStatus");
const profileHint = document.getElementById("profileHint");
const toast = document.getElementById("toast");
const adsFiltersWrap = document.getElementById("adsFiltersWrap");
const homeCategoryFilterSelect = document.getElementById("homeCategoryFilter");
const adminDashboardSection = document.getElementById("adminDashboardSection");
const adminStatsGrid = document.getElementById("adminStatsGrid");
const adminSpamQueue = document.getElementById("adminSpamQueue");
const detailModalActions = document.getElementById("detailModalActions");
const detailReportBtn = document.getElementById("detailReportBtn");
const detailAdminDeleteBtn = document.getElementById("detailAdminDeleteBtn");

let currentRenderedAds = [];
let currentModalAdIndex = -1;
let touchStartX = 0;
let touchStartY = 0;

const GOLD_TIERS = {
  d3: { days: 3, price: 10, label: "3 days — $10" },
  d7: { days: 7, price: 20, label: "7 days — $20" },
  d14: { days: 14, price: 30, label: "14 days — $30" },
};

const SUB_CATEGORIES_BY_CATEGORY = {
  "Clothing and Fashion": ["Accessories", "Kids", "Men", "Shoes", "Women"],
  Collectibles: ["Antiques", "Art", "Cards", "Coins", "Memorabilia"],
  Electronics: ["Cameras", "Computers", "Gaming", "Phones", "TV and Audio"],
  "Home and Garden": ["Appliances", "Furniture", "Garden", "Home Decor", "Tools"],
  Jobs: ["Contract", "Full-Time", "Internships", "Part-Time", "Remote"],
  Pets: ["Birds", "Cats", "Dogs", "Fish", "Pet Supplies"],
  "Real Estate": ["Apartments", "Commercial", "Houses", "Land", "Vacation Rentals"],
  Services: ["Automotive", "Beauty", "Event Services", "Home Services", "Tutoring"],
  "Sports and Outdoors": ["Bicycles", "Camping", "Fitness", "Team Sports", "Water Sports"],
  Vehicles: ["Cars", "Motorcycles", "Parts and Accessories", "SUVs", "Trucks"],
};

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

function writeUsers(users) {
  writeJSON(USERS_KEY, users);
}

function getAds() {
  return readJSON(ADS_KEY, []);
}

function writeAds(ads) {
  writeJSON(ADS_KEY, ads);
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
  return String(value).trim().toLowerCase();
}

function normalizeEmail(value) {
  return String(value).trim().toLowerCase();
}

function getCurrentUserRecord() {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  return getUsers().find((user) => user.username === currentUser) || null;
}

function isProfileActive() {
  return localStorage.getItem(PROFILE_ACTIVE_KEY) === "true";
}

function setProfileActive(active) {
  localStorage.setItem(PROFILE_ACTIVE_KEY, active ? "true" : "false");
}

function hashPassword(password) {
  return btoa(password);
}

function isAdminUser(userRecord) {
  if (!userRecord) return false;
  return userRecord.role === "admin" || userRecord.username === ADMIN_USERNAME;
}

function ensureAdminUser() {
  const users = getUsers();
  const expectedHash = hashPassword(ADMIN_DEFAULT_PASSWORD);
  const idx = users.findIndex((u) => u.username === ADMIN_USERNAME);
  if (idx === -1) {
    users.push({
      username: ADMIN_USERNAME,
      passwordHash: expectedHash,
      email: "qa-admin@localhost.local",
      phone: "(000) 000-0000",
      state: "California",
      role: "admin",
    });
    writeUsers(users);
    return;
  }
  const u = users[idx];
  let changed = false;
  // Repair stored account if local data predates the seed or password drifted (demo QA only).
  if (u.passwordHash !== expectedHash) {
    u.passwordHash = expectedHash;
    changed = true;
  }
  if (!normalizeEmail(u.email || "")) {
    u.email = "qa-admin@localhost.local";
    changed = true;
  }
  if (u.role !== "admin") {
    u.role = "admin";
    changed = true;
  }
  if (changed) {
    writeUsers(users);
  }
}

function getAdReports() {
  return readJSON(AD_REPORTS_KEY, {});
}

function writeAdReports(map) {
  writeJSON(AD_REPORTS_KEY, map);
}

function getAdminAlerts() {
  return readJSON(ADMIN_ALERTS_KEY, []);
}

function writeAdminAlerts(list) {
  writeJSON(ADMIN_ALERTS_KEY, list);
}

function getAnalytics() {
  return readJSON(ANALYTICS_KEY, { pageViews: 0, sessions: 0 });
}

function writeAnalytics(data) {
  writeJSON(ANALYTICS_KEY, data);
}

function trackPageView() {
  const a = getAnalytics();
  a.pageViews = (a.pageViews || 0) + 1;
  if (!sessionStorage.getItem("classified_session_counted")) {
    sessionStorage.setItem("classified_session_counted", "1");
    a.sessions = (a.sessions || 0) + 1;
  }
  writeAnalytics(a);
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => {
    toast.hidden = true;
  }, 2200);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function closeMenu() {
  menuPanel.hidden = true;
}

function setAuthSectionVisibility(isVisible) {
  authSection.hidden = !isVisible;
  authSection.style.display = isVisible ? "grid" : "none";
}

function formatPrice(value) {
  const trimmed = String(value).trim();
  if (!trimmed) return "$0";
  return trimmed.startsWith("$") ? trimmed : `$${trimmed}`;
}

function isGoldActive(ad) {
  return typeof ad.goldExpiresAt === "number" && ad.goldExpiresAt > Date.now();
}

/** True when an ad is hidden from all feeds until an admin approves it (3+ distinct reports). */
function isAdHiddenPendingModeration(ad) {
  return ad.pendingModeration === true;
}

function applyGoldTierToAd(ad, tierKey) {
  const tier = GOLD_TIERS[tierKey];
  if (!tier) {
    ad.goldExpiresAt = null;
    ad.goldTier = null;
    return;
  }
  ad.goldTier = tierKey;
  ad.goldExpiresAt = Date.now() + tier.days * 86400000;
}

function sortAdsForDisplay(ads) {
  return [...ads].sort((a, b) => {
    const ga = isGoldActive(a) ? 1 : 0;
    const gb = isGoldActive(b) ? 1 : 0;
    if (ga !== gb) return gb - ga;
    return b.createdAt - a.createdAt;
  });
}

function notifyAdminSpamThreshold(ad, reporters) {
  const alerts = getAdminAlerts();
  if (alerts.some((a) => a.type === "spam_reports" && a.adId === ad.id)) return;
  alerts.push({
    type: "spam_reports",
    adId: ad.id,
    title: ad.title,
    author: ad.author,
    reporters: [...reporters],
    at: Date.now(),
  });
  writeAdminAlerts(alerts);
  const adminLoggedIn = isAdminUser(getCurrentUserRecord());
  if (adminLoggedIn) {
    showToast(`Admin: "${ad.title}" reached 3 reports.`);
  }
  renderAdminDashboard();
}

function recordReport(adId) {
  const userRecord = getCurrentUserRecord();
  if (!userRecord) {
    showToast("Log in to report a listing.");
    return;
  }
  const username = userRecord.username;
  const ads = getAds();
  const ad = ads.find((a) => a.id === adId);
  if (!ad) {
    showToast("That listing is no longer available.");
    return;
  }
  if (ad.author === username) {
    showToast("You cannot report your own listing.");
    return;
  }
  if (!confirm("Report this listing as spam or a scam? (Demo — stored locally only.)")) return;

  const reports = getAdReports();
  const list = Array.isArray(reports[adId]) ? [...reports[adId]] : [];
  if (list.includes(username)) {
    showToast("You already reported this listing.");
    return;
  }
  list.push(username);
  reports[adId] = list;
  writeAdReports(reports);

  if (list.length >= 3) {
    const adsAll = getAds();
    const ai = adsAll.findIndex((a) => a.id === adId);
    let adFresh = ad;
    if (ai !== -1) {
      adsAll[ai].pendingModeration = true;
      writeAds(adsAll);
      adFresh = adsAll[ai];
    }
    notifyAdminSpamThreshold(adFresh, list);
    showToast("Thanks — this listing was flagged for admin review (3 reports).");
    renderAds();
  } else {
    showToast(`Report recorded (${list.length}/3 unique users).`);
  }
  renderAdminDashboard();
}

function readPasswordReset() {
  return readJSON(PASSWORD_RESET_KEY, null);
}

function writePasswordReset(payload) {
  writeJSON(PASSWORD_RESET_KEY, payload);
}

function clearPasswordReset() {
  localStorage.removeItem(PASSWORD_RESET_KEY);
}

function buildResetUrl(token) {
  const base = window.location.href.split("#")[0];
  return `${base}#reset=${encodeURIComponent(token)}`;
}

function openAdDetailsByIndex(index) {
  if (index < 0 || index >= currentRenderedAds.length) return;
  const ad = currentRenderedAds[index];
  currentModalAdIndex = index;
  const poster = getUsers().find((u) => u.username === ad.author);
  const phone = poster?.phone ? String(poster.phone).trim() : "";

  detailModalCard.classList.toggle("gold-frame-active", isGoldActive(ad));
  if (isGoldActive(ad)) {
    detailGoldBanner.hidden = false;
    detailGoldBanner.textContent = `Gold listing · expires ${new Date(ad.goldExpiresAt).toLocaleString()}`;
  } else {
    detailGoldBanner.hidden = true;
    detailGoldBanner.textContent = "";
  }

  const images = Array.isArray(ad.images) ? ad.images : [];
  detailHeroImage.src = images[0] || "";
  detailHeroImage.alt = ad.title;

  if (images.length > 1) {
    detailThumbnails.hidden = false;
    detailThumbnails.innerHTML = images
      .slice(1)
      .map(
        (img, i) =>
          `<img src="${img}" alt="" loading="lazy" class="detail-thumb" />`
      )
      .join("");
  } else {
    detailThumbnails.innerHTML = "";
    detailThumbnails.hidden = true;
  }

  detailTitle.textContent = ad.title;
  detailPrice.textContent = formatPrice(ad.price);
  detailPhone.textContent = phone ? `Phone: ${phone}` : "Phone: not provided";
  detailDescription.textContent = ad.description;

  const viewer = getCurrentUserRecord();
  const isOwn = Boolean(viewer && ad.author === viewer.username);
  const admin = Boolean(viewer && isAdminUser(viewer));
  if (detailModalActions) {
    const showReport = Boolean(viewer && !isOwn);
    const showAdminDel = Boolean(admin);
    detailModalActions.hidden = !showReport && !showAdminDel;
    if (detailReportBtn) {
      detailReportBtn.hidden = !showReport;
      detailReportBtn.dataset.adId = ad.id;
    }
    if (detailAdminDeleteBtn) {
      detailAdminDeleteBtn.hidden = !showAdminDel;
      detailAdminDeleteBtn.dataset.adId = ad.id;
    }
  }

  adDetailModal.hidden = false;
}

function navigateModalAds(direction) {
  if (currentModalAdIndex === -1) return;
  const nextIndex = currentModalAdIndex + direction;
  if (nextIndex < 0 || nextIndex >= currentRenderedAds.length) {
    showToast("No more ads in that direction.");
    return;
  }
  openAdDetailsByIndex(nextIndex);
}

function updateAuthUI() {
  const currentUser = getCurrentUser();
  const userRecord = getCurrentUserRecord();
  const profileActive = Boolean(userRecord) && isProfileActive();

  // Hide register/login immediately whenever a user is logged in.
  setAuthSectionVisibility(!currentUser);
  menuWrapper.hidden = !userRecord;
  postAdSection.hidden = !profileActive;
  adForm.querySelector("button").disabled = !profileActive;
  enterProfileBtn.hidden = profileActive;
  exitProfileBtn.hidden = !profileActive;
  logoutBtn.hidden = !userRecord;

  if (adminDashboardSection) {
    const showAdminAnalytics =
      Boolean(userRecord) && isAdminUser(userRecord) && isProfileActive();
    adminDashboardSection.hidden = !showAdminAnalytics;
  }

  if (userRecord) {
    authStatus.textContent = "";
    menuProfileDetails.textContent = `${userRecord.username} (${userRecord.state})`;
    profileHint.textContent = "Use the top-right menu to enter your profile.";
    profileStateSelect.value = userRecord.state;
    profilePhoneInput.value = userRecord.phone || "";
    profileEmailInput.value = userRecord.email || "";
    adStateSelect.value = userRecord.state;
  } else {
    authStatus.textContent = "Not logged in";
    menuProfileDetails.textContent = "";
    profileHint.textContent = "Log in, then use the top-right menu to enter your profile.";
    closeMenu();
  }

  if (userRecord && isAdminUser(userRecord) && isProfileActive()) {
    renderAdminDashboard();
  }
}

function dismissSpamAlert(adId) {
  const alerts = getAdminAlerts().filter((a) => !(a.type === "spam_reports" && a.adId === adId));
  writeAdminAlerts(alerts);
  renderAdminDashboard();
  showToast("Alert dismissed. Listing stays hidden until approved or deleted.");
}

function approveAdModeration(adId) {
  const userRecord = getCurrentUserRecord();
  if (!userRecord || !isAdminUser(userRecord)) return;
  const ads = getAds();
  const idx = ads.findIndex((a) => a.id === adId);
  if (idx === -1) {
    showToast("Listing not found.");
    return;
  }
  ads[idx].pendingModeration = false;
  writeAds(ads);
  const alerts = getAdminAlerts().filter((a) => !(a.type === "spam_reports" && a.adId === adId));
  writeAdminAlerts(alerts);
  renderAds();
  maybeRefreshAdminDashboard();
  showToast("Listing approved — it is visible again.");
}

function renderAdminDashboard() {
  if (!adminStatsGrid || !adminSpamQueue) return;
  const userRecord = getCurrentUserRecord();
  if (!userRecord || !isAdminUser(userRecord) || !isProfileActive()) return;

  const users = getUsers();
  const ads = getAds();
  const a = getAnalytics();
  const reports = getAdReports();
  const alerts = getAdminAlerts();

  let goldCount = 0;
  let pendingModerationCount = 0;
  let reportEvents = 0;
  const adsWithReports = Object.keys(reports).filter((id) => (reports[id] || []).length > 0).length;
  for (const id of Object.keys(reports)) {
    reportEvents += (reports[id] || []).length;
  }
  for (const ad of ads) {
    if (isGoldActive(ad)) goldCount += 1;
    if (isAdHiddenPendingModeration(ad)) pendingModerationCount += 1;
  }

  const byCat = {};
  for (const ad of ads) {
    const c = ad.category || "Other";
    byCat[c] = (byCat[c] || 0) + 1;
  }
  const topCats = Object.entries(byCat)
    .sort((x, y) => y[1] - x[1])
    .slice(0, 10);

  const catRows = topCats.length
    ? topCats.map(([name, n]) => `<tr><td>${escapeHTML(name)}</td><td>${n}</td></tr>`).join("")
    : "<tr><td colspan=\"2\">No ads yet</td></tr>";

  adminStatsGrid.innerHTML = `
    <div class="admin-stat"><span class="admin-stat-value">${a.pageViews ?? 0}</span><span class="admin-stat-label">Page views (total)</span></div>
    <div class="admin-stat"><span class="admin-stat-value">${a.sessions ?? 0}</span><span class="admin-stat-label">Sessions (this browser)</span></div>
    <div class="admin-stat"><span class="admin-stat-value">${users.length}</span><span class="admin-stat-label">User accounts</span></div>
    <div class="admin-stat"><span class="admin-stat-value">${ads.length}</span><span class="admin-stat-label">Ads listed</span></div>
    <div class="admin-stat"><span class="admin-stat-value">${pendingModerationCount}</span><span class="admin-stat-label">Hidden pending approval</span></div>
    <div class="admin-stat"><span class="admin-stat-value">${goldCount}</span><span class="admin-stat-label">Active gold boosts</span></div>
    <div class="admin-stat"><span class="admin-stat-value">${adsWithReports}</span><span class="admin-stat-label">Ads with ≥1 report</span></div>
    <div class="admin-stat"><span class="admin-stat-value">${reportEvents}</span><span class="admin-stat-label">Report submissions</span></div>
    <div class="admin-stat admin-stat-wide">
      <span class="admin-stat-label">Top categories</span>
      <table class="admin-mini-table"><thead><tr><th>Category</th><th>Ads</th></tr></thead><tbody>${catRows}</tbody></table>
    </div>
  `;

  const pendingAds = ads
    .filter((ad) => isAdHiddenPendingModeration(ad))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  if (!pendingAds.length) {
    adminSpamQueue.innerHTML =
      '<p class="hint">No listings are hidden for review. When an ad receives 3 reports from different users, it appears here until you approve or delete it.</p>';
    return;
  }
  adminSpamQueue.innerHTML = `<h3 class="admin-queue-title">Hidden listings — review queue</h3><p class="hint">These ads are not visible on the board until you <strong>Approve & show</strong> or delete them. <strong>Dismiss alert only</strong> clears the notification but keeps the listing hidden.</p><ul class="admin-alert-list">${pendingAds
    .map((ad) => {
      const repList = (reports[ad.id] || []).join(", ") || "—";
      const alert = alerts.find((x) => x.type === "spam_reports" && x.adId === ad.id);
      const when = alert ? new Date(alert.at).toLocaleString() : "—";
      return `
    <li class="admin-alert-item">
      <strong>${escapeHTML(ad.title)}</strong> · ${escapeHTML(ad.author)} · ${escapeHTML(ad.state)}<br />
      <span class="hint">Reporters: ${escapeHTML(repList)} · Alert: ${escapeHTML(when)}</span>
      <div class="admin-alert-actions">
        <button type="button" class="admin-approve-btn" data-ad-id="${escapeHTML(ad.id)}">Approve & show listing</button>
        <button type="button" class="secondary ad-dismiss-alert-btn" data-ad-id="${escapeHTML(ad.id)}">Dismiss alert only</button>
        <button type="button" class="ad-secondary-btn admin-queue-delete-btn" data-ad-id="${escapeHTML(ad.id)}">Delete ad</button>
      </div>
    </li>`;
    })
    .join("")}</ul>`;
}

function renderAdCardHTML(ad, profileActive) {
  const userRecord = getCurrentUserRecord();
  const admin = Boolean(userRecord && isAdminUser(userRecord));
  const viewerName = userRecord?.username;
  const isOwn = Boolean(viewerName && ad.author === viewerName);
  const imgs = Array.isArray(ad.images) ? ad.images : [];
  const mainImage = imgs[0] || "";
  const goldClass = isGoldActive(ad) ? " gold-frame-active" : "";
  const goldExpiryHint =
    profileActive && isGoldActive(ad)
      ? `<span class="ad-gold-expiry">Gold · ends ${new Date(ad.goldExpiresAt).toLocaleDateString()}</span>`
      : "";

  const homeRow =
    !profileActive && viewerName
      ? `<div class="ad-card-footer">
          ${
            admin
              ? `<button type="button" class="ad-secondary-btn ad-delete-btn ad-admin-delete-btn" data-ad-id="${escapeHTML(ad.id)}">Delete (admin)</button>`
              : ""
          }
          ${
            !isOwn
              ? `<button type="button" class="ad-report-btn" data-ad-id="${escapeHTML(ad.id)}">Report</button>`
              : ""
          }
        </div>`
      : "";

  const profileActions = profileActive
    ? `<div class="ad-actions">
            <button type="button" class="ad-republish-btn" data-ad-id="${escapeHTML(ad.id)}">Re-publish</button>
            <button type="button" class="ad-secondary-btn ad-delete-btn" data-ad-id="${escapeHTML(ad.id)}">Delete</button>
          </div>`
    : "";

  return `
      <article class="ad-item${goldClass}" data-ad-id="${ad.id}">
        <img class="ad-main-image" src="${mainImage}" alt="${escapeHTML(ad.title)}" loading="lazy" />
        <div class="ad-title-row">
          <span>${escapeHTML(ad.title)}</span>
          <span>${escapeHTML(formatPrice(ad.price))}</span>
        </div>
        <p class="meta">${escapeHTML(ad.category)} / ${escapeHTML(ad.subCategory)} in ${escapeHTML(ad.state)}${goldExpiryHint}</p>
        ${homeRow}
        ${profileActions}
      </article>
    `;
}

function renderAds() {
  const userRecord = getCurrentUserRecord();
  const profileActive = isProfileActive();
  if (adsFiltersWrap) {
    adsFiltersWrap.hidden = !userRecord || profileActive;
  }

  if (!userRecord) {
    adsSectionTitle.textContent = "Currently selected state";
    adsList.innerHTML = "<p>Please log in to view local ads.</p>";
    currentRenderedAds = [];
    maybeRefreshAdminDashboard();
    return;
  }

  if (profileActive) {
    adsSectionTitle.textContent = "Your ads (all states)";
    const allMine = getAds().filter((ad) => ad.author === userRecord.username);
    const rawAds = allMine.filter((ad) => !isAdHiddenPendingModeration(ad));
    if (!rawAds.length) {
      adsList.innerHTML = allMine.length
        ? "<p>Your listings are hidden pending admin review after multiple reports. They will reappear after an admin approves them.</p>"
        : "<p>You have not posted any ads yet.</p>";
      currentRenderedAds = [];
      maybeRefreshAdminDashboard();
      return;
    }

    const byState = {};
    for (const ad of rawAds) {
      const s = ad.state || "Unknown";
      if (!byState[s]) byState[s] = [];
      byState[s].push(ad);
    }
    const stateNames = Object.keys(byState).sort((a, b) => a.localeCompare(b));
    const orderedAds = [];
    const parts = [];
    for (const stateName of stateNames) {
      const group = sortAdsForDisplay(byState[stateName]);
      orderedAds.push(...group);
      parts.push(`<h3 class="ads-state-heading">${escapeHTML(stateName)}</h3>`);
      parts.push(group.map((ad) => renderAdCardHTML(ad, true)).join(""));
    }
    currentRenderedAds = orderedAds;
    adsList.innerHTML = parts.join("");
    maybeRefreshAdminDashboard();
    return;
  }

  adsSectionTitle.textContent = `Currently selected state: ${userRecord.state}`;
  const categoryFilter = homeCategoryFilterSelect ? homeCategoryFilterSelect.value : "";
  let ads = sortAdsForDisplay(
    getAds().filter(
      (ad) =>
        normalizeState(ad.state) === normalizeState(userRecord.state) &&
        !isAdHiddenPendingModeration(ad)
    )
  );
  if (categoryFilter) {
    ads = ads.filter((ad) => ad.category === categoryFilter);
  }
  currentRenderedAds = ads;

  if (!ads.length) {
    adsList.innerHTML = categoryFilter
      ? `<p>No ads in this category for ${escapeHTML(userRecord.state)}.</p>`
      : `<p>No ads posted yet for ${escapeHTML(userRecord.state)}.</p>`;
    maybeRefreshAdminDashboard();
    return;
  }

  adsList.innerHTML = ads.map((ad) => renderAdCardHTML(ad, false)).join("");
  maybeRefreshAdminDashboard();
}

function maybeRefreshAdminDashboard() {
  const u = getCurrentUserRecord();
  if (u && isAdminUser(u) && isProfileActive()) {
    renderAdminDashboard();
  }
}

function deleteAd(adId) {
  const userRecord = getCurrentUserRecord();
  if (!userRecord) return;
  const ads = getAds();
  const ad = ads.find((a) => a.id === adId);
  if (!ad) return;
  const isOwner = ad.author === userRecord.username;
  const admin = isAdminUser(userRecord);
  if (!isOwner && !admin) {
    showToast("You can only delete your own ads.");
    return;
  }
  if (!confirm("Delete this ad permanently?")) return;
  const next = ads.filter((a) => a.id !== adId);
  writeAds(next);
  const reports = getAdReports();
  if (reports[adId]) {
    delete reports[adId];
    writeAdReports(reports);
  }
  const alerts = getAdminAlerts().filter((a) => a.adId !== adId);
  writeAdminAlerts(alerts);
  if (!adDetailModal.hidden) {
    const viewing = currentRenderedAds[currentModalAdIndex];
    if (viewing && viewing.id === adId) {
      adDetailModal.hidden = true;
      currentModalAdIndex = -1;
    }
  }
  renderAds();
  maybeRefreshAdminDashboard();
  showToast("Ad deleted.");
}

function republishAd(adId) {
  const ads = getAds();
  const idx = ads.findIndex((ad) => ad.id === adId);
  if (idx === -1) return;
  ads[idx].createdAt = Date.now();
  writeAds(ads);
  renderAds();
  if (!adDetailModal.hidden) {
    const newIndex = currentRenderedAds.findIndex((ad) => ad.id === adId);
    if (newIndex !== -1) {
      openAdDetailsByIndex(newIndex);
    }
  }
  showToast("Ad re-published with current date and time.");
}

function filesToDataUrls(fileList) {
  const files = Array.from(fileList);
  return Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Failed to read image file."));
          reader.readAsDataURL(file);
        })
    )
  );
}

function populateSubCategoryOptions(category, selectedSubCategory = "") {
  const options = [...(SUB_CATEGORIES_BY_CATEGORY[category] || [])].sort((a, b) => a.localeCompare(b));
  adSubCategorySelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = options.length ? "Select sub category" : "Select category first";
  adSubCategorySelect.appendChild(placeholder);

  options.forEach((subCategory) => {
    const option = document.createElement("option");
    option.value = subCategory;
    option.textContent = subCategory;
    adSubCategorySelect.appendChild(option);
  });

  adSubCategorySelect.value = options.includes(selectedSubCategory) ? selectedSubCategory : "";
}

function populateAdCategoryOptions() {
  const placeholder = adCategorySelect.querySelector('option[value=""]');
  const options = Array.from(adCategorySelect.querySelectorAll("option"))
    .filter((option) => option.value)
    .sort((a, b) => a.textContent.localeCompare(b.textContent));

  adCategorySelect.innerHTML = "";
  if (placeholder) {
    adCategorySelect.appendChild(placeholder);
  } else {
    const fallback = document.createElement("option");
    fallback.value = "";
    fallback.textContent = "Select category";
    adCategorySelect.appendChild(fallback);
  }

  options.forEach((option) => adCategorySelect.appendChild(option));
}

function populateHomeCategoryFilter() {
  if (!homeCategoryFilterSelect) return;
  const previous = homeCategoryFilterSelect.value;
  homeCategoryFilterSelect.innerHTML = "";
  const allOpt = document.createElement("option");
  allOpt.value = "";
  allOpt.textContent = "All categories";
  homeCategoryFilterSelect.appendChild(allOpt);
  Object.keys(SUB_CATEGORIES_BY_CATEGORY)
    .sort((a, b) => a.localeCompare(b))
    .forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      homeCategoryFilterSelect.appendChild(opt);
    });
  if ([...homeCategoryFilterSelect.options].some((o) => o.value === previous)) {
    homeCategoryFilterSelect.value = previous;
  }
}

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);
  const username = String(formData.get("username")).trim().toLowerCase();
  const email = normalizeEmail(String(formData.get("email")));
  const phone = String(formData.get("phone")).trim();
  const state = String(formData.get("state")).trim();
  const password = String(formData.get("password"));

  if (!email) {
    showToast("Email is required.");
    return;
  }

  if (!phone) {
    showToast("Phone number is required.");
    return;
  }

  if (!state) {
    showToast("Please select your state.");
    return;
  }

  if (username === ADMIN_USERNAME) {
    showToast("That username is reserved for the QA admin account.");
    return;
  }

  const users = getUsers();
  const exists = users.some((user) => user.username === username);
  if (exists) {
    showToast("Username is already taken.");
    return;
  }

  const emailTaken = users.some((user) => normalizeEmail(user.email || "") === email);
  if (emailTaken) {
    showToast("Email is already registered.");
    return;
  }

  users.push({ username, email, phone: "", state, passwordHash: hashPassword(password) });
  writeUsers(users);
  registerForm.reset();
  showToast("Account created. You can login now.");
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const username = String(formData.get("username")).trim().toLowerCase();
  const password = String(formData.get("password"));

  const matchingUser = getUsers().find(
    (user) => user.username === username && user.passwordHash === hashPassword(password)
  );

  if (!matchingUser) {
    showToast("Invalid username or password.");
    return;
  }

  if (!normalizeEmail(matchingUser.email || "")) {
    showToast("This account needs an email on file. Please register again or contact support.");
    return;
  }

  setCurrentUser(username);
  setProfileActive(false);
  loginForm.reset();
  updateAuthUI();
  renderAds();
  showToast("Logged in successfully.");
});

menuToggleBtn.addEventListener("click", () => {
  menuPanel.hidden = !menuPanel.hidden;
});

document.addEventListener("click", (event) => {
  if (!menuWrapper.contains(event.target)) {
    closeMenu();
  }
});

enterProfileBtn.addEventListener("click", () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast("Log in first.");
    return;
  }
  setProfileActive(true);
  closeMenu();
  updateAuthUI();
  renderAds();
  showToast("Profile mode enabled.");
});

exitProfileBtn.addEventListener("click", () => {
  // Exit profile mode but keep the user logged in.
  setProfileActive(false);
  closeMenu();
  updateAuthUI();
  renderAds();
  showToast("Exited profile mode.");
});

logoutBtn.addEventListener("click", () => {
  setCurrentUser(null);
  setProfileActive(false);
  closeMenu();
  updateAuthUI();
  renderAds();
  showToast("Logged out.");
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const currentUser = getCurrentUser();
  const formData = new FormData(profileForm);
  const newState = String(formData.get("state")).trim();
  const newPhone = String(formData.get("phone")).trim();
  const newEmail = normalizeEmail(String(formData.get("email")));
  if (!currentUser || !newState) return;

  if (!newEmail) {
    showToast("Email is required.");
    return;
  }

  const users = getUsers();
  const userIndex = users.findIndex((user) => user.username === currentUser);
  if (userIndex === -1) return;

  const emailTaken = users.some(
    (user, index) => index !== userIndex && normalizeEmail(user.email || "") === newEmail
  );
  if (emailTaken) {
    showToast("Email is already used by another account.");
    return;
  }

  users[userIndex].state = newState;
  users[userIndex].phone = newPhone;
  users[userIndex].email = newEmail;
  writeUsers(users);
  adStateSelect.value = newState;
  updateAuthUI();
  renderAds();
  showToast("Profile updated.");
});

adForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const userRecord = getCurrentUserRecord();
  if (!userRecord) {
    showToast("Please log in first.");
    return;
  }
  if (!isProfileActive()) {
    showToast("Enter profile mode before posting.");
    return;
  }

  const formData = new FormData(adForm);
  const title = String(formData.get("title")).trim();
  const state = String(formData.get("state")).trim();
  const category = String(formData.get("category")).trim();
  const subCategory = String(formData.get("subCategory")).trim();
  const price = String(formData.get("price")).trim();
  const description = String(formData.get("description")).trim();
  const files = adImagesInput.files ? Array.from(adImagesInput.files) : [];

  if (!state || !category || !subCategory) {
    showToast("State, category, and sub category are required.");
    return;
  }
  if (files.length < 1 || files.length > 10) {
    showToast("Please upload between 1 and 10 pictures.");
    return;
  }

  try {
    const images = await filesToDataUrls(files);
    const goldTier = String(formData.get("goldTier") || "").trim();
    if (goldTier && GOLD_TIERS[goldTier]) {
      const tier = GOLD_TIERS[goldTier];
      const ok = confirm(`Add gold frame to this ad: ${tier.label}? (demo — no payment processed)`);
      if (!ok) return;
    }

    const newAd = {
      id: crypto.randomUUID(),
      title,
      state,
      category,
      subCategory,
      price,
      description,
      images,
      author: userRecord.username,
      createdAt: Date.now(),
      goldExpiresAt: null,
      goldTier: null,
      pendingModeration: false,
    };
    if (goldTier && GOLD_TIERS[goldTier]) {
      applyGoldTierToAd(newAd, goldTier);
    }

    const ads = getAds();
    ads.push(newAd);
    writeAds(ads);
    adForm.reset();
    if (adGoldTierSelect) adGoldTierSelect.value = "";
    populateSubCategoryOptions(adCategorySelect.value);
    adStateSelect.value = getCurrentUserRecord()?.state || "";
    renderAds();
    showToast("Ad posted.");
  } catch (error) {
    showToast("One or more images could not be processed.");
  }
});

recoveryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = normalizeEmail(String(new FormData(recoveryForm).get("email")));
  if (!email) {
    showToast("Please enter your email.");
    return;
  }

  const users = getUsers();
  const user = users.find((entry) => normalizeEmail(entry.email || "") === email);
  if (!user) {
    showToast("No account found for that email.");
    return;
  }

  const token = crypto.randomUUID();
  writePasswordReset({ token, email, username: user.username, expiresAt: Date.now() + 1000 * 60 * 30 });

  const resetUrl = buildResetUrl(token);
  const subject = encodeURIComponent("Classifieds account recovery");
  const body = encodeURIComponent(
    `Username: ${user.username}\n\nReset your password using this link:\n${resetUrl}\n\nIf you did not request this, you can ignore this message.`
  );

  window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
  recoveryForm.reset();
  showToast("Recovery email draft opened.");
});

resetPasswordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const reset = readPasswordReset();
  if (!reset?.token) {
    showToast("Reset link is missing or expired.");
    return;
  }

  if (Date.now() > reset.expiresAt) {
    clearPasswordReset();
    showToast("Reset link expired. Request a new one.");
    resetModal.hidden = true;
    return;
  }

  const newPassword = String(new FormData(resetPasswordForm).get("newPassword"));
  const users = getUsers();
  const userIndex = users.findIndex((user) => user.username === reset.username);
  if (userIndex === -1) {
    clearPasswordReset();
    showToast("Account not found.");
    resetModal.hidden = true;
    return;
  }

  users[userIndex].passwordHash = hashPassword(newPassword);
  writeUsers(users);
  clearPasswordReset();
  resetPasswordForm.reset();
  resetModal.hidden = true;
  history.replaceState(null, "", window.location.pathname + window.location.search);
  showToast("Password updated. You can log in now.");
});

cancelResetBtn.addEventListener("click", () => {
  resetModal.hidden = true;
  resetPasswordForm.reset();
});

adCategorySelect.addEventListener("change", () => {
  populateSubCategoryOptions(adCategorySelect.value);
});

if (homeCategoryFilterSelect) {
  homeCategoryFilterSelect.addEventListener("change", () => {
    renderAds();
  });
}

if (detailReportBtn) {
  detailReportBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const id = detailReportBtn.dataset.adId;
    if (id) recordReport(id);
  });
}

if (detailAdminDeleteBtn) {
  detailAdminDeleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const id = detailAdminDeleteBtn.dataset.adId;
    if (id) deleteAd(id);
  });
}

if (adminSpamQueue) {
  adminSpamQueue.addEventListener("click", (e) => {
    const approve = e.target.closest(".admin-approve-btn");
    if (approve) {
      e.preventDefault();
      approveAdModeration(approve.getAttribute("data-ad-id"));
      return;
    }
    const dismiss = e.target.closest(".ad-dismiss-alert-btn");
    if (dismiss) {
      e.preventDefault();
      dismissSpamAlert(dismiss.getAttribute("data-ad-id"));
      return;
    }
    const del = e.target.closest(".admin-queue-delete-btn");
    if (del) {
      e.preventDefault();
      deleteAd(del.getAttribute("data-ad-id"));
    }
  });
}

adsList.addEventListener("click", (event) => {
  const reportBtn = event.target.closest(".ad-report-btn");
  if (reportBtn) {
    event.preventDefault();
    event.stopPropagation();
    recordReport(reportBtn.getAttribute("data-ad-id"));
    return;
  }

  const adminDel = event.target.closest(".ad-admin-delete-btn");
  if (adminDel) {
    event.preventDefault();
    event.stopPropagation();
    deleteAd(adminDel.getAttribute("data-ad-id"));
    return;
  }

  const deleteBtn = event.target.closest(".ad-delete-btn");
  if (deleteBtn) {
    event.preventDefault();
    event.stopPropagation();
    deleteAd(deleteBtn.getAttribute("data-ad-id"));
    return;
  }
  const republishBtn = event.target.closest(".ad-republish-btn");
  if (republishBtn) {
    event.preventDefault();
    event.stopPropagation();
    republishAd(republishBtn.getAttribute("data-ad-id"));
    return;
  }

  const adCard = event.target.closest(".ad-item");
  if (!adCard) return;

  const adId = adCard.getAttribute("data-ad-id");
  const adIndex = currentRenderedAds.findIndex((entry) => entry.id === adId);
  if (adIndex === -1) return;
  openAdDetailsByIndex(adIndex);
});

closeAdDetailBtn.addEventListener("click", () => {
  adDetailModal.hidden = true;
  currentModalAdIndex = -1;
});

adDetailModal.addEventListener("click", (event) => {
  if (event.target === adDetailModal) {
    adDetailModal.hidden = true;
    currentModalAdIndex = -1;
  }
});

adDetailModal.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  },
  { passive: true }
);

adDetailModal.addEventListener(
  "touchend",
  (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    // Swipe left => newer (left side), swipe right => older (right side).
    if (deltaX < 0) {
      navigateModalAds(-1);
    } else {
      navigateModalAds(1);
    }
  },
  { passive: true }
);

function maybeHandlePasswordResetHash() {
  const hash = window.location.hash || "";
  if (!hash.startsWith("#reset=")) return;

  const token = decodeURIComponent(hash.replace("#reset=", ""));
  const reset = readPasswordReset();
  if (!reset || reset.token !== token) {
    showToast("Invalid or expired reset link.");
    history.replaceState(null, "", window.location.pathname + window.location.search);
    return;
  }

  if (Date.now() > reset.expiresAt) {
    clearPasswordReset();
    showToast("Reset link expired. Request a new one.");
    history.replaceState(null, "", window.location.pathname + window.location.search);
    return;
  }

  resetModalHint.textContent = `Resetting password for ${reset.username}.`;
  resetModal.hidden = false;
}

ensureAdminUser();
trackPageView();
populateAdCategoryOptions();
populateHomeCategoryFilter();
populateSubCategoryOptions(adCategorySelect.value);
maybeHandlePasswordResetHash();
window.addEventListener("hashchange", maybeHandlePasswordResetHash);
updateAuthUI();
renderAds();
