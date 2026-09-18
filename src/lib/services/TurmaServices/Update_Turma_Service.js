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
 * @param {{ serie: number, turma: string, turno: string, grau: string, ano_letivo: number }} dadosTurma
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function atualizarTurma(id, dadosTurma, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    // Validação atualizada para os novos campos
    if (
        !dadosTurma?.serie ||
        !dadosTurma?.turma ||
        !dadosTurma?.turno ||
        !dadosTurma?.grau ||
        !dadosTurma?.ano_letivo
    ) {
        throw new Error('Dados da turma incompletos.')
    }

    const resp = await apiFetch(TURMA_ROUTES.atualizar(id), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // 'Authorization': `Bearer ${token}` // Descomente se sua apiFetch não insere o token automaticamente
        },
        body: JSON.stringify({
            serie: dadosTurma.serie,
            turma: dadosTurma.turma,
            turno: dadosTurma.turno,
            grau: dadosTurma.grau,
            ano_letivo: dadosTurma.ano_letivo,
        })
    })

    if (!resp) return;
    const dados = await parseJson(resp)

    if (!resp.ok) {
        if (dados?.errors) {
            throw new Error(Object.values(dados.errors).flat().join(' '))
        }
        throw new Error(dados?.message || dados?.error || 'Erro ao atualizar turma.')
    }

    return dados?.data || dados || {}
}