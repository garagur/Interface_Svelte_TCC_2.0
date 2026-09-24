import { t as apiFetch } from "./api.js";
import { t as USER_ROUTES } from "./User_Endpoints.js";
//#region src/lib/services/UserServices/List_User_Service.js
/**
* @param {Response} response
* @returns {Promise<any|null>}
*/
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
async function carregarUsuarios(token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	const resp = await apiFetch(USER_ROUTES.listar, {
		method: "GET",
		headers: { "Accept": "application/json" }
	});
	if (!resp) return [];
	const dados = await parseJson(resp);
	if (!resp.ok) throw new Error(dados?.message || dados?.error || "Erro ao carregar usuários.");
	return (Array.isArray(dados) ? dados : dados?.data || dados?.users || []).map((u) => ({
		id: u.id,
		nome: u.name || u.nome || "",
		email: u.email || "",
		cargo: u.cargo || "",
		matricula: u.matricula || "",
		status: u.status ?? true,
		fotoUrl: u.foto_url ?? null
	}));
}
//#endregion
export { carregarUsuarios as t };
