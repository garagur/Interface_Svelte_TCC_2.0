import { apiFetch } from '../../../config/api.js'
import { AUTH_ROUTES } from '../../../config/routes/User_Endpoints.js'

/**
 * @param {string} token
 * @returns {Promise<void>}
 */
export async function logoutUser(token) {
  if (!token) return

  try {
    await apiFetch(AUTH_ROUTES.logout, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
  } catch (e) {
    console.error('Erro ao deslogar:', e)
  }
}