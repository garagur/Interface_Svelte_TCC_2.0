import "./internal.js";
import { T as escape_html, d as unsubscribe_stores, g as getContext, i as ensure_array_like, l as store_get, lt as fallback, n as bind_props, t as attr_class, w as attr } from "./server.js";
import "./client.js";
import "./navigation.js";
//#region node_modules/@sveltejs/kit/src/runtime/app/stores.js
/**
* A function that returns all of the contextual stores. On the server, this must be called during component initialization.
* Only use this if you need to defer store subscription until after the component has mounted, for some reason.
*
* @deprecated Use `$app/state` instead (requires Svelte 5, [see docs for more info](https://svelte.dev/docs/kit/migrating-to-sveltekit-2#SvelteKit-2.12:-$app-stores-deprecated))
*/
var getStores = () => {
	const stores$1 = getContext("__svelte__");
	return {
		/** @type {typeof page} */
		page: { subscribe: stores$1.page.subscribe },
		/** @type {typeof navigating} */
		navigating: { subscribe: stores$1.navigating.subscribe },
		/** @type {typeof updated} */
		updated: stores$1.updated
	};
};
/**
* A readable store whose value contains page data.
*
* On the server, this store can only be subscribed to during component initialization. In the browser, it can be subscribed to at any time.
*
* @deprecated Use `page` from `$app/state` instead (requires Svelte 5, [see docs for more info](https://svelte.dev/docs/kit/migrating-to-sveltekit-2#SvelteKit-2.12:-$app-stores-deprecated))
* @type {import('svelte/store').Readable<import('@sveltejs/kit').Page>}
*/
var page = { subscribe(fn) {
	return getStores().page.subscribe(fn);
} };
//#endregion
//#region src/lib/components/main/CabecalhoGlobal.svelte
function CabecalhoGlobal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let caminhoAtual, subtituloAtual, paginaAtiva;
		let titulo = fallback($$props["titulo"], "Portal de Agendamento");
		let subtitulo = fallback($$props["subtitulo"], "");
		let nome = fallback($$props["nome"], "");
		let matricula = fallback($$props["matricula"], "");
		let cargo = fallback($$props["cargo"], "");
		let onVoltar = fallback($$props["onVoltar"], null);
		let onLogout = fallback($$props["onLogout"], null);
		let mostrarMenuUsuario = false;
		const atalhosAdmin = [
			{
				label: "Salas",
				title: "Gerenciar salas",
				icon: "meeting_room",
				path: "/admin/cadastro-sala"
			},
			{
				label: "Turmas",
				title: "Gerenciar turmas",
				icon: "groups",
				path: "/admin/cadastro-turma"
			},
			{
				label: "Horários",
				title: "Gerenciar horários",
				icon: "calendar_month",
				path: "/admin/cadastro-horario"
			},
			{
				label: "Equipamentos",
				title: "Gerenciar equipamentos",
				icon: "devices",
				path: "/admin/cadastro-equipamento"
			},
			{
				label: "Usuários",
				title: "Gerenciar usuários",
				icon: "person_add",
				path: "/admin/cadastro-usuario"
			}
		];
		$: caminhoAtual = store_get($$store_subs ??= {}, "$page", page).url.pathname;
		$: subtituloAtual = subtitulo || atalhosAdmin.find((atalho) => caminhoAtual.startsWith(atalho.path))?.title || "";
		$: paginaAtiva = caminhoAtual.startsWith("/main") ? "main" : caminhoAtual.startsWith("/agendamento") ? "agendamento" : caminhoAtual.startsWith("/informacoes") || caminhoAtual.startsWith("/minhas_informacoes") ? "informacoes" : "";
		$$renderer.push(`<header class="cabecalho-global"><div class="cabecalho-global-identidade"><h1>${escape_html(titulo)}</h1> `);
		if (subtituloAtual) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span>${escape_html(subtituloAtual)}</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (nome || matricula) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="cabecalho-global-usuario">${escape_html(nome)}`);
			if (matricula) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`${escape_html(nome ? " | " : "")}Matrícula: ${escape_html(matricula)}`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <nav${attr_class("cabecalho-global-navegacao", void 0, { "administrador": cargo === "admin" })} aria-label="Navegação principal"><button type="button"${attr_class("cabecalho-global-link", void 0, { "ativo": paginaAtiva === "main" })}${attr("aria-current", paginaAtiva === "main" ? "page" : void 0)}><span class="material-symbols-outlined" aria-hidden="true">home</span> <span>Main</span></button> <button type="button"${attr_class("cabecalho-global-link", void 0, { "ativo": paginaAtiva === "agendamento" })}${attr("aria-current", paginaAtiva === "agendamento" ? "page" : void 0)}><span class="material-symbols-outlined" aria-hidden="true">event_available</span> <span>Agendar</span></button> <button type="button"${attr_class("cabecalho-global-link", void 0, { "ativo": paginaAtiva === "informacoes" })}${attr("aria-current", paginaAtiva === "informacoes" ? "page" : void 0)}><span class="material-symbols-outlined" aria-hidden="true">inventory_2</span> <span>Informações</span></button> `);
		if (cargo === "admin") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<!--[-->`);
			const each_array = ensure_array_like(atalhosAdmin);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let atalho = each_array[$$index];
				$$renderer.push(`<button type="button"${attr_class("cabecalho-global-link cabecalho-global-link-admin", void 0, { "ativo": caminhoAtual.startsWith(atalho.path) })}${attr("aria-current", caminhoAtual.startsWith(atalho.path) ? "page" : void 0)}${attr("title", atalho.title)}><span class="material-symbols-outlined" aria-hidden="true">${escape_html(atalho.icon)}</span> <span>${escape_html(atalho.label)}</span></button>`);
			}
			$$renderer.push(`<!--]-->`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></nav> <div class="cabecalho-global-acoes">`);
		if (onVoltar) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button type="button" class="cabecalho-global-icone" title="Voltar para Main" aria-label="Voltar para Main"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="cabecalho-global-conta"><button type="button" class="cabecalho-global-icone" title="Minha conta" aria-label="Minha conta" aria-haspopup="true"${attr("aria-expanded", mostrarMenuUsuario)}><span class="material-symbols-outlined" aria-hidden="true">account_circle</span></button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div></header>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
		bind_props($$props, {
			titulo,
			subtitulo,
			nome,
			matricula,
			cargo,
			onVoltar,
			onLogout
		});
	});
}
//#endregion
export { page as n, CabecalhoGlobal as t };
