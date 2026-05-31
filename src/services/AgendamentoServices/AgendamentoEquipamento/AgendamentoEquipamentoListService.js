import { AGENDAMENTOEQUIPAMENTO_ROUTE } from './AgendamentoEquipamentoService.js'

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
 * @param {string} token
 * @returns {Promise<any[]>}
 */
export async function carregarAgendamentosEquipamentos(token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    const resp = await fetch(AGENDAMENTOEQUIPAMENTO_ROUTE.listar, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })

    const dados = await parseJson(resp)

    if (!resp.ok) {
        throw new Error(dados?.message || dados?.error || 'Erro ao carregar salas.')
    }

    const lista = Array.isArray(dados) ? dados : dados?.data || []

    // @ts-ignore
    return lista.map(s => ({

        id: s.id,
        user_id: s.user_id || '',
        equipamento_id: s.equipamento_id || '',
        data_hora_inicio: s.data_hora_inicio || '',
        data_hora_fim: s.data_hora_fim || '',
        obs: s.obs || '',
    }))
}