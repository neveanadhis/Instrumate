import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/auth/refresh/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  access?: string;
  refresh?: string;
  tokens?: {
    access?: string;
    refresh?: string;
    access_token?: string;
    refresh_token?: string;
  };
};

export function storeAuthTokens(_: TokenResponse) {
  // Cookies are set by the backend via Set-Cookie, so nothing is stored in JS.
}

export function clearAuthTokens() {
  // Cookies should be cleared by the backend on logout/expiry.
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config;
});

async function refreshAccessToken() {
  const endpoints = ['refresh/', 'token/refresh/'];

  for (const endpoint of endpoints) {
    try {
      await refreshClient.post<TokenResponse>(endpoint, {});
      return true;
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;

      if (status && ![400, 401, 404, 405, 422].includes(status)) {
        throw error;
      }
    }
  }

  return false;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshed = await refreshAccessToken();

      if (!refreshed) {
        clearAuthTokens();
        return Promise.reject(error);
      }

      return api(originalRequest);
    } catch (refreshError) {
      clearAuthTokens();
      return Promise.reject(refreshError);
    }
  }
);

export default api;