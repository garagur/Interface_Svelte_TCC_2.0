export const API_URL = 'http://localhost:8000/api/eafinware'

export const AUTH_ROUTES = {
  login: `${API_URL}/auth/login`,
  logout: `${API_URL}/auth/logout`,
  me: `${API_URL}/auth/me`,
}

export const USER_ROUTES = {
  cadastro: `${API_URL}/users`,
  listar: `${API_URL}/users`,
  /** @param {number} id */
  buscar: (id) => `${API_URL}/users/${id}`,
  /** @param {number} id */
  deletar: (id) => `${API_URL}/users/${id}`,
}