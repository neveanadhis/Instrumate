import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to catch 401s and attempt cookie-based refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Handshake: refresh the cookie session via POST /auth/refresh/
        await axios.post(
          'http://127.0.0.1:8000/auth/refresh/',
          {},
          { withCredentials: true }
        );

        // Retry the original request now that cookies are refreshed
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Session expired. Please log in again.');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Add at the bottom of src/api/axios.ts
export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const method = (options.method || 'GET').toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
  const data = options.body ? JSON.parse(options.body as string) : undefined;
  
  // Clean relative path if an absolute URL is passed
  const endpoint = url.replace('http://127.0.0.1:8000/', '').replace('http://localhost:8000/', '');

  return api.request({
    url: endpoint,
    method,
    data,
  });
};