import { apiFetch } from '../../../config/api.js'
import { SALA_ROUTES } from '../../../config/routes/Sala_Endpoints.js'

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
export async function carregarSalas(token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    const resp = await apiFetch(SALA_ROUTES.listar, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    if (!resp) return [];
    const dados = await parseJson(resp)

    if (!resp.ok) {
        throw new Error(dados?.message || dados?.error || 'Erro ao carregar salas.')
    }

    const lista = Array.isArray(dados) ? dados : dados?.data || []

    // @ts-ignore
    return lista.map(s => ({
        id: s.id,
        nome: s.nome || '',
        numero: s.numero || '',
        obs: s.obs || '',
        status: s.status ?? true,
    }))
}