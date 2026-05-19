import { API_URL } from '../../config/constants.js'

export const AUTH_ROUTES = {
  login: `${API_URL}/auth/login`,
  logout: `${API_URL}/auth/logout`,
  me: `${API_URL}/auth/me`,
  updatePassword: `${API_URL}/auth/password`,
}

export const USER_ROUTES = {
  cadastro: `${API_URL}/users`,
  listar: `${API_URL}/users`,
  /** @param {number} id */
  buscar: (id) => `${API_URL}/users/${id}`,
  /** @param {number} id */
  atualizar: (id) => `${API_URL}/users/${id}`,
}