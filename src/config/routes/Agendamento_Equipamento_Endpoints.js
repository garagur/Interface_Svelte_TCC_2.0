// Agendamento_Equipamento_Endpoints.js
export const AGENDAMENTOEQUIPAMENTO_ROUTE = {
    listar: '/agendamento-equipamentos',
    buscar: (id) => `/agendamento-equipamentos/${id}`,
    cadastrar: '/agendamento-equipamentos',
    deletaar: (id) => `/agendamento-equipamentos/${id}`,
}