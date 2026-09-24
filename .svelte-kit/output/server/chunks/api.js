import { t as goto } from "./client.js";
import "./navigation.js";
import { t as API_URL } from "./constants.js";
//#region src/config/api.js
function logout(motivo) {
	localStorage.removeItem("token");
	localStorage.removeItem("user");
	goto(`/login?sessao=${motivo}`);
}
async function apiFetch(endpoint, options = {}) {
	const token = localStorage.getItem("token");
	const ehFormData = options.body instanceof FormData;
	let response;
	try {
		response = await fetch(`${API_URL}${endpoint}`, {
			...options,
			headers: {
				...ehFormData ? {} : { "Content-Type": "application/json" },
				...token ? { Authorization: `Bearer ${token}` } : {},
				...options.headers
			}
		});
	} catch (err) {
		logout("desconectado");
		throw err;
	}
	if (response.status === 401) {
		logout("expirada");
		return;
	}
	if ([
		502,
		503,
		504
	].includes(response.status)) {
		logout("desconectado");
		return;
	}
	return response;
}
//#endregion
export { apiFetch as t };
