import { API_URL } from '../constants.js'

export const SALA_ROUTES = {
    listar: `${API_URL}/salas`,
    buscar: (id) => `${API_URL}/salas/${id}`,
    cadastrar: `${API_URL}/salas`,
    atualizar: (id) => `${API_URL}/salas/${id}`,
}