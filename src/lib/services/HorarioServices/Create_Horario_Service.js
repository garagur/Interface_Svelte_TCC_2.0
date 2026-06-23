import { apiFetch } from '../../../config/api.js'
import { HORARIO_ROUTES } from '../../../config/routes/Horario_Endpoits.js'

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
 * @param {{turma_id: number, sala_id: number, professor_id: string, dia_semana: string, disciplina: string,hora_inicio: string, hora_fim: string}} novoHorario
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function cadastrarHorario(novoHorario, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    if (!novoHorario?.turma_id || !novoHorario?.sala_id || !novoHorario?.professor_id || !novoHorario?.dia_semana || !novoHorario?.disciplina || !novoHorario?.hora_inicio || !novoHorario?.hora_fim) {
        throw new Error('Dados do horário incompletos.')
    }

    const resp = await apiFetch(HORARIO_ROUTES.cadastrar, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            turma_id: novoHorario.turma_id,
            sala_id: novoHorario.sala_id,
            professor_id: novoHorario.professor_id,
            dia_semana: novoHorario.dia_semana,
            disciplina: novoHorario.disciplina,
            hora_inicio: novoHorario.hora_inicio,
            hora_fim: novoHorario.hora_fim,
        }),
    })
    if (!resp) return;
    const dados = await parseJson(resp)

    if (!resp.ok) {
        if (dados?.errors) {
            throw new Error(Object.values(dados.errors).flat().join(' '))
        }
        throw new Error(dados?.message || dados?.error || 'Erro ao cadastrar horário.')
    }

    return dados?.data || dados || {}
}