import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// Automatic access-token refresh
// ============================================================

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // Only handle 401 responses once
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Use plain axios for the refresh request.
        // This prevents an infinite refresh loop.
        await axios.post(
          "http://127.0.0.1:8000/auth/refresh/",
          {},
          {
            withCredentials: true,
          }
        );

        // Django has now issued a new access_token cookie.
        // Retry the original request.
        return api(originalRequest);

      } catch (refreshError) {
        console.error(
          "Session expired. Please log in again."
        );

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================
// Generic API helper
// ============================================================

export const apiFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  const method = (
    options.method || "GET"
  ).toLowerCase() as
    | "get"
    | "post"
    | "put"
    | "delete"
    | "patch";

  const data = options.body
    ? JSON.parse(options.body as string)
    : undefined;

  const endpoint = url
    .replace("http://127.0.0.1:8000/", "")
    .replace("http://localhost:8000/", "");

  return api.request({
    url: endpoint,
    method,
    data,
  });
};

export default api;