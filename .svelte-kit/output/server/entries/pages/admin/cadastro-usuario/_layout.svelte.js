import { c as slot } from "../../../../chunks/dev.js";
//#region src/routes/admin/cadastro-usuario/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.push(`<div class="escopo-cadastro-usuario"><!--[-->`);
	slot($$renderer, $$props, "default", {}, null);
	$$renderer.push(`<!--]--></div>`);
}
//#endregion
export { _layout as default };
