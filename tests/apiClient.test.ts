import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, clearToken, downloadBlob, getToken, setToken } from '../src/api/client'

class MemoryStorage {
  private values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  clear() {
    this.values.clear()
  }
}

const locationReplace = vi.fn()

function mockJsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

describe('api client contracts', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage())
    vi.stubGlobal('window', {
      location: {
        pathname: '/',
        replace: locationReplace,
      },
    })
    vi.stubGlobal('fetch', vi.fn())
    locationReplace.mockClear()
    clearToken()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends raw JWT in Authorization without Bearer', async () => {
    setToken('jwt-token')
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce(mockJsonResponse({ ok: true }))

    await api.get('/auth/me')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/me',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'jwt-token' }),
      })
    )
    expect(fetchMock.mock.calls[0][1]?.headers).not.toMatchObject({
      Authorization: 'Bearer jwt-token',
    })
  })

  it('does not set JSON content type for FormData uploads', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce(mockJsonResponse({ id: 'doc-1' }))

    await api.upload('/upload', new FormData())

    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>
    expect(headers['Content-Type']).toBeUndefined()
  })

  it('clears token on 401', async () => {
    setToken('jwt-token')
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 401 }))

    await expect(api.get('/auth/me')).rejects.toMatchObject({ status: 401 })

    expect(getToken()).toBe(null)
  })

  it('throws ApiError with status on non-ok responses', async () => {
    setToken('jwt-token')
    vi.mocked(fetch).mockResolvedValueOnce(
      mockJsonResponse({ detail: 'Not found' }, { status: 404 })
    )

    await expect(api.get('/missing')).rejects.toMatchObject({ status: 404 })
  })

  it('parses RFC 5987 filenames for blob downloads', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('content', {
        status: 200,
        headers: {
          'Content-Disposition':
            "attachment; filename*=UTF-8''%D0%94%D0%BE%D0%B3%D0%BE%D0%B2%D0%BE%D1%80.docx",
        },
      })
    )

    const result = await downloadBlob('/export')

    expect(result.filename).toBe('Договор.docx')
    expect(await result.blob.text()).toBe('content')
  })
})
