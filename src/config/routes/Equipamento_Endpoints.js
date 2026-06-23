// Equipamento_Endpoints.js
export const EQUIPAMENTO_ROUTES = {
    listar: '/equipamentos',
    buscar: (id) => `/equipamentos/${id}`,
    cadastrar: '/equipamentos',
    atualizar: (id) => `/equipamentos/${id}`,
}