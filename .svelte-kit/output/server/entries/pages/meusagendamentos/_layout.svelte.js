import { c as slot } from "../../../chunks/dev.js";
//#region src/routes/meusagendamentos/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.push(`<div class="meus-agendamentos"><!--[-->`);
	slot($$renderer, $$props, "default", {}, null);
	$$renderer.push(`<!--]--></div>`);
}
//#endregion
export { _layout as default };
