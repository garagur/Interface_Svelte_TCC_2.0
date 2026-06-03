import { SALA_ROUTES } from '../../../config/routes/Sala_Endpoints.js'

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
 * @param {{ nome: string, numero: number, obs: string, status: boolean }} novaSala
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function cadastrarSala(novaSala, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    if (!novaSala?.nome || !novaSala?.numero || novaSala?.obs === '') {
        throw new Error('Dados da sala incompletos.')
    }

    const resp = await fetch(SALA_ROUTES.cadastrar, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            nome: novaSala.nome,
            numero: novaSala.numero,
            obs: novaSala.obs,
            status: novaSala.status,
        }),
    })

    const dados = await parseJson(resp)

    if (!resp.ok) {
        if (dados?.errors) {
            throw new Error(Object.values(dados.errors).flat().join(' '))
        }
        throw new Error(dados?.message || dados?.error || 'Erro ao cadastrar sala.')
    }

    return dados?.data || dados || {}
}