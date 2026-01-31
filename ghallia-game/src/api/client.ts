/**
 * API Client
 * Handles communication with the Infinity game server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Token storage
const TOKEN_KEY = 'infinity_auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface SaveInfo {
  hasSave: boolean;
  savedAt?: string;
  version?: number;
}

export interface CloudSave {
  gameState: any;
  savedAt: string;
  version: number;
}

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Request failed' };
    }

    return { data };
  } catch (err) {
    console.error('API request failed:', err);
    return { error: 'Network error - server may be offline' };
  }
}

// Auth API
export const authApi = {
  async register(username: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  async login(username: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return apiFetch<{ user: User }>('/auth/me');
  },

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return apiFetch<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });
  },
};

// Save API
export const saveApi = {
  async getSaveInfo(): Promise<ApiResponse<SaveInfo>> {
    return apiFetch<SaveInfo>('/save/info');
  },

  async loadSave(): Promise<ApiResponse<CloudSave>> {
    return apiFetch<CloudSave>('/save');
  },

  async saveTo(gameState: any): Promise<ApiResponse<{ savedAt: string; version: number }>> {
    return apiFetch('/save', {
      method: 'POST',
      body: JSON.stringify({ gameState }),
    });
  },

  async deleteSave(): Promise<ApiResponse<{ message: string }>> {
    return apiFetch('/save', {
      method: 'DELETE',
    });
  },
};

// Health check
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
