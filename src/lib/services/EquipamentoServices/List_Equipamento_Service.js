import { EQUIPAMENTO_ROUTES } from '../../../config/routes/Equipamento_Endpoints.js'
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
export async function carregarEquipamentos(token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    const resp = await fetch(EQUIPAMENTO_ROUTES.listar, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })

    const dados = await parseJson(resp)

    if (!resp.ok) {
        throw new Error(dados?.message || dados?.error || 'Erro ao carregar equipamentos.')
    }

    const lista = Array.isArray(dados) ? dados : dados?.data || []

    return lista.map(s => ({
        id: s.id,
        nome: s.nome || '',
        N_patrimonio: s.N_patrimonio || '',
        obs: s.obs || '',
        status: s.status ?? true,
    }))
}