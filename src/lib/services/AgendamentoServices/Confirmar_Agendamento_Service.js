import { apiFetch } from '../../../config/api.js'
import { AGENDAMENTOEQUIPAMENTO_ROUTE } from '../../../config/routes/Agendamento_Equipamento_Endpoints.js'
import { AGENDAMENTOSALA_ROUTE } from '../../../config/routes/Agendamento_Sala_Endpoints.js'

async function parseJson(response) {
    const text = await response.text()
    if (!text) return null
    try {
        return JSON.parse(text)
    } catch {
        return null
    }
}

export async function confirmarAgendamento(agendamento) {
    const routes = agendamento.tipo === 'equipamento'
        ? AGENDAMENTOEQUIPAMENTO_ROUTE
        : AGENDAMENTOSALA_ROUTE
    const endpoint = routes.atualizarStatus(agendamento.id)
    const response = await apiFetch(endpoint, {
        method: 'PATCH',
        headers: { 'Accept': 'application/json' },
        body: JSON.stringify({ status: 'ativo' }),
    })

    if (!response) {
        throw new Error('Não foi possível confirmar o agendamento.')
    }

    const dados = await parseJson(response)
    if (!response.ok) {
        if (response.status === 409) {
            throw new Error(dados?.message || 'Já existe um agendamento ativo nesse horário.')
        }
        throw new Error(dados?.message || dados?.error || 'Erro ao confirmar o agendamento.')
    }

    return dados?.data || dados
}