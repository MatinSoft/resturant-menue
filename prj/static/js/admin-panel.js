// ============================================
// ORDER MANAGEMENT DASHBOARD
// ============================================

let allOrders = [];
let filteredOrders = [];
let isLoading = true;
let currentPage = 1;
let hasMoreOrders = false;

const ordersContainer = document.getElementById("orders-container");
const loadingSkeleton = document.getElementById("loading-skeleton");
const emptyState = document.getElementById("empty-state");
const statsRow = document.getElementById("stats-row");
const toastContainer = document.getElementById("toast-container");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const adminUsername = document.getElementById("admin-username");

if (window.ADMIN_USERNAME) adminUsername.textContent = window.ADMIN_USERNAME;

// Toast
function showToast(message, type = "success", duration = 4000) {
  const icons = {
    success: "bi-check-circle-fill text-success",
    error: "bi-exclamation-circle-fill text-danger",
    warning: "bi-exclamation-triangle-fill text-warning",
    info: "bi-info-circle-fill text-info",
  };
  const toast = document.createElement("div");
  toast.className = `custom-toast ${type}`;
  toast.innerHTML = `<i class="bi ${icons[type] || icons.info} fs-5"></i><span class="flex-grow-1">${message}</span><button class="btn-close btn-close-sm" onclick="this.parentElement.remove()"></button>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(120%)";
    toast.style.transition = "all 0.4s ease-in";
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// CSRF Cookie
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// API
async function fetchOrders(page = 1) {
  try {
    isLoading = true;
    if (page === 1) {
      loadingSkeleton.style.display = "block";
      emptyState.style.display = "none";
    }
    const params = new URLSearchParams({
      status: statusFilter.value,
      search: searchInput.value.trim(),
      page: page,
      limit: 50,
    });
    const response = await fetch(`/api/orders/list/?${params.toString()}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (data.success) {
      allOrders =
        page === 1 ? data.orders || [] : [...allOrders, ...(data.orders || [])];
      currentPage = data.page || page;
      hasMoreOrders = data.has_more || false;
      filterOrders();
      updateStats();
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    showToast("Failed to load orders", "error");
  } finally {
    isLoading = false;
    loadingSkeleton.style.display = "none";
  }
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const csrfToken = getCookie("csrftoken");
    const response = await fetch(`/api/orders/${orderId}/update-status/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken || "",
      },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await response.json();
    if (data.success) {
      const order = allOrders.find((o) => o.id === orderId);
      if (order) order.status = newStatus;
      filterOrders();
      updateStats();
      showToast(
        `Order #${orderId} updated to "${getStatusDisplay(newStatus)}"`,
        "success",
      );
      return true;
    }
    throw new Error(data.message || "Update failed");
  } catch (error) {
    showToast("Failed to update status", "error");
    filterOrders();
    return false;
  }
}

async function fetchStats() {
  try {
    const response = await fetch("/api/orders/stats/");
    const data = await response.json();
    if (data.success) updateStatsFromAPI(data.stats);
  } catch (error) {
    updateStats();
  }
}

function updateStatsFromAPI(stats) {
  if (!statsRow) return;
  const d = [
    {
      value: stats.total_orders || 0,
      label: "Total Orders",
      icon: "bi-receipt",
      class: "total",
    },
    {
      value: stats.active_orders || 0,
      label: "Active Orders",
      icon: "bi-clock-history",
      class: "active",
    },
    {
      value: stats.status_breakdown?.finished?.count || 0,
      label: "Completed",
      icon: "bi-check2-all",
      class: "completed",
    },
    {
      value: stats.status_breakdown?.cancelled?.count || 0,
      label: "Cancelled",
      icon: "bi-x-lg",
      class: "cancelled",
    },
  ];
  statsRow.innerHTML = d
    .map(
      (s) =>
        `<div class="col-xl-3 col-md-6"><div class="stat-card ${s.class} h-100"><div class="stat-icon"><i class="bi ${s.icon}"></i></div><div class="stat-value">${s.value.toLocaleString()}</div><div class="stat-label">${s.label}</div></div></div>`,
    )
    .join("");
}

// Filters - finished orders go to end
function filterOrders() {
  const s = searchInput.value.toLowerCase().trim();
  const st = statusFilter.value;
  filteredOrders = allOrders.filter((o) => {
    if (st !== "all" && o.status !== st) return false;
    if (s) {
      const txt = [
        `#${o.id}`,
        o.customer_name || "",
        o.subscription_number || "",
        o.status || "",
        o.notes || "",
        ...Object.values(o.items || {}).flatMap((i) => [
          i.name || "",
          i.name_ar || "",
          i.category || "",
        ]),
      ]
        .join(" ")
        .toLowerCase();
      if (!txt.includes(s)) return false;
    }
    return true;
  });

  // Sort: finished orders go to the end
  filteredOrders.sort((a, b) => {
    if (a.status === "finished" && b.status !== "finished") return 1;
    if (a.status !== "finished" && b.status === "finished") return -1;
    return 0;
  });

  renderOrders();
}

function refreshOrders() {
  currentPage = 1;
  fetchOrders(1);
}

function loadMoreOrders() {
  if (hasMoreOrders && !isLoading) fetchOrders(currentPage + 1);
}

// Helpers
function getStatusDisplay(status) {
  const m = {
    not_started: "Not Started",
    preparing: "Preparing",
    finished: "Finished",
    cancelled: "Cancelled",
  };
  return m[status] || status;
}
function getStatusIcon(status) {
  const m = {
    not_started: "bi-circle",
    preparing: "bi-hourglass-split",
    finished: "bi-check-circle-fill",
    cancelled: "bi-x-circle-fill",
  };
  return m[status] || "bi-circle";
}
function getStatusClass(status) {
  return `status-${status}`;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString),
    n = new Date();
  const mins = Math.floor((n - d) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  if (mins < 10080) return `${Math.floor(mins / 1440)}d ago`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(a) {
  const n = parseFloat(a);
  return isNaN(n) ? "0.000" : n.toFixed(3);
}

function getInitials(name) {
  if (!name || name === "Guest" || name === "Guest User") return "?";
  const p = name.trim().split(/\s+/);
  return p.length === 1
    ? p[0][0].toUpperCase()
    : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function escapeHtml(t) {
  if (!t) return "";
  const d = document.createElement("div");
  d.textContent = t;
  return d.innerHTML;
}

// Local Stats
function updateStats() {
  if (!statsRow) return;
  const t = allOrders.length;
  const a = allOrders.filter(
    (o) => o.status === "preparing" || o.status === "not_started",
  ).length;
  const c = allOrders.filter((o) => o.status === "finished").length;
  const x = allOrders.filter((o) => o.status === "cancelled").length;
  const d = [
    { value: t, label: "Total Orders", icon: "bi-receipt", class: "total" },
    {
      value: a,
      label: "Active Orders",
      icon: "bi-clock-history",
      class: "active",
    },
    { value: c, label: "Completed", icon: "bi-check2-all", class: "completed" },
    { value: x, label: "Cancelled", icon: "bi-x-lg", class: "cancelled" },
  ];
  statsRow.innerHTML = d
    .map(
      (s) =>
        `<div class="col-xl-3 col-md-6"><div class="stat-card ${s.class} h-100"><div class="stat-icon"><i class="bi ${s.icon}"></i></div><div class="stat-value">${s.value.toLocaleString()}</div><div class="stat-label">${s.label}</div></div></div>`,
    )
    .join("");
}

// Render
function renderOrders() {
  if (!ordersContainer) return;
  if (filteredOrders.length === 0 && !isLoading) {
    ordersContainer.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><p class="empty-state-text">No orders found</p><p class="text-secondary">Try adjusting your filters or search terms.</p></div>`;
    return;
  }

  const html = filteredOrders
    .map((order) => {
      const sc = getStatusClass(order.status);
      const si = getStatusIcon(order.status);
      const sd = getStatusDisplay(order.status);
      const cn = order.customer_name || "Guest";
      const sn = order.subscription_number || "N/A";

      const foodsHTML = Object.entries(order.items || {})
        .map(([fid, item]) => {
          const q = item.quantity || 1;
          const fn = item.name || "Unknown";
          const img =
            item.images && item.images.length > 0 ? item.images[0] : null;
          return `
                <div class="food-item-card" title="${escapeHtml(fn)}">
                    ${
                      img
                        ? `<div class="food-item-img-wrapper"><img src="${escapeHtml(img)}" alt="${escapeHtml(fn)}" class="food-item-img" loading="lazy" onerror="this.parentElement.style.display='none';this.parentElement.nextElementSibling.style.display='flex';"></div><div class="food-item-placeholder" style="display:none;"><i class="bi bi-egg-fried"></i></div>`
                        : `<div class="food-item-placeholder"><i class="bi bi-egg-fried"></i></div>`
                    }
                    <span class="food-quantity-badge">${q}</span>
                    <span class="food-item-name">${escapeHtml(fn)}</span>
                    <div class="food-item-tooltip">${escapeHtml(fn)} ×${q}</div>
                </div>`;
        })
        .join("");

      return `
            <div class="order-card" data-order-id="${order.id}" data-status="${order.status}">
                <div class="order-card-header">
                    <div class="order-id-section">
                        <span class="order-id-badge">#${order.id}</span>
                        <span class="order-date"><i class="bi bi-calendar3"></i>${formatDate(order.date)}</span>
                    </div>
                    <div class="order-user-section">
                        <div class="user-avatar">${getInitials(cn)}</div>
                        <div class="user-info"><span class="user-name">${escapeHtml(cn)}</span><span class="user-subscription"><i class="bi bi-person-badge me-1"></i>${escapeHtml(sn)}</span></div>
                    </div>
                    <span class="status-badge ${sc}"><i class="bi ${si}"></i>${sd}</span>
                </div>
                <div class="order-card-body">
                    <div class="foods-row"><span class="foods-row-label"><i class="bi bi-basket"></i> Items:</span>${foodsHTML}</div>
                    ${order.notes ? `<div class="order-notes mt-3"><i class="bi bi-sticky"></i><span>${escapeHtml(order.notes)}</span></div>` : ""}
                </div>
                <div class="order-card-footer">
                    <div class="order-totals"><span class="total-items"><i class="bi bi-box me-1"></i>${order.total_items || 0} item${(order.total_items || 0) !== 1 ? "s" : ""}</span><span class="total-amount">Total: <span>${formatCurrency(order.total_amount || 0)}</span></span></div>
                    <div class="d-flex align-items-center gap-3">
                        <div class="status-select-wrapper">
                            <select class="status-select ${sc}" onchange="handleStatusChange(${order.id},this.value)" data-order-id="${order.id}">
                                <option value="not_started" ${order.status === "not_started" ? "selected" : ""}>Not Started</option>
                                <option value="preparing" ${order.status === "preparing" ? "selected" : ""}>Preparing</option>
                                <option value="finished" ${order.status === "finished" ? "selected" : ""}>Finished</option>
                                <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>Cancelled</option>
                            </select>
                            <span class="status-select-arrow"><i class="bi bi-chevron-down"></i></span>
                        </div>
                        <button class="btn-update-status" onclick="handleUpdateClick(${order.id})"><i class="bi bi-arrow-repeat me-1"></i> Update</button>
                    </div>
                </div>
            </div>`;
    })
    .join("");

  ordersContainer.innerHTML =
    html +
    (hasMoreOrders
      ? `<div class="text-center my-4"><button class="btn btn-outline-primary rounded-pill px-4" onclick="loadMoreOrders()"><i class="bi bi-arrow-down-circle me-2"></i>Load More</button></div>`
      : "");
}

// Events
function handleStatusChange(orderId, newStatus) {
  const sel = document.querySelector(`select[data-order-id="${orderId}"]`);
  if (!sel) return;
  sel.classList.remove("not_started", "preparing", "finished", "cancelled");
  sel.classList.add(newStatus);
  const card = sel.closest(".order-card");
  if (card) {
    card.setAttribute("data-status", newStatus);
    const badge = card.querySelector(".status-badge");
    if (badge) {
      badge.className = `status-badge status-${newStatus}`;
      badge.innerHTML = `<i class="bi ${getStatusIcon(newStatus)}"></i>${getStatusDisplay(newStatus)}`;
    }
  }
}

async function handleUpdateClick(orderId) {
  const sel = document.querySelector(`select[data-order-id="${orderId}"]`);
  if (!sel) return;
  const ns = sel.value;
  const co = allOrders.find((o) => o.id === orderId);
  if (co && co.status === ns) {
    showToast(`Already "${getStatusDisplay(ns)}"`, "info", 2000);
    return;
  }
  const btn = sel.closest(".order-card")?.querySelector(".btn-update-status");
  if (!btn) return;
  const orig = btn.innerHTML;
  btn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-1"></span> Updating...';
  btn.disabled = true;
  sel.disabled = true;
  const ok = await updateOrderStatus(orderId, ns);
  btn.innerHTML = orig;
  btn.disabled = false;
  sel.disabled = false;
  if (!ok && co) {
    sel.value = co.status;
    handleStatusChange(orderId, co.status);
  }
}

// Search/Filter listeners
let searchTimeout;
searchInput?.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage = 1;
    fetchOrders(1);
  }, 500);
});
statusFilter?.addEventListener("change", () => {
  currentPage = 1;
  fetchOrders(1);
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "r" && !e.shiftKey) {
    e.preventDefault();
    refreshOrders();
  }
  if (e.ctrlKey && e.key === "k") {
    e.preventDefault();
    searchInput?.focus();
  }
  if (e.key === "Escape" && document.activeElement === searchInput) {
    searchInput.value = "";
    searchInput.blur();
    currentPage = 1;
    fetchOrders(1);
  }
});

// Infinite scroll
let scrollTimeout;
window.addEventListener("scroll", () => {
  if (isLoading || !hasMoreOrders) return;
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 300
    )
      loadMoreOrders();
  }, 200);
});

// Init
function init() {
  fetchStats();
  fetchOrders(1);
  setInterval(fetchStats, 60000);
  setInterval(() => {
    if (currentPage === 1 && !isLoading) fetchOrders(1);
  }, 30000);
}
document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", init)
  : init();
