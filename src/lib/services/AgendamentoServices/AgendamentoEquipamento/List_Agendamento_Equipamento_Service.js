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

export async function carregarAgendamentosEquipamentos(token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    const resp = await apiFetch(AGENDAMENTOEQUIPAMENTO_ROUTE.listar, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })

    if (!resp) return [];

    const dados = await parseJson(resp)

    if (!resp.ok) {
        throw new Error(dados?.message || dados?.error || 'Erro ao carregar agendamentos de equipamento.')
    }

    const lista = Array.isArray(dados) ? dados : dados?.data || []

    return lista.map(s => ({
        id: s.id,
        user_id: s.user_id || '',
        usuario_nome: s.usuario_nome || '',
        equipamento_id: s.equipamento_id || '',
        equipamento_nome: s.equipamento_nome || '',
        data_hora_inicio: s.data_hora_inicio || '',
        data_hora_fim: s.data_hora_fim || '',
        obs: s.obs || '',
        status:
            s.status === false || s.status === 0 || s.status === '0'
                ? 'inativo'
                : String(s.status ?? '').toLowerCase(),
        justificativa:
            s.justificativa ||
            s.justificativa_cancelamento ||
            s.motivo_cancelamento ||
            '',
        cancelador_id: s.cancelador_id || '',
        cancelador_nome: s.cancelador_nome || '',
        tipo: 'equipamento',
    }))
}