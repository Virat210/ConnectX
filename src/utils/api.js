const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('connectx_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Network request failed');
    error.code = data.code || 'HTTP_ERROR';
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

export const authApi = {
  async register(fullName, email, password) {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    });
    if (res.data?.tokens?.accessToken) {
      localStorage.setItem('connectx_token', res.data.tokens.accessToken);
    }
    return res.data;
  },

  async login(email, password) {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.data?.tokens?.accessToken) {
      localStorage.setItem('connectx_token', res.data.tokens.accessToken);
    }
    return res.data;
  },

  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('connectx_token');
    }
  },

  async getMe() {
    const res = await request('/api/auth/me');
    return res.data?.user;
  },

  async updateProfile(profileData) {
    const res = await request('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
    return res.data?.user;
  },

  async updatePassword(currentPassword, newPassword) {
    return request('/api/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async getNotifications() {
    const res = await request('/api/users/me/notifications');
    return res.data?.notifications || [];
  },

  async markNotificationsRead() {
    return request('/api/users/me/notifications/read', {
      method: 'PATCH',
    });
  },

  async deleteAccount() {
    return request('/api/users/me', {
      method: 'DELETE',
    });
  },
};

export const meetingApi = {
  async create(data) {
    const res = await request('/api/meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data?.meeting;
  },

  async get(meetingId) {
    const res = await request(`/api/meetings/${meetingId}`);
    return res.data?.meeting;
  },

  async list() {
    const res = await request('/api/meetings');
    return res.data;
  },

  async end(meetingId) {
    return request(`/api/meetings/${meetingId}/end`, {
      method: 'POST',
    });
  },
};

export const supportApi = {
  async submit(data) {
    return request('/api/support', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const adminApi = {
  async getUsers() {
    const res = await request('/api/admin/users');
    return res.data?.users || [];
  },

  async toggleStatus(userId) {
    const res = await request(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
    });
    return res.data;
  },

  async getAnalytics() {
    const res = await request('/api/admin/analytics');
    return res.data;
  },
};

export const webrtcApi = {
  async getIceServers() {
    try {
      const res = await request('/api/webrtc/ice-servers');
      return res.data?.iceServers || null;
    } catch (e) {
      console.warn('Could not fetch dynamic ICE servers, using fallback STUN:', e.message);
      return null;
    }
  },
};

