import { USER_ROUTES } from './auth.js'

/**
 * @param {Response} response
 * @returns {Promise<any|null>}
 */
async function parseJson(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/**
 * @param {{ nome: string, email: string, cargo: string, matricula: string }} novoUsuario
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function cadastrarUsuario(novoUsuario, token) {
  if (!token) {
    throw new Error('Token de autenticação não encontrado. Faça login novamente.')
  }

  if (!novoUsuario?.nome || !novoUsuario?.email || !novoUsuario?.cargo || !novoUsuario?.matricula) {
    throw new Error('Dados do usuário incompletos.')
  }

  const resp = await fetch(USER_ROUTES.cadastro, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: novoUsuario.nome,
      matricula: novoUsuario.matricula,
      cargo: novoUsuario.cargo,
      email: novoUsuario.email,
    }),
  })

  const dados = await parseJson(resp)

  if (!resp.ok) {
    if (dados?.errors) {
      throw new Error(Object.values(dados.errors).flat().join(' '))
    }
    throw new Error(dados?.message || dados?.error || 'Erro ao cadastrar.')
  }

  return dados?.data || dados || {}
}