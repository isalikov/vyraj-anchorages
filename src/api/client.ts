const BASE = '/api'
const TOKEN_KEY = 'token'
let appReady = false

/**
 * Mark the app as fully booted. Before this point we never hard-redirect on 401,
 * so the very first /auth/me probe during startup can fail quietly.
 */
export function setAppReady() {
  appReady = true
}

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/** Parse a FastAPI-style error body and return its `detail` string if present. */
export function parseErrorDetail(message: string): string | null {
  try {
    const body = JSON.parse(message)
    if (typeof body?.detail === 'string') return body.detail
    if (typeof body?.detail?.message === 'string') return body.detail.message
  } catch {
    /* not JSON */
  }
  return null
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const isFormData = init?.body instanceof FormData
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(init?.headers as Record<string, string>),
  }

  if (token) {
    // The backend expects the raw JWT — no "Bearer " prefix.
    headers['Authorization'] = token
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
  })

  if (res.status === 401) {
    clearToken()
    if (appReady && window.location.pathname !== '/login') {
      window.location.replace('/login')
    }
    throw new ApiError(401, 'Unauthorized')
  }

  if (!res.ok) {
    const text = await res.text()
    throw new ApiError(res.status, text)
  }

  if (res.status === 204) return undefined as T

  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
  upload: <T>(path: string, body: FormData) =>
    request<T>(path, {
      method: 'POST',
      body,
    }),
}

async function downloadBlob(
  path: string,
  init?: RequestInit
): Promise<{ blob: Blob; filename: string }> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = token
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers })

  if (res.status === 401) {
    clearToken()
    if (appReady && window.location.pathname !== '/login') {
      window.location.replace('/login')
    }
    throw new ApiError(401, 'Unauthorized')
  }
  if (!res.ok) {
    const text = await res.text()
    throw new ApiError(res.status, text)
  }

  const disposition = res.headers.get('Content-Disposition') ?? ''
  // Prefer filename* (RFC 5987, UTF-8 encoded) over plain filename
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;\s]+)/)
  const plainMatch = disposition.match(/filename="?([^";]+)"?/)
  const rawFilename = utf8Match?.[1] ?? plainMatch?.[1]
  const filename = rawFilename ? decodeURIComponent(rawFilename) : 'document'

  return { blob: await res.blob(), filename }
}

export { ApiError, TOKEN_KEY, downloadBlob }
