const TOKEN_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getAccessToken();
}

export function logout() {
  clearAccessToken();
  localStorage.removeItem(REFRESH_KEY);
}