import { API_URL } from '../constants.js'

export const TURMA_ROUTES = {
    listar: `${API_URL}/turmas`,
    buscar: (id) => `${API_URL}/turmas/${id}`,
    cadastrar: `${API_URL}/turmas`,
    atualizar: (id) => `${API_URL}/turmas/${id}`,
    deletar: (id) => `${API_URL}/turmas/${id}`,
}