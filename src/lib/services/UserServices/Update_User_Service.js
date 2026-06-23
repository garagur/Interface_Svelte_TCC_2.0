import { apiFetch } from '../../../config/api.js'
import { USER_ROUTES } from '../../../config/routes/User_Endpoints.js'

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
 * @param {number} id
 * @param {{ nome: string, email: string, cargo: string, matricula: string }} dadosUsuario
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function atualizarUsuario(id, dadosUsuario, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    if (!dadosUsuario?.nome || !dadosUsuario?.email || !dadosUsuario?.cargo || !dadosUsuario?.matricula) {
        throw new Error('Dados do usuário incompletos.')
    }

    const resp = await apiFetch(USER_ROUTES.atualizar(id), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',

        },
        body: JSON.stringify({
            name: dadosUsuario.nome,
            matricula: dadosUsuario.matricula,
            cargo: dadosUsuario.cargo,
            email: dadosUsuario.email,
        }),
    })
    if (!resp) return;
    const dados = await parseJson(resp)

    if (!resp.ok) {
        if (dados?.errors) {
            throw new Error(Object.values(dados.errors).flat().join(' '))
        }
        throw new Error(dados?.message || dados?.error || 'Erro ao atualizar.')
    }

    return dados?.data || dados || {}
}