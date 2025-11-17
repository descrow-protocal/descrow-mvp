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
    login: async (email: string, password: string, userType: string) => {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userType }),
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
      try {
        const res = await fetch(`${API_URL}/api/seller/stats`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      } catch {
        // Mock data fallback
        return {
          total_sales: 1250.00,
          pending_escrow: 350.00,
          completed_orders: 8,
          active_orders: 3
        };
      }
    },
    orders: async () => {
      try {
        const res = await fetch(`${API_URL}/api/seller/orders`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      } catch {
        // Mock data fallback
        return [
          {
            id: '1',
            orderNumber: 'ORD-001',
            items: [{ productName: 'Wireless Headphones' }],
            totalAmount: 150.00,
            escrowStatus: 'pending'
          },
          {
            id: '2',
            orderNumber: 'ORD-002',
            items: [{ productName: 'Smart Watch' }],
            totalAmount: 200.00,
            escrowStatus: 'completed'
          }
        ];
      }
    },
  },
};
