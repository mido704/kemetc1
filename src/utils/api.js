/**
 * KEMET SOCIAL - API Client
 * Connects web frontend to Flask REST API on Railway
 * Falls back to demo mode when API is offline
 */

// â”€â”€ IMPORTANT: Railway backend URL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Priority: env variable â†’ Railway production â†’ localhost fallback
const API_BASE =
  import.meta.env.VITE_API_URL ||
  'https://kemetc1-production.up.railway.app/api';

// â”€â”€ Token management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Core fetch wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // Auto-clear token on 401 (expired/invalid) â€” except logout itself
    if (res.status === 401 && !path.includes('/auth/logout')) {
      storage.clear();
    }

    const data = await res.json();
    return { status: res.status, ...data };
  } catch (e) {
    return { ok: false, error: 'ط§ظ„ط®ط§ط¯ظ… ط؛ظٹط± ظ…طھط§ط­ ط­ط§ظ„ظٹط§ظ‹ - ظˆط¶ط¹ طھط¬ط±ظٹط¨ظٹ', offline: true };
  }
}

// â”€â”€ AUTH API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    // Always clear local storage first â€” don't wait for API
    // 401 on logout is harmless (token already expired/invalid)
    storage.clear();
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
    return { ok: true };
  },

  async me() {
    const r = await apiFetch('/auth/me');
    if (r.ok && r.data) storage.setUser(r.data);
    return r;
  },
};

// â”€â”€ USERS API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const usersAPI = {
  getUser: (id) => apiFetch(`/users/${id}`),

  // Supports avatar_url, cover_url, name, nickname, bio
  updateProfile: (data) => apiFetch('/users/profile', { method: 'PUT', body: data }),

  follow: (id) => apiFetch(`/users/${id}/follow`, { method: 'POST' }),
};

// â”€â”€ POSTS API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const postsAPI = {
  getFeed: (limit = 20, offset = 0) =>
    apiFetch(`/posts?limit=${limit}&offset=${offset}`),

  // data can include: { content, language, media_url, media_type }
  // media_url and media_type come from Cloudinary upload in the frontend
  createPost: (data) => apiFetch('/posts', { method: 'POST', body: data }),

  deletePost: (id) => apiFetch(`/posts/${id}`, { method: 'DELETE' }),

  likePost: (id) => apiFetch(`/posts/${id}/like`, { method: 'POST' }),

  getComments: (id) => apiFetch(`/posts/${id}/comments`),

  addComment: (id, content, parentId = null, imageUrl = "") =>
    apiFetch(`/posts/${id}/comments`, {
      method: 'POST',
      body: { content, parent_id: parentId, image_url: imageUrl },
    }),
};

// â”€â”€ STORE API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const storeAPI = {
  getCategories: () => apiFetch('/store/categories'),

  getTours: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/store/tours${q ? '?' + q : ''}`);
  },

  getTour: (id) => apiFetch(`/store/tours/${id}`),

  getNicknames: () => apiFetch('/store/nicknames'),
};

// â”€â”€ BOOKINGS API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const bookingsAPI = {
  getMyBookings: () => apiFetch('/bookings'),

  createBooking: (data) => apiFetch('/bookings', { method: 'POST', body: data }),

  payBooking: (id, method, ref = '') =>
    apiFetch(`/bookings/${id}/pay`, {
      method: 'POST',
      body: { payment_method: method, payment_ref: ref },
    }),
};

// â”€â”€ MESSAGES API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const messagesAPI = {
  getInbox: () => apiFetch('/messages/inbox'),

  getConversation: (userId, limit = 50) =>
    apiFetch(`/messages/${userId}?limit=${limit}`),

  sendMessage: (userId, content) =>
    apiFetch(`/messages/${userId}`, { method: 'POST', body: { content } }),
};

// â”€â”€ NOTIFICATIONS API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const notificationsAPI = {
  get: (limit = 20) => apiFetch(`/notifications?limit=${limit}`),
  markRead: () => apiFetch('/notifications/read', { method: 'POST' }),
};

// â”€â”€ REVIEWS API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const reviewsAPI = {
  add: (tourId, rating, comment, bookingId = null) =>
    apiFetch(`/reviews/${tourId}`, {
      method: 'POST',
      body: { rating, comment, booking_id: bookingId },
    }),
};

// â”€â”€ STATS & HEALTH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const statsAPI = {
  get: () => apiFetch('/stats'),
};

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
