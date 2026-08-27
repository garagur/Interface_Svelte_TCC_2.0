import { apiFetch } from '../../../config/api.js'
import { USER_ROUTES } from '../../../config/routes/User_Endpoints.js'

/**
 * @param {Response} response
 * @returns {Promise<any|null>}
 */
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
 * Busca um único usuário pelo id (rota GET /users/{user}).
 * @param {string} token
 * @param {string|number} id
 * @returns {Promise<{ id: any, nome: string, email: string, cargo: string, matricula: string, status: boolean, foto_url: string|null } | null>}
 */
export async function buscarUsuario(token, id) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }
    if (!id) {
        throw new Error('Id do usuário não informado.')
    }

    const resp = await apiFetch(USER_ROUTES.mostrar(id), {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    if (!resp) return null

    const u = await parseJson(resp)

    if (!resp.ok) {
        throw new Error(u?.message || u?.error || 'Erro ao carregar usuário.')
    }

    return {
        id: u.id,
        nome: u.name || u.nome || '',
        email: u.email || '',
        cargo: u.cargo || '',
        matricula: u.matricula || '',
        status: u.status ?? true,
        foto_url: u.foto_url || u.avatar_url || u.foto || null,
    }
}