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
 * @param {{ nome: string, N_patrimonio: string, obs?: string, status: boolean, responsavel_id?: number | null, foto?: File | null }} novoEquipamento
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function cadastrarEquipamento(novoEquipamento, token) {
    if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    if (!novoEquipamento?.nome || !novoEquipamento?.N_patrimonio) {
        throw new Error('Dados do equipamento incompletos.')
    }

    const { foto } = novoEquipamento

    if (foto) {
        if (!FOTO_TIPOS.includes(foto.type)) {
            throw new Error('Use uma imagem nos formatos jpg, png ou webp.')
        }
        if (foto.size > FOTO_MAX_BYTES) {
            throw new Error('A imagem pode ter no máximo 2 MB.')
        }
    }

    const formData = new FormData()
    formData.append('nome', novoEquipamento.nome)
    formData.append('N_patrimonio', novoEquipamento.N_patrimonio)
    if (novoEquipamento.obs) formData.append('obs', novoEquipamento.obs)
    formData.append('status', novoEquipamento.status ? '1' : '0')
    if (novoEquipamento.responsavel_id) {
        formData.append('responsavel_id', String(novoEquipamento.responsavel_id))
    }
    if (foto) formData.append('foto', foto)

    const resp = await apiFetch(EQUIPAMENTO_ROUTES.cadastrar, {
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
        throw new Error(dados?.message || dados?.error || 'Erro ao cadastrar equipamento.')
    }

    return dados?.data || dados || {}
}