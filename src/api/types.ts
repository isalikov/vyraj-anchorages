/** Response shape of GET /auth/me. Extend with whatever your backend returns. */
export interface MeResponse {
  id: string
  email: string
}
