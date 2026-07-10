import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  setAccessToken,
  setRefreshToken,
} from "@/lib/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

// Single-flight refresh: concurrent requests share one in-flight refresh call.
let refreshPromise: Promise<string | null> | null = null;

async function requestRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken || isTokenExpired(refreshToken)) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data?.access) {
      setAccessToken(data.access);
      if (data.refresh) setRefreshToken(data.refresh);
      return data.access as string;
    }
    return null;
  } catch {
    return null;
  }
}

function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = requestRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function getValidToken(): Promise<string | null> {
  const token = getAccessToken();
  if (!token) return null;

  // Access expired: try to renew it silently with the refresh token.
  if (isTokenExpired(token)) {
    return refreshAccessToken();
  }

  return token;
}

async function authedFetch(
  path: string,
  init: RequestInit,
  retry = true
): Promise<Response> {
  const isAuthPath = path.startsWith("/auth/");
  const token = isAuthPath ? null : await getValidToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // On an expired/invalid access token, try a single silent refresh + retry.
  if (res.status === 401 && retry && !isAuthPath) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return authedFetch(path, init, false);
    }
    clearAuth();
    redirectToLogin();
  }

  return res;
}

async function handleResponse<T>(res: Response, method: string, path: string): Promise<T> {
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Sesión expirada");
    }
    const text = await res.text();
    throw new Error(text || `${method} ${path} failed (${res.status})`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await authedFetch(path, { method: "GET" });
  return handleResponse<T>(res, "GET", path);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await authedFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, "POST", path);
}

export async function apiDelete(path: string): Promise<void> {
  const res = await authedFetch(path, { method: "DELETE" });
  return handleResponse<void>(res, "DELETE", path);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await authedFetch(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, "PUT", path);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await authedFetch(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, "PATCH", path);
}
