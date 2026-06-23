import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../src/stores/auth'
import { setToken, clearToken } from '../src/api/client'
import { authApi } from '../src/api/auth'

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

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('localStorage', new MemoryStorage())
    clearToken()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('stays anonymous when no token is present', async () => {
    const auth = useAuthStore()
    const result = await auth.init()

    expect(result).toBe(null)
    expect(auth.user).toBe(null)
    expect(auth.initialized).toBe(true)
  })

  it('loads the user from /auth/me when a token exists', async () => {
    setToken('jwt-token')
    vi.spyOn(authApi, 'me').mockResolvedValueOnce({ id: 'u1', email: 'me@example.com' })

    const auth = useAuthStore()
    await auth.init()

    expect(auth.user).toEqual({ id: 'u1', email: 'me@example.com' })
    expect(auth.initialized).toBe(true)
  })

  it('falls back to anonymous when /auth/me fails', async () => {
    setToken('jwt-token')
    vi.spyOn(authApi, 'me').mockRejectedValueOnce(new Error('401'))

    const auth = useAuthStore()
    await auth.init()

    expect(auth.user).toBe(null)
    expect(auth.initialized).toBe(true)
  })
})
