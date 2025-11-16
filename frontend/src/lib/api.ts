const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const api = {
  auth: {
    login: async (accountId: string) => {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    me: async () => {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
  orders: {
    list: async () => {
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    get: async (id: string) => {
      const res = await fetch(`${API_URL}/api/orders/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    confirm: async (id: string, txHash: string) => {
      const res = await fetch(`${API_URL}/api/orders/${id}/confirm`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ transactionHash: txHash }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    updateStatus: async (id: string, status: string, trackingNumber?: string) => {
      const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, trackingNumber }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
  seller: {
    stats: async () => {
      const res = await fetch(`${API_URL}/api/seller/stats`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    orders: async () => {
      const res = await fetch(`${API_URL}/api/seller/orders`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
};
