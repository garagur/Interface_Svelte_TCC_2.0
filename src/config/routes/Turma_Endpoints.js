// Turma_Endpoints.js
export const TURMA_ROUTES = {
    listar: '/turmas',
    buscar: (id) => `/turmas/${id}`,
    cadastrar: '/turmas',
    atualizar: (id) => `/turmas/${id}`,
    deletar: (id) => `/turmas/${id}`,
}