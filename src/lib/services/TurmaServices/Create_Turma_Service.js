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
 * @param {{ nome: string, ano_letivo: number}} novaTurma
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function cadastrarTurma(novaTurma, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    if (!novaTurma?.nome || !novaTurma?.ano_letivo) {
        throw new Error('Dados da turma incompletos.')
    }

    const resp = await fetch(TURMA_ROUTES.cadastrar, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            nome: novaTurma.nome,
            ano_letivo: novaTurma.ano_letivo,
        }),
    })

    const dados = await parseJson(resp)

    if (!resp.ok) {
        if (dados?.errors) {
            throw new Error(Object.values(dados.errors).flat().join(' '))
        }
        throw new Error(dados?.message || dados?.error || 'Erro ao cadastrar sala.')
    }

    return dados?.data || dados || {}
}