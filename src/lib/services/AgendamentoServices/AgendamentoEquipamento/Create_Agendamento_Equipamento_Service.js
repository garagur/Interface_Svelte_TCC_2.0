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

export async function cadastrarAgendamento(novoAgendamentoEquipamento, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    const resp = await apiFetch(AGENDAMENTOEQUIPAMENTO_ROUTE.cadastrar, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            equipamento_id: novoAgendamentoEquipamento.equipamento_id,
            data_hora_inicio: novoAgendamentoEquipamento.data_hora_inicio,
            data_hora_fim: novoAgendamentoEquipamento.data_hora_fim,
            obs: novoAgendamentoEquipamento.obs,
        }),
    })

    if (!resp) return {};

    const dados = await parseJson(resp)

    if (!resp.ok) {
        if (dados?.errors) {
            throw new Error(Object.values(dados.errors).flat().join(' '))
        }
        throw new Error(dados?.message || dados?.error || 'Erro ao agendar equipamento.')
    }

    return dados?.data || dados || {}
}