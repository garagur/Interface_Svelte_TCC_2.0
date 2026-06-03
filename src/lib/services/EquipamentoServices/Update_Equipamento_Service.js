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
 * @param {number} id
 * @param {{ nome: string, N_patrimonio: string, obs: string, status: boolean }} dadosEquipamento
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function atualizarEquipamentos(id, dadosEquipamento, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    if (!dadosEquipamento?.nome || !dadosEquipamento?.N_patrimonio) {
        throw new Error('Dados do equipamento incompletos.')
    }

    const resp = await fetch(EQUIPAMENTO_ROUTES.atualizar(id), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            nome: dadosEquipamento.nome,
            N_patrimonio: dadosEquipamento.N_patrimonio,
            obs: dadosEquipamento.obs,
            status: dadosEquipamento.status,
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