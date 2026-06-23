import { api } from './client'
import type { MeResponse } from './types'

export const authApi = {
  me: () => api.get<MeResponse>('/auth/me'),
}
