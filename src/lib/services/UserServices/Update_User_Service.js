import { apiFetch } from '../../../config/api.js'
import { USER_ROUTES } from '../../../config/routes/User_Endpoints.js'

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
 * Envia só os campos informados.
 * Admin pode mandar todos; usuário comum, apenas nome, email e foto.
 *
 * @param {number} id
 * @param {{
 *   nome?: string,
 *   email?: string,
 *   cargo?: string,
 *   matricula?: string,
 *   status?: boolean,
 *   foto?: File | null,
 *   removerFoto?: boolean
 * }} dadosUsuario
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function atualizarUsuario(id, dadosUsuario, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    const { nome, email, cargo, matricula, status, foto, removerFoto } = dadosUsuario ?? {}

    if (nome !== undefined && !nome.trim()) {
        throw new Error('O nome não pode ficar vazio.')
    }
    if (email !== undefined && !email.trim()) {
        throw new Error('O e-mail não pode ficar vazio.')
    }

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

    if (nome !== undefined) formData.append('name', nome)
    if (email !== undefined) formData.append('email', email)
    if (cargo !== undefined) formData.append('cargo', cargo)
    if (matricula !== undefined) formData.append('matricula', String(matricula))
    if (typeof status === 'boolean') formData.append('status', status ? '1' : '0')

    if (foto) {
        formData.append('foto', foto)
    } else if (removerFoto) {
        formData.append('remover_foto', '1')
    }

    const resp = await apiFetch(USER_ROUTES.atualizar(id), {
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
        throw new Error(dados?.message || dados?.error || 'Erro ao atualizar.')
    }

    return dados?.data || dados || {}
}