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
 * @param {number} id
 * @param {{ nome: string, numero: number, obs: string, status: boolean }} dadosSala
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function atualizarSalas(id, dadosSala, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    if (!dadosSala?.nome || !dadosSala?.numero) {
        throw new Error('Dados da sala incompletos.')
    }

    const resp = await apiFetch(SALA_ROUTES.atualizar(id), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            nome: dadosSala.nome,
            numero: dadosSala.numero,
            obs: dadosSala.obs,
            status: dadosSala.status,
        })
    })
    if (!resp) return;
    const dados = await parseJson(resp)

    if (!resp.ok) {
        if (dados?.errors) {
            throw new Error(Object.values(dados.errors).flat().join(' '))
        }
        throw new Error(dados?.message || dados?.error || 'Erro ao atualizar.')
    }

    return dados?.data || dados || {}
}