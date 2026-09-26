import { apiFetch } from '../../../config/api.js'
import { SALA_ROUTES } from '../../../config/routes/Sala_Endpoints.js'

const FOTO_TIPOS = ['image/jpeg', 'image/png', 'image/webp']
const FOTO_MAX_BYTES = 2 * 1024 * 1024

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
 * @param {{ nome: string, obs?: string, status: boolean, responsavel_id?: number | null, foto?: File | null }} novaSala
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function cadastrarSala(novaSala, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    if (!novaSala?.nome) {
        throw new Error('Dados da sala incompletos.')
    }

    const { foto } = novaSala

    if (foto) {
        if (!FOTO_TIPOS.includes(foto.type)) {
            throw new Error('Use uma imagem nos formatos jpg, png ou webp.')
        }
        if (foto.size > FOTO_MAX_BYTES) {
            throw new Error('A imagem pode ter no máximo 2 MB.')
        }
    }

    const formData = new FormData()
    formData.append('nome', novaSala.nome)
    if (novaSala.obs) formData.append('obs', novaSala.obs)
    formData.append('status', novaSala.status ? '1' : '0')
    if (novaSala.responsavel_id) {
        formData.append('responsavel_id', String(novaSala.responsavel_id))
    }
    if (foto) formData.append('foto', foto)

    const resp = await apiFetch(SALA_ROUTES.cadastrar, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
        },
        body: formData,
    })

    if (!resp) return;
    const dados = await parseJson(resp)

    if (!resp.ok) {
        if (dados?.errors) {
            throw new Error(Object.values(dados.errors).flat().join(' '))
        }
        throw new Error(dados?.message || dados?.error || 'Erro ao cadastrar sala.')
    }

    return dados?.data || dados || {}
}