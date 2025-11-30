import { AuthData, Order } from '../types';

const API_BASE_URL = 'https://apidelibery.onrender.com';

async function fetchApi<T,>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
}

// FIX: Explicitly type the return value of the login function as Promise<AuthData>. This ensures that the data consumed in `Login.tsx` is correctly typed, resolving the assignment error.
export const login = (email: string, password: string): Promise<AuthData> => {
  return fetchApi<AuthData>('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
};

export const createOrder = (order: Order, token: string) => {
  return fetchApi('/pedido', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(order),
  });
};

export const getOrders = (token: string) => {
  return fetchApi('/pedidos', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
};

export const getMetrics = (token: string) => {
  return fetchApi('/metricas', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
};

export const getDebugCredentials = (token: string) => {
  return fetchApi('/debug-credenciais', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
};
