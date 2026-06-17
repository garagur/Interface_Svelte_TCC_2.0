import { AUTH_ROUTES } from '../../../config/routes/User_Endpoints.js'

async function parseJson(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function sendOtp(email) {
  if (!email) {
    throw new Error('Preencha o email!')
  }

  const resposta = await fetch(AUTH_ROUTES.sendOtp, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  const dados = await parseJson(resposta)

  if (!resposta.ok) {
    throw new Error(dados?.message || 'Email não encontrado.')
  }

  return dados
}

export async function loginUser(email, otp) {
  if (!email || !otp) {
    throw new Error('Preencha o código enviado ao seu email!')
  }

  const resposta = await fetch(AUTH_ROUTES.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email, password: otp, platform: 'web' }),
  })

  const dados = await parseJson(resposta)

  if (!resposta.ok) {
    throw new Error(dados?.message || 'Código inválido.')
  }

  return {
    ...dados,
    token: dados?.token || dados?.access_token,
    user: dados?.user || dados?.data?.user,
  }
}