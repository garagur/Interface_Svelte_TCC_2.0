import { t as API_URL } from "./constants.js";
//#region src/config/routes/Agendamento_Sala_Endpoints.js
var AGENDAMENTOSALA_ROUTE = {
	listar: `${API_URL}/agendamento-salas`,
	buscar: (id) => `${API_URL}/agendamento-salas/${id}`,
	cadastrar: `${API_URL}/agendamento-salas`,
	deletar: (id) => `${API_URL}/agendamento-salas/${id}`
};
//#endregion
//#region src/lib/services/AgendamentoServices/AgendamentoSala/List_Agendamento_Sala_Service.js
async function parseJson(response) {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
/**
* @param {string} token
* @param {number|null} sala_id
* @returns {Promise<any[]>}
*/
async function carregarAgendamentosSalas(token, sala_id = null) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	const url = sala_id ? `${AGENDAMENTOSALA_ROUTE.listar}?sala_id=${sala_id}` : AGENDAMENTOSALA_ROUTE.listar;
	const resp = await fetch(url, {
		method: "GET",
		headers: {
			"Accept": "application/json",
			"Authorization": `Bearer ${token}`
		}
	});
	const dados = await parseJson(resp);
	if (!resp.ok) throw new Error(dados?.message || dados?.error || "Erro ao carregar agendamentos.");
	return (Array.isArray(dados) ? dados : dados?.data || []).map((s) => ({
		id: s.id,
		user_id: s.user_id || "",
		sala_id: s.sala_id || "",
		data_hora_inicio: s.data_hora_inicio || "",
		data_hora_fim: s.data_hora_fim || "",
		obs: s.obs || ""
	}));
}
//#endregion
export { AGENDAMENTOSALA_ROUTE as n, carregarAgendamentosSalas as t };
