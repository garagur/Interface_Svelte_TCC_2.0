import { apiFetch } from '../../../config/api.js'
import { TURMA_ROUTES } from '../../../config/routes/Turma_Endpoints.js'

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
 * @returns {Promise<Array<{id: number, serie: number, turma: string, turno: string, grau: string, ano_letivo: number, nome: string}>>}
 */
export async function carregarTurmas(token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    const resp = await apiFetch(TURMA_ROUTES.listar, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            // 'Authorization': `Bearer ${token}` // Descomente se precisar passar o token aqui
        },
    })
    if (!resp) return [];
    const dados = await parseJson(resp)

    if (!resp.ok) {
        throw new Error(dados?.message || dados?.error || 'Erro ao carregar turmas.')
    }

    const lista = Array.isArray(dados) ? dados : dados?.turmas || dados?.data || []

    // @ts-ignore
    return lista.map(s => ({
        id: s.id,
        serie: s.serie || '',
        turma: s.turma || '',
        turno: s.turno || '',
        grau: s.grau || '',
        ano_letivo: s.ano_letivo || '',
        nome: s.nome || '',
    }))
}