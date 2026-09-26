import { apiFetch } from '../../../config/api.js'
import { EQUIPAMENTO_ROUTES } from '../../../config/routes/Equipamento_Endpoints.js'

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
 * @param {{ nome: string, N_patrimonio: string, obs?: string, status: boolean, responsavel_id?: number | null, foto?: File | null, removerFoto?: boolean }} dadosEquipamento
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function atualizarEquipamentos(id, dadosEquipamento, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    if (!dadosEquipamento?.nome || !dadosEquipamento?.N_patrimonio) {
        throw new Error('Dados do equipamento incompletos.')
    }

    const { foto, removerFoto } = dadosEquipamento

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
    formData.append('nome', dadosEquipamento.nome)
    formData.append('N_patrimonio', dadosEquipamento.N_patrimonio)
    if (dadosEquipamento.obs) formData.append('obs', dadosEquipamento.obs)
    formData.append('status', dadosEquipamento.status ? '1' : '0')
    if (dadosEquipamento.responsavel_id) {
        formData.append('responsavel_id', String(dadosEquipamento.responsavel_id))
    }

    if (foto) {
        formData.append('foto', foto)
    } else if (removerFoto) {
        formData.append('remover_foto', '1')
    }

    const resp = await apiFetch(EQUIPAMENTO_ROUTES.atualizar(id), {
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
        throw new Error(dados?.message || dados?.error || 'Erro ao atualizar equipamento.')
    }

    return dados?.data || dados || {}
}