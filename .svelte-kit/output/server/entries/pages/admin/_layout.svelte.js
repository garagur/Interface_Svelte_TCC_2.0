import "../../../chunks/internal.js";
import { c as slot } from "../../../chunks/server.js";
import "../../../chunks/client.js";
import "../../../chunks/navigation.js";
//#region src/routes/admin/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="escopo-admin-cadastro"><!--[-->`);
		slot($$renderer, $$props, "default", {}, null);
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _layout as default };
