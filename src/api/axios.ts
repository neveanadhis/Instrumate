import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/auth/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/auth/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

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

function extractAccessToken(data: TokenResponse) {
  return data.access_token ?? data.access ?? data.tokens?.access_token ?? data.tokens?.access;
}

function extractRefreshToken(data: TokenResponse) {
  return data.refresh_token ?? data.refresh ?? data.tokens?.refresh_token ?? data.tokens?.refresh;
}

export function storeAuthTokens(data: TokenResponse) {
  const accessToken = extractAccessToken(data);
  const refreshToken = extractRefreshToken(data);

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const candidates = refreshToken
    ? [
        { refresh: refreshToken },
        { refresh_token: refreshToken },
        {},
      ]
    : [{}, { refresh: '' }, { refresh_token: '' }];

  const endpoints = ['refresh/', 'token/refresh/'];

  for (const endpoint of endpoints) {
    for (const payload of candidates) {
      try {
        const response = await refreshClient.post<TokenResponse>(endpoint, payload);
        const accessToken = extractAccessToken(response.data);
        const nextRefreshToken = extractRefreshToken(response.data);

        if (accessToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        }

        if (nextRefreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);
        }

        return accessToken;
      } catch (error) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;

        if (status && ![400, 401, 404, 405, 422].includes(status)) {
          throw error;
        }
      }
    }
  }

  return null;
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
      const newAccessToken = await refreshAccessToken();

      if (!newAccessToken) {
        clearAuthTokens();
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearAuthTokens();
      return Promise.reject(refreshError);
    }
  }
);

export default api;