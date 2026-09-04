//#region src/config/routes/User_Endpoints.js
var USER_ROUTES = {
	cadastro: "/users",
	listar: "/users",
	buscar: (id) => `/users/${id}`,
	atualizar: (id) => `/users/${id}`
};
//#endregion
export { USER_ROUTES as t };
