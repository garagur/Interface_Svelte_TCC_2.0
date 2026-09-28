import { c as slot } from "../../../chunks/server.js";
/* empty css                          */
//#region src/routes/informacoes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	slot($$renderer, $$props, "default", {}, null);
	$$renderer.push(`<!--]-->`);
}
//#endregion
export { _layout as default };
