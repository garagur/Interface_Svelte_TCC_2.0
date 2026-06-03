import { API_URL } from '../constants.js'

export const AGENDAMENTOEQUIPAMENTO_ROUTE = {
    listar: `${API_URL}/agendamento-equipamentos`,
    buscar: (id) => `${API_URL}/agendamento-equipamentos/${id}`,
    cadastrar: `${API_URL}/agendamento-equipamentos`,
    deletaar: (id) => `${API_URL}/agendamento-equipamentos/${id}`,
}
