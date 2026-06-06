import { HORARIO_ROUTES } from '../../../config/routes/Horario.Endpoits.js'

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
 * @param {{ turma_id: number, sala_id: number, professor_id: string, dia_semana: string, disciplina: string, hora_inicio: string, hora_fim: string}} dadosHorario
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function atualizarHorario(id, dadosHorario, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    if (!dadosHorario?.turma_id || !dadosHorario?.sala_id || !dadosHorario?.professor_id || !dadosHorario?.dia_semana || !dadosHorario?.disciplina || !dadosHorario?.hora_inicio || !dadosHorario?.hora_fim) {
        throw new Error('Dados do horário incompletos.')
    }

    const resp = await fetch(HORARIO_ROUTES.atualizar(id), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            turma_id: dadosHorario.turma_id,
            sala_id: dadosHorario.sala_id,
            professor_id: dadosHorario.professor_id,
            dia_semana: dadosHorario.dia_semana,
            disciplina: dadosHorario.disciplina,
            hora_inicio: dadosHorario.hora_inicio,
            hora_fim: dadosHorario.hora_fim,
        })
    })

    const dados = await parseJson(resp)

    if (!resp.ok) {
        if (dados?.errors) {
            throw new Error(Object.values(dados.errors).flat().join(' '))
        }
        throw new Error(dados?.message || dados?.error || 'Erro ao atualizar.')
    }

    return dados?.data || dados || {}
}