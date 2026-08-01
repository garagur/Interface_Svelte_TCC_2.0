import { apiFetch } from '../../../../config/api.js'
import { AGENDAMENTOEQUIPAMENTO_ROUTE } from '../../../../config/routes/Agendamento_Equipamento_Endpoints.js'

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
 * @param {string} [justificativa]
 * @returns {Promise<void>}
 */
export async function deletarAgendamentoEquipamento(id, token, justificativa = '') {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    const resp = await apiFetch(AGENDAMENTOEQUIPAMENTO_ROUTE.deletar(id), {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ justificativa }),
    })

    if (!resp) return;

    if (!resp.ok) {
        const dados = await parseJson(resp)

        if (resp.status === 409) {
            throw new Error(dados?.message || 'Agendamento já está cancelado.')
        }

        if (resp.status === 403) {
            throw new Error(dados?.message || 'Você não tem permissão para cancelar este agendamento.')
        }

        if (dados?.errors) {
            throw new Error(Object.values(dados.errors).flat().join(' '))
        }

        throw new Error(dados?.message || dados?.error || 'Erro ao cancelar agendamento.')
    }
}