/**
 * KEMET SOCIAL - API Client
 * Connects web frontend to Flask REST API
 * Falls back to localStorage demo mode when API is offline
 */

const API_BASE = typeof window !== 'undefined' && window.KEMET_API_URL
  ? window.KEMET_API_URL
  : 'http://localhost:5000/api';

// ── Token management ─────────────────────────────────────
const TOKEN_KEY = 'kemet_token';
const USER_KEY  = 'kemet_user';

export const storage = {
  getToken: () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  setToken: (t) => {
    try { localStorage.setItem(TOKEN_KEY, t); } catch {}
  },
  getUser: () => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  },
  setUser: (u) => {
    try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch {}
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  },
};

// ── Core fetch wrapper ────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = storage.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json();
    return { status: res.status, ...data };
  } catch (e) {
    // API offline → return demo error
    return { ok: false, error: 'الخادم غير متاح حالياً - وضع تجريبي', offline: true };
  }
}

// ── AUTH API ─────────────────────────────────────────────
export const authAPI = {
  async register(payload) {
    const r = await apiFetch('/auth/register', { method: 'POST', body: payload });
    if (r.ok && r.data) {
      storage.setToken(r.data.token);
      storage.setUser(r.data.user);
    }
    return r;
  },

  async login(email, password, platform = 'web') {
    const r = await apiFetch('/auth/login', { method: 'POST', body: { email, password, platform } });
    if (r.ok && r.data) {
      storage.setToken(r.data.token);
      storage.setUser(r.data.user);
    }
    return r;
  },

  async logout() {
    await apiFetch('/auth/logout', { method: 'POST' });
    storage.clear();
    return { ok: true };
  },

  async me() {
    const r = await apiFetch('/auth/me');
    if (r.ok && r.data) storage.setUser(r.data);
    return r;
  },
};

// ── USERS API ─────────────────────────────────────────────
export const usersAPI = {
  getUser: (id) => apiFetch(`/users/${id}`),
  updateProfile: (data) => apiFetch('/users/profile', { method: 'PUT', body: data }),
  follow: (id) => apiFetch(`/users/${id}/follow`, { method: 'POST' }),
};

// ── POSTS API ─────────────────────────────────────────────
export const postsAPI = {
  getFeed: (limit = 20, offset = 0) => apiFetch(`/posts?limit=${limit}&offset=${offset}`),
  createPost: (data) => apiFetch('/posts', { method: 'POST', body: data }),
  deletePost: (id) => apiFetch(`/posts/${id}`, { method: 'DELETE' }),
  likePost: (id) => apiFetch(`/posts/${id}/like`, { method: 'POST' }),
  getComments: (id) => apiFetch(`/posts/${id}/comments`),
  addComment: (id, content, parentId = null) =>
    apiFetch(`/posts/${id}/comments`, { method: 'POST', body: { content, parent_id: parentId } }),
};

// ── STORE API ─────────────────────────────────────────────
export const storeAPI = {
  getCategories: () => apiFetch('/store/categories'),
  getTours: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/store/tours${q ? '?' + q : ''}`);
  },
  getTour: (id) => apiFetch(`/store/tours/${id}`),
  getNicknames: () => apiFetch('/store/nicknames'),
};

// ── BOOKINGS API ──────────────────────────────────────────
export const bookingsAPI = {
  getMyBookings: () => apiFetch('/bookings'),
  createBooking: (data) => apiFetch('/bookings', { method: 'POST', body: data }),
  payBooking: (id, method, ref = '') =>
    apiFetch(`/bookings/${id}/pay`, { method: 'POST', body: { payment_method: method, payment_ref: ref } }),
};

// ── MESSAGES API ──────────────────────────────────────────
export const messagesAPI = {
  getInbox: () => apiFetch('/messages/inbox'),
  getConversation: (userId, limit = 50) => apiFetch(`/messages/${userId}?limit=${limit}`),
  sendMessage: (userId, content) =>
    apiFetch(`/messages/${userId}`, { method: 'POST', body: { content } }),
};

// ── NOTIFICATIONS API ─────────────────────────────────────
export const notificationsAPI = {
  get: (limit = 20) => apiFetch(`/notifications?limit=${limit}`),
  markRead: () => apiFetch('/notifications/read', { method: 'POST' }),
};

// ── REVIEWS API ───────────────────────────────────────────
export const reviewsAPI = {
  add: (tourId, rating, comment, bookingId = null) =>
    apiFetch(`/reviews/${tourId}`, { method: 'POST', body: { rating, comment, booking_id: bookingId } }),
};

// ── STATS ─────────────────────────────────────────────────
export const statsAPI = {
  get: () => apiFetch('/stats'),
};

// ── Health check ──────────────────────────────────────────
export const checkHealth = () => apiFetch('/health');

export default {
  auth: authAPI,
  users: usersAPI,
  posts: postsAPI,
  store: storeAPI,
  bookings: bookingsAPI,
  messages: messagesAPI,
  notifications: notificationsAPI,
  reviews: reviewsAPI,
  stats: statsAPI,
  storage,
  checkHealth,
};
