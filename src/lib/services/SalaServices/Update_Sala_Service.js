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
 * @param {number} id
 * @param {{ nome: string, obs?: string, status: boolean, responsavel_id?: number | null, foto?: File | null, removerFoto?: boolean }} dadosSala
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function atualizarSalas(id, dadosSala, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    if (!dadosSala?.nome) {
        throw new Error('Dados da sala incompletos.')
    }

    const { foto, removerFoto } = dadosSala

    if (foto) {
        if (!FOTO_TIPOS.includes(foto.type)) {
            throw new Error('Use uma imagem nos formatos jpg, png ou webp.')
        }
        if (foto.size > FOTO_MAX_BYTES) {
            throw new Error('A imagem pode ter no máximo 2 MB.')
        }
    }

    const formData = new FormData()
    formData.append('_method', 'PUT')
    formData.append('nome', dadosSala.nome)
    if (dadosSala.obs) formData.append('obs', dadosSala.obs)
    formData.append('status', dadosSala.status ? '1' : '0')
    if (dadosSala.responsavel_id) {
        formData.append('responsavel_id', String(dadosSala.responsavel_id))
    }

    if (foto) {
        formData.append('foto', foto)
    } else if (removerFoto) {
        formData.append('remover_foto', '1')
    }

    const resp = await apiFetch(SALA_ROUTES.atualizar(id), {
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
        throw new Error(dados?.message || dados?.error || 'Erro ao atualizar sala.')
    }

    return dados?.data || dados || {}
}