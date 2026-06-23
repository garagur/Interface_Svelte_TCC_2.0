import { apiFetch } from '../../../config/api.js'
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
 * @param {{ nome: string, N_patrimonio: string, obs: string, status: boolean }} novoEquipamento
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function cadastrarEquipamento(novoEquipamento, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    if (!novoEquipamento?.nome || !novoEquipamento?.N_patrimonio || novoEquipamento?.obs === '') {
        throw new Error('Dados do equipamento incompletos.')
    }

    const resp = await apiFetch(EQUIPAMENTO_ROUTES.cadastrar, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            nome: novoEquipamento.nome,
            N_patrimonio: novoEquipamento.N_patrimonio,
            obs: novoEquipamento.obs,
            status: novoEquipamento.status,
        }),
    })

    const dados = await parseJson(resp)
    if (!resp) return;
    if (!resp.ok) {
        if (dados?.errors) {
            throw new Error(Object.values(dados.errors).flat().join(' '))
        }
        throw new Error(dados?.message || dados?.error || 'Erro ao cadastrar equipamento.')
    }

    return dados?.data || dados || {}
}