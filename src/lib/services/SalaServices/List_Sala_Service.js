import { apiFetch } from '../../../config/api.js'
import { SALA_ROUTES } from '../../../config/routes/Sala_Endpoints.js'
//list sala service
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
    return lista.map(s => {
        const responsavelId =
            s.responsavel_id ?? s.responsavelId ?? s.responsavel_user_id ??
            s.responsavel_usuario_id ?? s.responsavel?.id ??
            s.responsavel?.usuario_id ?? s.responsavel?.user_id ?? null
        const responsavelNome =
            s.responsavel_nome || s.responsavelName || s.responsavel_name ||
            s.responsavel?.nome || s.responsavel?.name ||
            s.responsavel?.usuario?.nome || s.responsavel?.usuario?.name ||
            s.responsavel?.usuario?.name || ''

        return {
            id: s.id,
            nome: s.nome || '',
            obs: s.obs || '',
            obs_can: s.obs_can || '',
            status: s.status === false || s.status === 0 || s.status === '0' ? false : true,
            responsavel_id: responsavelId,
            responsavel_nome: responsavelNome,
            responsavel: responsavelId || responsavelNome
                ? {
                    ...(typeof s.responsavel === 'object' ? s.responsavel : {}),
                    id: responsavelId,
                    nome: responsavelNome,
                    name: responsavelNome,
                }
                : null,
            fotoUrl: s.foto_url ?? null,
        }
    })
}