import "../../../chunks/environment.js";
import { c as slot } from "../../../chunks/dev.js";
import "../../../chunks/client.js";
import "../../../chunks/navigation.js";
/* empty css                             */
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
