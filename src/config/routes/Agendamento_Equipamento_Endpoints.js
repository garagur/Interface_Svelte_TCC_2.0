// Agendamento_Equipamento_Endpoints.js
export const AGENDAMENTOEQUIPAMENTO_ROUTE = {
    listar: '/agendamento-equipamentos',
    buscar: (id) => `/agendamento-equipamentos/${id}`,
    cadastrar: '/agendamento-equipamentos',
    deletar: (id) => `/agendamento-equipamentos/${id}`,
}