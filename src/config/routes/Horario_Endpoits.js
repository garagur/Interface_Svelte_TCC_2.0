// Horario_Endpoints.js
export const HORARIO_ROUTES = {
    listar: '/blocos-horario',
    buscar: (id) => `/blocos-horario/${id}`,
    cadastrar: '/blocos-horario',
    atualizar: (id) => `/blocos-horario/${id}`,
    deletar: (id) => `/blocos-horario/${id}`,
}