import { LOGIN_ROUTES } from '../../../config/routes/Login_Endpoints.js'

const MSG_SEM_CONEXAO = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'

async function parseJson(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function fetchComTratamento(url, options) {
  let resp
  try {
    resp = await fetch(url, options)
  } catch (e) {
    throw new Error(MSG_SEM_CONEXAO)
  }

  // 502/503/504 = proxy/servidor fora do ar, não é erro de negócio
  if ([502, 503, 504].includes(resp.status)) {
    throw new Error(MSG_SEM_CONEXAO)
  }

  return resp
}

export async function sendOtp(email) {
  if (!email) {
    throw new Error('Preencha o email!')
  }

  const resp = await fetchComTratamento(LOGIN_ROUTES.sendOtp, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  const dados = await parseJson(resp)

  if (!resp.ok) {
    throw new Error(dados?.message || MSG_SEM_CONEXAO)
  }

  return dados
}

export async function loginUser(email, otp) {
  if (!email || !otp) {
    throw new Error('Preencha o código enviado ao seu email!')
  }

  const resposta = await fetchComTratamento(LOGIN_ROUTES.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email, password: otp, platform: 'web' }),
  })

  const dados = await parseJson(resposta)

  if (!resposta.ok) {
    throw new Error(dados?.message || MSG_SEM_CONEXAO)
  }

  return {
    ...dados,
    token: dados?.token || dados?.access_token,
    user: dados?.user || dados?.data?.user,
  }
}