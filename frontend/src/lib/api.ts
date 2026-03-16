import { clearAuth, getAccessToken, isTokenExpired } from "@/lib/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

function getValidToken() {
  const token = getAccessToken();
  if (!token) return null;

  if (isTokenExpired(token)) {
    clearAuth();
    redirectToLogin();
    return null;
  }

  return token;
}

async function handleResponse<T>(res: Response, method: string, path: string): Promise<T> {
  if (res.status === 401) {
    clearAuth();
    redirectToLogin();
    throw new Error("Sesión expirada");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${method} ${path} failed (${res.status})`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const token = getValidToken();

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return handleResponse<T>(res, "GET", path);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const token = getValidToken();

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(res, "POST", path);
}

export async function apiDelete(path: string): Promise<void> {
  const token = getValidToken();

  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return handleResponse<void>(res, "DELETE", path);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const token = getValidToken();

  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(res, "PUT", path);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const token = getValidToken();

  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(res, "PATCH", path);
}