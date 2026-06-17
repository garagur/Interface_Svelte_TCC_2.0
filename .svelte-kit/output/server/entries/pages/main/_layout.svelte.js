import { c as slot } from "../../../chunks/dev.js";
//#region src/routes/main/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.push(`<div class="escopo-main"><!--[-->`);
	slot($$renderer, $$props, "default", {}, null);
	$$renderer.push(`<!--]--></div>`);
}
//#endregion
export { _layout as default };
