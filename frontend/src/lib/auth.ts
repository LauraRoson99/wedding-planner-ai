const TOKEN_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const WEDDING_KEY = "weddingId";

type JwtPayload = {
  exp?: number;
  [key: string]: unknown;
};

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token: string) {
  localStorage.setItem(REFRESH_KEY, token);
}

export function getWeddingId() {
  return localStorage.getItem(WEDDING_KEY);
}

export function setWeddingId(weddingId: string) {
  localStorage.setItem(WEDDING_KEY, weddingId);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_KEY);
}

export function clearWeddingId() {
  localStorage.removeItem(WEDDING_KEY);
}

export function clearAuth() {
  clearAccessToken();
  clearRefreshToken();
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string) {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

export function isLoggedIn() {
  const token = getAccessToken();
  if (!token) return false;

  if (isTokenExpired(token)) {
    clearAuth();
    return false;
  }

  return true;
}

export function logout() {
  clearAuth();
}