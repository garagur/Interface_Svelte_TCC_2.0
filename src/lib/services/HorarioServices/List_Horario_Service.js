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

function mapearBloco(s) {
    return {
        id: s.id,
        turma_id: s.turma?.id || s.turma_id || '',
        turma_nome: s.turma?.nome || '',
        sala_id: s.sala?.id || s.sala_id || '',
        sala_nome: s.sala?.nome || '',
        professor_id: s.professor?.id || s.professor_id || '',
        dia_semana: s.dia_semana || '',
        disciplina: s.disciplina || '',
        hora_inicio: s.hora_inicio || '',
        hora_fim: s.hora_fim || '',
        professor: s.professor || null,
    }
}

async function buscarBlocos(token, params = {}) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    const query = new URLSearchParams(params).toString()
    const url = query ? `${HORARIO_ROUTES.listar}?${query}` : HORARIO_ROUTES.listar

    const resp = await apiFetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    if (!resp) return [];
    const dados = await parseJson(resp)

    if (!resp.ok) {
        throw new Error(dados?.message || dados?.error || 'Erro ao carregar horários.')
    }

    const lista = Array.isArray(dados) ? dados : dados?.blocos || dados?.data || []

    return lista.map(mapearBloco)
}

/**
 * @param {string} token
 * @param {number|null} turma_id
 * @returns {Promise<any[]>}
 */
export async function carregarHorarios(token, turma_id = null) {
    return buscarBlocos(token, turma_id ? { turma_id } : {})
}

/**
 * @param {string} token
 * @param {number|string} professor_id
 * @returns {Promise<any[]>}
 */
export async function carregarHorariosProfessor(token, professor_id) {
    return buscarBlocos(token, { professor_id })
}

/**
 * @param {string} token
 * @param {number|string} sala_id
 * @returns {Promise<any[]>}
 */
export async function carregarHorariosSala(token, sala_id) {
    return buscarBlocos(token, { sala_id })
}