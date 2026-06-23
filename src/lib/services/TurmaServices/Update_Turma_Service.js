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
 * @param {number} id
 * @param {{ nome: string, ano_letivo: number }} dadosTurma
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function atualizarTurma(id, dadosTurma, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    if (!dadosTurma?.nome || !dadosTurma?.ano_letivo) {
        throw new Error('Dados da turma incompletos.')
    }

    const resp = await apiFetch(TURMA_ROUTES.atualizar(id), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            nome: dadosTurma.nome,
            ano_letivo: dadosTurma.ano_letivo,
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