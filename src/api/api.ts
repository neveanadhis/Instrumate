// utils/api.ts

export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  delete headers["Authorization"];

  let response = await fetch(url, { ...options, headers, credentials: "include" });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    
    if (refreshed) {
      response = await fetch(url, { ...options, headers, credentials: "include" });
    }
  }


  return response;
};

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await fetch("http://127.0.0.1:8000/auth/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", 
    });
    if (!response.ok) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Token refresh network error:", error);
  }
  return false;
};

export const setAccessTokenInMemory = (token: string) => {
  void token;
};

export const clearAccessTokenInMemory = () => {
};
