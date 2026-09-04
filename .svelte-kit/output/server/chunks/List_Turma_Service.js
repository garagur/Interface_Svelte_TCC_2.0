import { t as apiFetch } from "./api.js";
//#region src/config/routes/Turma_Endpoints.js
var TURMA_ROUTES = {
	listar: "/turmas",
	buscar: (id) => `/turmas/${id}`,
	cadastrar: "/turmas",
	atualizar: (id) => `/turmas/${id}`,
	deletar: (id) => `/turmas/${id}`
};
//#endregion
//#region src/lib/services/TurmaServices/List_Turma_Service.js
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
async function carregarTurmas(token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	const resp = await apiFetch(TURMA_ROUTES.listar, {
		method: "GET",
		headers: { "Accept": "application/json" }
	});
	if (!resp) return [];
	const dados = await parseJson(resp);
	if (!resp.ok) throw new Error(dados?.message || dados?.error || "Erro ao carregar turmas.");
	return (Array.isArray(dados) ? dados : dados?.turmas || dados?.data || []).map((s) => ({
		id: s.id,
		nome: s.nome || "",
		ano_letivo: s.ano_letivo || ""
	}));
}
//#endregion
export { TURMA_ROUTES as n, carregarTurmas as t };
