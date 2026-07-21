// utils/api.ts

export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // 1. Grab the current access token
  const accessToken = localStorage.getItem("access_token");
  
  // 2. Set up headers (merging with any passed options)
  const headers = {
    "Content-Type": "application/json",
    ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  let response = await fetch(url, { ...options, headers });

  // 3. If unauthorized (expired token), try to refresh it
  if (response.status === 401) {
    console.log("Access token expired. Attempting silent refresh...");
    
    const refreshed = await refreshAccessToken();
    
    if (refreshed) {
      // Retry the original request with the brand new access token
      const newAccessToken = localStorage.getItem("access_token");
      const retriedHeaders = {
        ...headers,
        "Authorization": `Bearer ${newAccessToken}`,
      };
      
      response = await fetch(url, { ...options, headers: retriedHeaders });
    } else {
      // Refresh failed (user session expired or refresh token invalid)
      // Redirect to login or clear token
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
  }

  return response;
};

// Helper to hit your Django token refresh endpoint
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await fetch("http://localhost:8000/auth/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // CRITICAL: Tells the browser to send the HttpOnly 'refresh_token' cookie to Django
      credentials: "include", 
    });

    if (response.ok) {
      const data = await response.json()
      console.log(data)
      localStorage.setItem("access_token", data.access_token); // Save the new access token
      return true;
    }
  } catch (err) {
    console.error("Token refresh failed:", err);
  }
  return false;
};