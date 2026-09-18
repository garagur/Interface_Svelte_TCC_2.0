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
 * @param {{ serie: number, turma: string, turno: string, grau: string, ano_letivo: number}} novaTurma
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function cadastrarTurma(novaTurma, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    // Validação atualizada para os novos campos obrigatórios
    if (
        !novaTurma?.serie ||
        !novaTurma?.turma ||
        !novaTurma?.turno ||
        !novaTurma?.grau ||
        !novaTurma?.ano_letivo
    ) {
        throw new Error('Dados da turma incompletos.')
    }

    const resp = await apiFetch(TURMA_ROUTES.cadastrar, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Certifique-se de estar enviando o token no header (ex: 'Authorization': `Bearer ${token}`) caso sua API exija
        },
        body: JSON.stringify({
            serie: novaTurma.serie,
            turma: novaTurma.turma,
            turno: novaTurma.turno,
            grau: novaTurma.grau,
            ano_letivo: novaTurma.ano_letivo,
        }),
    })

    if (!resp) return;
    const dados = await parseJson(resp)

    if (!resp.ok) {
        if (dados?.errors) {
            throw new Error(Object.values(dados.errors).flat().join(' '))
        }
        throw new Error(dados?.message || dados?.error || 'Erro ao cadastrar turma.')
    }

    return dados?.data || dados || {}
}