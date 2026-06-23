import { apiFetch } from '../../../../config/api.js'
import { AGENDAMENTOSALA_ROUTE } from '../../../../config/routes/Agendamento_Sala_Endpoints.js'

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
 * @param {string} token
 * @returns {Promise<void>}
 */
export async function deletarAgendamentoSala(id, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    const resp = await apiFetch(AGENDAMENTOSALA_ROUTE.deletar(id), {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
        },
    })
    if (!resp) return;
    if (!resp.ok) {
        const dados = await parseJson(resp)
        throw new Error(dados?.message || dados?.error || 'Erro ao deletar agendamento.')
    }
}