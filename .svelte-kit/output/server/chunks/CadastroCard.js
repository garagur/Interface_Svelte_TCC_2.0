import { B as escape_html, Y as fallback, c as slot, r as bind_props, z as attr } from "./dev.js";
//#region src/lib/components/admin/CadastroCard.svelte
function CadastroCard($$renderer, $$props) {
	let titulo = fallback($$props["titulo"], "");
	let subtitulo = fallback($$props["subtitulo"], "");
	let onSair = $$props["onSair"];
	let campos = fallback($$props["campos"], () => [], true);
	let temToggle = fallback($$props["temToggle"], false);
	let toggleValue = fallback($$props["toggleValue"], true);
	let onSubmit = $$props["onSubmit"];
	let onCancelar = fallback($$props["onCancelar"], null);
	let editando = fallback($$props["editando"], false);
	let carregando = fallback($$props["carregando"], false);
	let erro = fallback($$props["erro"], "");
	let sucesso = fallback($$props["sucesso"], "");
	let iconeForm = fallback($$props["iconeForm"], "add_circle");
	let tituloTabela = fallback($$props["tituloTabela"], "");
	let iconeTabela = fallback($$props["iconeTabela"], "list");
	let totalRegistros = fallback($$props["totalRegistros"], 0);
	let carregandoLista = fallback($$props["carregandoLista"], false);
	let estadoVazioTexto = fallback($$props["estadoVazioTexto"], "Nenhum registro encontrado.");
	let carregandoTexto = fallback($$props["carregandoTexto"], "Carregando...");
	$$renderer.push(`<div class="scaffold"><header class="app-bar"><div class="title-section"><h1>${escape_html(titulo)}</h1> <span>${escape_html(subtitulo)}</span></div> <div class="actions-section"><button class="btn-icon" title="Voltar para a Home"><span class="material-symbols-outlined">arrow_back</span></button></div></header> <main class="body-content"><div class="card form-card"><div class="card-header"><span class="material-symbols-outlined icon-large">${escape_html(iconeForm)}</span></div> <form><!--[-->`);
	slot($$renderer, $$props, "campos", {}, null);
	$$renderer.push(`<!--]--> `);
	if (temToggle) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="field field-toggle"><!--[-->`);
		slot($$renderer, $$props, "toggle", {}, null);
		$$renderer.push(`<!--]--></div>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--> `);
	if (erro) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<p class="msg-erro">${escape_html(erro)}</p>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--> `);
	if (sucesso) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<p class="msg-sucesso">${escape_html(sucesso)}</p>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--> <div class="bottom-action">`);
	if (editando && onCancelar) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<button type="button" class="btn-secondary"><span class="material-symbols-outlined">close</span> Cancelar</button>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--> <button type="submit" class="btn-primary"${attr("disabled", carregando, true)}><span class="material-symbols-outlined">save</span> ${escape_html(carregando ? "Salvando..." : editando ? "Atualizar" : "Salvar")}</button></div></form></div> <div class="card table-card"><div class="table-header-title"><div class="title-left"><span class="material-symbols-outlined text-blue">${escape_html(iconeTabela)}</span> <h3>${escape_html(tituloTabela)}</h3></div> <div class="badge">${escape_html(totalRegistros)} registros</div></div> <div class="table-wrapper"><!--[-->`);
	slot($$renderer, $$props, "tabela-header", {}, null);
	$$renderer.push(`<!--]--> <div class="table-body">`);
	if (carregandoLista) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="estado-vazio">${escape_html(carregandoTexto)}</div>`);
	} else if (totalRegistros === 0) {
		$$renderer.push("<!--[1-->");
		$$renderer.push(`<div class="estado-vazio">${escape_html(estadoVazioTexto)}</div>`);
	} else {
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--[-->`);
		slot($$renderer, $$props, "tabela-body", {}, null);
		$$renderer.push(`<!--]-->`);
	}
	$$renderer.push(`<!--]--></div></div></div></main></div>`);
	bind_props($$props, {
		titulo,
		subtitulo,
		onSair,
		campos,
		temToggle,
		toggleValue,
		onSubmit,
		onCancelar,
		editando,
		carregando,
		erro,
		sucesso,
		iconeForm,
		tituloTabela,
		iconeTabela,
		totalRegistros,
		carregandoLista,
		estadoVazioTexto,
		carregandoTexto
	});
}
//#endregion
export { CadastroCard as t };
