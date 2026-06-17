import { API_URL } from '../constants.js'

export const HORARIO_ROUTES = {
    listar: `${API_URL}/blocos-horario`,
    buscar: (id) => `${API_URL}/blocos-horario/${id}`,
    cadastrar: `${API_URL}/blocos-horario`,
    atualizar: (id) => `${API_URL}/blocos-horario/${id}`,
    deletar: (id) => `${API_URL}/blocos-horario/${id}`,
}