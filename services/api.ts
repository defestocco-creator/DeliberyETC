
import { Order } from '../types';

const API_BASE_URL = 'https://apidelibery.onrender.com';

async function fetchApi<T,>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
}

export const login = (email: string, password: string) => {
  return fetchApi('/login', {
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
