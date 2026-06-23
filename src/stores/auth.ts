import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MeResponse } from '../api/types'
import { clearToken, getToken } from '../api/client'
import { authApi } from '../api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<MeResponse | null>(null)
  const initialized = ref(false)

  async function refreshMe() {
    user.value = await authApi.me()
    return user.value
  }

  /** Resolve the current session once. Safe to call from the router guard. */
  async function init() {
    if (initialized.value) return user.value

    const token = getToken()
    if (!token) {
      user.value = null
      initialized.value = true
      return null
    }

    try {
      return await refreshMe()
    } catch {
      user.value = null
      return null
    } finally {
      initialized.value = true
    }
  }

  function logout() {
    user.value = null
    initialized.value = true
    clearToken()
    window.location.replace('/login')
  }

  return {
    user,
    initialized,
    init,
    refreshMe,
    logout,
  }
})
