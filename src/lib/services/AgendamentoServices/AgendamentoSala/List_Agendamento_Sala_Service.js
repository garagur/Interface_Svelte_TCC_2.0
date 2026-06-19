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
 * @param {string} token
 * @param {number|null} sala_id
 * @returns {Promise<any[]>}
 */
export async function carregarAgendamentosSalas(token, sala_id = null) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    const url = sala_id
        ? `${AGENDAMENTOSALA_ROUTE.listar}?sala_id=${sala_id}`
        : AGENDAMENTOSALA_ROUTE.listar

    const resp = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })

    const dados = await parseJson(resp)

    if (!resp.ok) {
        throw new Error(dados?.message || dados?.error || 'Erro ao carregar agendamentos.')
    }

    const lista = Array.isArray(dados) ? dados : dados?.data || []

    return lista.map(s => {
        const item = {
            id: s.id,
            user_id: s.user_id || '',
            usuario_nome: s.user?.name || '',
            sala_id: s.sala_id || '',
            sala_nome: s.sala?.nome || '',
            data_hora_inicio: s.data_hora_inicio || '',
            data_hora_fim: s.data_hora_fim || '',
            obs: s.obs || '',
            tipo: 'sala',
        }
        console.log('agendamento mapeado:', item)
        return item
    })
}