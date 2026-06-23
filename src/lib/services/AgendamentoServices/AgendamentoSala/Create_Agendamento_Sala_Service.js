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


export async function cadastrarAgendamento(novoAgendamentoSala, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }
    if (!isFuturo(novoAgendamentoSala.data_hora_inicio)) {
        throw new Error('Não é possível agendar para um horário que já passou.')
    }
    const resp = await fetch(AGENDAMENTOSALA_ROUTE.cadastrar, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            sala_id: novoAgendamentoSala.sala_id,
            data_hora_inicio: novoAgendamentoSala.data_hora_inicio,
            data_hora_fim: novoAgendamentoSala.data_hora_fim,
            obs: novoAgendamentoSala.obs,
        }),
    })

    const dados = await parseJson(resp)

    if (!resp.ok) {
        if (dados?.errors) {
            throw new Error(Object.values(dados.errors).flat().join(' '))
        }
        throw new Error(dados?.message || dados?.error || 'Erro ao agendar sala.')
    }

    return dados?.data || dados || {}
}
function isFuturo(dataHoraInicio) {
    const inicio = new Date(dataHoraInicio)
    if (isNaN(inicio.getTime())) return false
    return inicio >= new Date()
}