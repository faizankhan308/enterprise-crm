const API_BASE = "/api";
export function getAuthToken() {
  return localStorage.getItem("crm_token");
}
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("crm_token", token);
  } else {
    localStorage.removeItem("crm_token");
  }
}
export function getUserData() {
  const data = localStorage.getItem("crm_user");
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}
export function setUserData(user) {
  if (user) {
    localStorage.setItem("crm_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("crm_user");
  }
}
async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...token ? { "Authorization": `Bearer ${token}` } : {},
    ...options.headers || {}
  };
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("text/csv")) {
    return response.text();
  }
  return response.json();
}
export const api = {
  get: (endpoint) => request(endpoint, { method: "GET" }),
  post: (endpoint, body) => request(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : void 0
  }),
  put: (endpoint, body) => request(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : void 0
  }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" })
};
