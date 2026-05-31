import { API_URL } from '../../../config/constants.js'

export const AGENDAMENTOSALA_ROUTE = {
    listar: `${API_URL}/agendamento-salas`,
    buscar: (id) => `${API_URL}/agendamento-salas/${id}`,
    cadastrar: `${API_URL}/agendamento-salas`,
    deletar: (id) => `${API_URL}/agendamento-salas/${id}`,
}
