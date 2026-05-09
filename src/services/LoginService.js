import { AUTH_ROUTES } from './auth.js'

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
 * @param {any} dados
 * @returns {string|undefined}
 */
function getTokenFromResponse(dados) {
  return dados?.token || dados?.access_token || dados?.data?.token || dados?.accessToken
}

/**
 * @param {string} matricula
 * @param {string} senha
 * @returns {Promise<any>}
 */
export async function loginUser(matricula, senha) {
  if (!matricula || !senha) {
    throw new Error('Preencha a matrícula e a senha!')
  }

  const resposta = await fetch(AUTH_ROUTES.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      matricula,
      password: senha,
    }),
  })

  const dados = await parseJson(resposta)

  if (!resposta.ok) {
    throw new Error(dados?.message || dados?.error || 'Credenciais inválidas.')
  }

  return {
    ...dados,
    token: getTokenFromResponse(dados),
    user: dados?.user || dados?.data?.user || dados?.data?.userData,
  }
}