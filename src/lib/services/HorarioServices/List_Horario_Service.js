import { apiFetch } from '../../../config/api.js'
import { HORARIO_ROUTES } from '../../../config/routes/Horario_Endpoits.js'
//list horario service
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
        turma_ano_letivo:
            s.turma?.ano_letivo ??
            s.turma?.ano ??
            s.turma_ano_letivo ??
            s.ano_letivo ??
            '',
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
function limparParams(params) {
    return Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== '')
    )
}
async function buscarBlocos(token, params = {}) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    const query = new URLSearchParams(limparParams(params)).toString()
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
 * @param {number|null} ano
 */
export async function carregarHorarios(token, turma_id = null, ano = null) {
    return buscarBlocos(token, { turma_id, ano })
}

/**
 * @param {string} token
 * @param {number|string} professor_id
 * @param {number|null} ano
 */
export async function carregarHorariosProfessor(token, professor_id, ano = null) {
    return buscarBlocos(token, { professor_id, ano })
}

/**
 * @param {string} token
 * @param {number|string} sala_id
 * @param {number|null} ano
 */
export async function carregarHorariosSala(token, sala_id, ano = null) {
    return buscarBlocos(token, { sala_id, ano })
}