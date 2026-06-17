import { redirect } from "@sveltejs/kit";
//#region src/routes/+page.js
function load() {
	redirect(307, "/login");
}
//#endregion
export { load };
