import { HORARIO_ROUTES } from '../../../config/routes/Horario.Endpoits.js'

/**
 * @param {number} id
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function deletarHorario(id, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    const resp = await fetch(HORARIO_ROUTES.deletar(id), {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })

    if (!resp.ok) {
        const text = await resp.text()
        let dados = null
        try { dados = JSON.parse(text) } catch { }
        throw new Error(dados?.message || 'Erro ao deletar horário.')
    }
}