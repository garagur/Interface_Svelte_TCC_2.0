import { t as API_URL } from "./constants.js";
//#region src/config/routes/User_Endpoints.js
var AUTH_ROUTES = {
	sendOtp: `${API_URL}/auth/send-otp`,
	login: `${API_URL}/auth/login`,
	logout: `${API_URL}/auth/logout`,
	me: `${API_URL}/auth/me`
};
var USER_ROUTES = {
	cadastro: `${API_URL}/users`,
	listar: `${API_URL}/users`,
	/** @param {number} id */
	buscar: (id) => `${API_URL}/users/${id}`,
	/** @param {number} id */
	atualizar: (id) => `${API_URL}/users/${id}`
};
//#endregion
export { USER_ROUTES as n, AUTH_ROUTES as t };
