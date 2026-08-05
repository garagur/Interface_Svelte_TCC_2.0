import { apiFetch } from '../../../config/api.js'
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
 * @param {number} id
 * @param {{ nome: string, obs: string, status: boolean, responsavel_id?: number | null }} dadosSala
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function atualizarSalas(id, dadosSala, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    if (!dadosSala?.nome) {
        throw new Error('Dados da sala incompletos.')
    }

    const resp = await apiFetch(SALA_ROUTES.atualizar(id), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            nome: dadosSala.nome,
            obs: dadosSala.obs,
            status: dadosSala.status,
            responsavel_id: dadosSala.responsavel_id || null,
        })
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