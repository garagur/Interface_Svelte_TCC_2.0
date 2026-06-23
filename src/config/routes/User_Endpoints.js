export const AUTH_ROUTES = {
  logout: '/auth/logout',
  me: '/auth/me',
}

export const USER_ROUTES = {
  cadastro: '/users',
  listar: '/users',
  buscar: (id) => `/users/${id}`,
  atualizar: (id) => `/users/${id}`,
}