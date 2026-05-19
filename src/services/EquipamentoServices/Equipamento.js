import { API_URL } from '../../config/constants.js'

export const EQUIPAMENTO_ROUTES = {
    listar: `${API_URL}/equipamentos`,
    buscar: (id) => `${API_URL}/equipamentos/${id}`,
    cadastrar: `${API_URL}/equipamentos`,
    atualizar: (id) => `${API_URL}/equipamentos/${id}`,
}