import { t as API_URL } from "./constants.js";
//#region src/config/routes/Sala_Endpoints.js
var SALA_ROUTES = {
	listar: `${API_URL}/salas`,
	buscar: (id) => `${API_URL}/salas/${id}`,
	cadastrar: `${API_URL}/salas`,
	atualizar: (id) => `${API_URL}/salas/${id}`
};
//#endregion
//#region src/lib/services/SalaServices/List_Sala_Service.js
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
async function carregarSalas(token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	const resp = await fetch(SALA_ROUTES.listar, {
		method: "GET",
		headers: {
			"Accept": "application/json",
			"Authorization": `Bearer ${token}`
		}
	});
	const dados = await parseJson(resp);
	if (!resp.ok) throw new Error(dados?.message || dados?.error || "Erro ao carregar salas.");
	return (Array.isArray(dados) ? dados : dados?.data || []).map((s) => ({
		id: s.id,
		nome: s.nome || "",
		numero: s.numero || "",
		obs: s.obs || "",
		status: s.status ?? true
	}));
}
//#endregion
export { SALA_ROUTES as n, carregarSalas as t };
