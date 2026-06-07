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
 * @param {string} token
 * @returns {Promise<any[]>}
 */
export async function carregarHorarios(token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    const resp = await fetch(HORARIO_ROUTES.listar, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })

    const dados = await parseJson(resp)

    if (!resp.ok) {
        throw new Error(dados?.message || dados?.error || 'Erro ao carregar horários.')
    }

    const lista = Array.isArray(dados) ? dados : dados?.blocos || dados?.data || []

    // @ts-ignore
    return lista.map(s => ({
        id: s.id,
        turma_id: s.turma?.id || '',
        sala_id: s.sala?.id || '',
        professor_id: s.professor?.id || '',
        dia_semana: s.dia_semana || '',
        disciplina: s.disciplina || '',
        hora_inicio: s.hora_inicio || '',
        hora_fim: s.hora_fim || '',
        professor: s.professor || null,
    }))
}