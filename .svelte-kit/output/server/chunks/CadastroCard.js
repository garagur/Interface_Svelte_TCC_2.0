import { S as escape_html, n as bind_props, ot as fallback, s as slot, x as attr } from "./server.js";
//#region src/lib/components/admin/CadastroCard.svelte
function CadastroCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let titulo = fallback($$props["titulo"], "");
		let subtitulo = fallback($$props["subtitulo"], "");
		let onSair = $$props["onSair"];
		let campos = fallback($$props["campos"], () => [], true);
		let temToggle = fallback($$props["temToggle"], false);
		let toggleValue = fallback($$props["toggleValue"], true);
		let onSubmit = $$props["onSubmit"];
		/** @type {(() => void) | null} */
		let onCancelar = fallback($$props["onCancelar"], null);
		let editando = fallback($$props["editando"], false);
		let carregando = fallback($$props["carregando"], false);
		let erro = fallback($$props["erro"], "");
		let sucesso = fallback($$props["sucesso"], "");
		let iconeForm = fallback($$props["iconeForm"], "add_circle");
		let mostrarFormulario = fallback($$props["mostrarFormulario"], false);
		let tituloNovoRegistro = fallback($$props["tituloNovoRegistro"], "Novo registro");
		let tituloEditarRegistro = fallback($$props["tituloEditarRegistro"], "Editar registro");
		/** @type {(() => void) | null} */
		let onNovo = fallback($$props["onNovo"], null);
		let tituloTabela = fallback($$props["tituloTabela"], "");
		let iconeTabela = fallback($$props["iconeTabela"], "list");
		let totalRegistros = fallback($$props["totalRegistros"], 0);
		let carregandoLista = fallback($$props["carregandoLista"], false);
		let estadoVazioTexto = fallback($$props["estadoVazioTexto"], "Nenhum registro encontrado.");
		let carregandoTexto = fallback($$props["carregandoTexto"], "Carregando...");
		let mostrarPesquisa = fallback($$props["mostrarPesquisa"], false);
		let pesquisa = fallback($$props["pesquisa"], "");
		let placeholderPesquisa = fallback($$props["placeholderPesquisa"], "Pesquisar...");
		let ordenacao = fallback($$props["ordenacao"], "asc");
		let onOrdenarChange = fallback($$props["onOrdenarChange"], (value) => {});
		let labelOrdenacaoAsc = fallback($$props["labelOrdenacaoAsc"], "Nome (A-Z)");
		let labelOrdenacaoDesc = fallback($$props["labelOrdenacaoDesc"], "Nome (Z-A)");
		let ultimoSucesso = "";
		$: if (editando) mostrarFormulario = true;
		$: if (sucesso && sucesso !== ultimoSucesso) {
			ultimoSucesso = sucesso;
			setTimeout(() => {
				mostrarFormulario = false;
			}, 900);
		}
		$$renderer.push(`<div class="scaffold"><header class="app-bar"><div class="title-section"><h1>${escape_html(titulo)}</h1> <span>${escape_html(subtitulo)}</span></div> <div class="actions-section"><button class="btn-icon" title="Voltar para a Home"><span class="material-symbols-outlined">arrow_back</span></button></div></header> <main class="body-content"><div class="card table-card table-card-full"><div class="table-header-title"><div class="title-left"><span class="material-symbols-outlined text-blue">${escape_html(iconeTabela)}</span> <h3>${escape_html(tituloTabela)}</h3></div> <div class="badge">${escape_html(totalRegistros)} registros</div></div> `);
		if (mostrarPesquisa) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="table-toolbar"><div class="campo-pesquisa"><span class="material-symbols-outlined">search</span> <input type="text"${attr("placeholder", placeholderPesquisa)}${attr("value", pesquisa)}/></div> `);
			if (onOrdenarChange) {
				$$renderer.push("<!--[0-->");
				$$renderer.select({
					class: "select-ordenacao",
					value: ordenacao
				}, ($$renderer) => {
					$$renderer.option({ value: "asc" }, ($$renderer) => {
						$$renderer.push(`${escape_html(labelOrdenacaoAsc)}`);
					});
					$$renderer.option({ value: "desc" }, ($$renderer) => {
						$$renderer.push(`${escape_html(labelOrdenacaoDesc)}`);
					});
				});
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <!--[-->`);
			slot($$renderer, $$props, "filtros-extra", {}, null);
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="table-wrapper"><!--[-->`);
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
		$$renderer.push(`<!--]--></div></div> <div class="table-footer"><button type="button" class="btn-adicionar"><span class="material-symbols-outlined">add</span> Adicionar</button></div></div></main> `);
		if (mostrarFormulario) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="modal-overlay" role="button" tabindex="-1" aria-label="Fechar formulário"><div class="card form-card form-card-modal" role="dialog" aria-modal="true" tabindex="-1"><button type="button" class="btn-fechar-modal" title="Fechar"><span class="material-symbols-outlined">close</span></button> <div class="card-header"><span class="material-symbols-outlined icon-large">${escape_html(iconeForm)}</span> <h3 class="form-titulo">${escape_html(editando ? tituloEditarRegistro : tituloNovoRegistro)}</h3></div> <form><!--[-->`);
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
			$$renderer.push(`<!--]--> <div class="bottom-action"><button type="button" class="btn-secondary"${attr("disabled", carregando, true)}><span class="material-symbols-outlined">close</span> Cancelar</button> <button type="submit" class="btn-primary"${attr("disabled", carregando, true)}><span class="material-symbols-outlined">save</span> ${escape_html(carregando ? "Salvando..." : editando ? "Atualizar" : "Salvar")}</button></div></form></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
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
			mostrarFormulario,
			tituloNovoRegistro,
			tituloEditarRegistro,
			onNovo,
			tituloTabela,
			iconeTabela,
			totalRegistros,
			carregandoLista,
			estadoVazioTexto,
			carregandoTexto,
			mostrarPesquisa,
			pesquisa,
			placeholderPesquisa,
			ordenacao,
			onOrdenarChange,
			labelOrdenacaoAsc,
			labelOrdenacaoDesc
		});
	});
}
//#endregion
export { CadastroCard as t };
