const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const TOKEN_KEY = 'schedulr_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

interface RequestOptions extends RequestInit {
  data?: any;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.data !== undefined) {
    config.body = JSON.stringify(options.data);
  }

  try {
    const res = await fetch(url, config);

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}`;
      try {
        const errorJson = await res.json();
        errorMsg = errorJson.message || errorMsg;
      } catch {
        // Fallback to status text
      }
      throw new Error(errorMsg);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    console.warn(`[API Request Error] ${options.method || 'GET'} ${url}:`, err.message);
    throw err;
  }
}

export const api = {
  get: <T>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, data?: any, options?: RequestOptions) => request<T>(url, { ...options, method: 'POST', data }),
  put: <T>(url: string, data?: any, options?: RequestOptions) => request<T>(url, { ...options, method: 'PUT', data }),
  patch: <T>(url: string, data?: any, options?: RequestOptions) => request<T>(url, { ...options, method: 'PATCH', data }),
  delete: <T>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: 'DELETE' }),
};
