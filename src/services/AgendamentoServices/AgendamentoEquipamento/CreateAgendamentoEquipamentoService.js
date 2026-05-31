import { AGENDAMENTOEQUIPAMENTO_ROUTE } from '../AgendamentoEquipamento/AgendamentoEquipamentoService.js'

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
 * @param {{ equipamento_id: number, data_hora_inicio: string, data_hora_fim: string, obs: string }} novoAgendamentoEquipamento
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function cadastrarAgendamento(novoAgendamentoEquipamento, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    const resp = await fetch(AGENDAMENTOEQUIPAMENTO_ROUTE.cadastrar, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            equipamento_id: novoAgendamentoEquipamento.equipamento_id,
            data_hora_inicio: novoAgendamentoEquipamento.data_hora_inicio,
            data_hora_fim: novoAgendamentoEquipamento.data_hora_fim,
            obs: novoAgendamentoEquipamento.obs,
        }),
    })

    const dados = await parseJson(resp)

    if (!resp.ok) {
        if (dados?.errors) {
            throw new Error(Object.values(dados.errors).flat().join(' '))
        }
        throw new Error(dados?.message || dados?.error || 'Erro ao agendar equipamento.')
    }

    return dados?.data || dados || {}
}