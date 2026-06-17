import { n as USER_ROUTES } from "./User_Endpoints.js";
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
	const resp = await fetch(USER_ROUTES.listar, {
		method: "GET",
		headers: {
			"Accept": "application/json",
			"Authorization": `Bearer ${token}`
		}
	});
	const dados = await parseJson(resp);
	if (!resp.ok) throw new Error(dados?.message || dados?.error || "Erro ao carregar usuários.");
	return (Array.isArray(dados) ? dados : dados?.data || dados?.users || []).map((u) => ({
		id: u.id,
		nome: u.name || u.nome || "",
		email: u.email || "",
		cargo: u.cargo || "",
		matricula: u.matricula || ""
	}));
}
//#endregion
export { carregarUsuarios as t };
