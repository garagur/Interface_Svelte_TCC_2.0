import { t as apiFetch } from "./api.js";
//#region src/config/routes/Equipamento_Endpoints.js
var EQUIPAMENTO_ROUTES = {
	listar: "/equipamentos",
	buscar: (id) => `/equipamentos/${id}`,
	cadastrar: "/equipamentos",
	atualizar: (id) => `/equipamentos/${id}`
};
//#endregion
//#region src/lib/services/EquipamentoServices/List_Equipamento_Service.js
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
* @returns {Promise<any[]>}
*/
async function carregarEquipamentos(token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	const resp = await apiFetch(EQUIPAMENTO_ROUTES.listar, {
		method: "GET",
		headers: { "Accept": "application/json" }
	});
	if (!resp) return [];
	const dados = await parseJson(resp);
	if (!resp.ok) throw new Error(dados?.message || dados?.error || "Erro ao carregar equipamentos.");
	return (Array.isArray(dados) ? dados : dados?.data || []).map((s) => ({
		id: s.id,
		nome: s.nome || "",
		N_patrimonio: s.N_patrimonio || "",
		obs: s.obs || "",
		status: s.status ?? true,
		responsavel_id: s.responsavel?.id ?? null,
		responsavel_nome: s.responsavel?.nome || s.responsavel?.name || "",
		fotoUrl: s.foto_url ?? null
	}));
}
//#endregion
export { EQUIPAMENTO_ROUTES as n, carregarEquipamentos as t };
