import { t as API_URL } from "./constants.js";
//#region src/config/routes/Turma_Endpoints.js
var TURMA_ROUTES = {
	listar: `${API_URL}/turmas`,
	buscar: (id) => `${API_URL}/turmas/${id}`,
	cadastrar: `${API_URL}/turmas`,
	atualizar: (id) => `${API_URL}/turmas/${id}`,
	deletar: (id) => `${API_URL}/turmas/${id}`
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
	const resp = await fetch(TURMA_ROUTES.listar, {
		method: "GET",
		headers: {
			"Accept": "application/json",
			"Authorization": `Bearer ${token}`
		}
	});
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
