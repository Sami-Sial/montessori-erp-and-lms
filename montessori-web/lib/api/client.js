/**
 * API client — thin fetch wrapper with:
 *  - Base URL from NEXT_PUBLIC_API_URL
 *  - Automatic Authorization header injection
 *  - Token refresh (silent re-try on 401)
 *  - Consistent error shape
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

let _store = null; // lazily injected to avoid circular deps

/** Call once from Providers to wire Redux store into the client */
export const injectStore = (store) => { _store = store; };

const getTokens = () => {
  if (!_store) return {};
  const { accessToken, refreshToken } = _store.getState().auth;
  return { accessToken, refreshToken };
};

const setTokens = (accessToken, refreshToken, user) => {
  if (!_store) return;
  const { updateTokens } = require('../../store/authSlice');
  _store.dispatch(updateTokens({ accessToken, refreshToken, user }));
};

const clearAuth = () => {
  if (!_store) return;
  const { clearAuth: clear } = require('../../store/authSlice');
  _store.dispatch(clear());
};

// Track whether a refresh is already in progress to avoid parallel refreshes
let refreshPromise = null;

const silentRefresh = async () => {
  if (refreshPromise) return refreshPromise;

  const { refreshToken } = getTokens();
  if (!refreshToken) { clearAuth(); throw new Error('No refresh token'); }

  refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) { clearAuth(); throw new Error('Refresh failed'); }
      const data = await res.json();
      setTokens(data.accessToken, data.refreshToken, data.user);
      return data.accessToken;
    })
    .finally(() => { refreshPromise = null; });

  return refreshPromise;
};

/**
 * Core fetch wrapper.
 * @param {string} path - e.g. '/students'
 * @param {RequestInit & { params?: Record<string,any> }} options
 */
export async function apiRequest(path, options = {}) {
  const { params, ...fetchOptions } = options;

  // Build URL with query params
  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => [k, String(v)])
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const { accessToken } = getTokens();

  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...fetchOptions.headers,
  };

  let response = await fetch(url, { ...fetchOptions, headers });

  // Silent token refresh on 401
  if (response.status === 401) {
    try {
      const newToken = await silentRefresh();
      response = await fetch(url, {
        ...fetchOptions,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      });
    } catch {
      clearAuth();
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  // Parse response
  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const err = new Error(data?.error?.message ?? `Request failed: ${response.status}`);
    err.code = data?.error?.code ?? 'UNKNOWN';
    err.details = data?.error?.details ?? null;
    err.status = response.status;
    throw err;
  }

  return data;
}

// Convenience methods
export const api = {
  get:    (path, params, opts)    => apiRequest(path, { method: 'GET',    params,              ...opts }),
  post:   (path, body, opts)      => apiRequest(path, { method: 'POST',   body: JSON.stringify(body),   ...opts }),
  put:    (path, body, opts)      => apiRequest(path, { method: 'PUT',    body: JSON.stringify(body),   ...opts }),
  patch:  (path, body, opts)      => apiRequest(path, { method: 'PATCH',  body: JSON.stringify(body),   ...opts }),
  delete: (path, opts)            => apiRequest(path, { method: 'DELETE',                        ...opts }),
};
