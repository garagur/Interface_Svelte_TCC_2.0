import { a as onDestroy } from "./internal.js";
import { T as escape_html, i as ensure_array_like, it as invalid_default_snippet, lt as fallback, n as bind_props, t as attr_class, u as stringify, w as attr } from "./server.js";
import { t as CabecalhoGlobal } from "./CabecalhoGlobal.js";
import { a as BlocoHorarioCard, o as GradeSemanal } from "./List_Horario_Service.js";
import { c as ConfirmarDelecaoModal, s as ListaAgendamentosCard } from "./List_Agendamento_Equipamento_Service.js";
//#region src/lib/components/informacoes/InformacoesCard.svelte
function InformacoesCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let fotoExibida, classeForma, agendamentosComFoto, semanasHeatmap, rotulosMeses;
		let usuarioId = fallback($$props["usuarioId"], null);
		let cargo = fallback($$props["cargo"], "");
		let subtitulo = fallback($$props["subtitulo"], "Detalhes do Item");
		let tituloDados = fallback($$props["tituloDados"], "Dados");
		let tituloEstatisticas = fallback($$props["tituloEstatisticas"], "Estatísticas");
		let tituloAgendamentos = fallback($$props["tituloAgendamentos"], "Agendamentos");
		let textoGradeVazia = fallback($$props["textoGradeVazia"], "Nenhum horário cadastrado.");
		let textoSemItem = fallback($$props["textoSemItem"], "Selecione um item acima para ver os detalhes.");
		let textoSemItemEstatisticas = fallback($$props["textoSemItemEstatisticas"], "Selecione um item para ver as estatísticas.");
		let mostrarSeletor = fallback($$props["mostrarSeletor"], true);
		let tipo = fallback($$props["tipo"], "sala");
		let onTipoChange = fallback($$props["onTipoChange"], null);
		let itensDisponiveis = fallback($$props["itensDisponiveis"], () => [], true);
		let carregandoItens = fallback($$props["carregandoItens"], false);
		let itemSelecionadoId = fallback($$props["itemSelecionadoId"], null);
		let onItemChange = fallback($$props["onItemChange"], null);
		let item = fallback($$props["item"], null);
		let carregandoItem = fallback($$props["carregandoItem"], false);
		let onSalvarPerfil = fallback($$props["onSalvarPerfil"], null);
		let responsabilidades = fallback($$props["responsabilidades"], null);
		let estatisticas = fallback($$props["estatisticas"], () => ({
			resumo: [],
			destaques: [],
			heatmap: []
		}), true);
		let carregandoEstatisticas = fallback($$props["carregandoEstatisticas"], false);
		let mostrarGrade = fallback($$props["mostrarGrade"], false);
		let tituloGrade = fallback($$props["tituloGrade"], "Grade de Aulas");
		let blocos = fallback($$props["blocos"], () => [], true);
		let carregandoBlocos = fallback($$props["carregandoBlocos"], false);
		let mostrarTurmaGrade = fallback($$props["mostrarTurmaGrade"], true);
		let agendamentos = fallback($$props["agendamentos"], () => [], true);
		let carregandoAgendamentos = fallback($$props["carregandoAgendamentos"], false);
		let erro = fallback($$props["erro"], "");
		let onSair = $$props["onSair"];
		let onDeletar = fallback($$props["onDeletar"], null);
		let agendamentoParaDeletar = null;
		let processando = false;
		const dias = [
			"segunda",
			"terca",
			"quarta",
			"quinta",
			"sexta",
			"sabado",
			"domingo"
		];
		const NOMES_MESES = [
			"Jan",
			"Fev",
			"Mar",
			"Abr",
			"Mai",
			"Jun",
			"Jul",
			"Ago",
			"Set",
			"Out",
			"Nov",
			"Dez"
		];
		let anoSelecionado = (/* @__PURE__ */ new Date()).getFullYear();
		function abrirModal(ag) {
			if (processando) return;
			agendamentoParaDeletar = ag;
		}
		function fecharModal() {
			if (processando) return;
			agendamentoParaDeletar = null;
		}
		async function confirmarDelecao(ag) {
			if (processando) return;
			processando = true;
			try {
				await onDeletar?.(ag);
				agendamentoParaDeletar = null;
			} catch (e) {
				erro = e?.message || "Erro ao deletar agendamento.";
			} finally {
				processando = false;
			}
		}
		function iniciais(nome) {
			if (!nome) return "?";
			return nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
		}
		let editandoPerfil = false;
		let fotoPreview = "";
		function limparPreview() {
			if (fotoPreview) URL.revokeObjectURL(fotoPreview);
			fotoPreview = "";
		}
		onDestroy(limparPreview);
		function nivelHeatmap(quantidade) {
			if (!quantidade) return 0;
			if (quantidade === 1) return 1;
			if (quantidade === 2) return 2;
			if (quantidade <= 4) return 3;
			return 4;
		}
		function montarSemanas(heatmap, ano) {
			const mapa = new Map((heatmap || []).map((h) => [h.data, h.quantidade]));
			const inicioAno = new Date(ano, 0, 1);
			const fimAno = new Date(ano, 11, 31);
			const inicio = new Date(inicioAno);
			inicio.setDate(inicio.getDate() - inicio.getDay());
			const fim = new Date(fimAno);
			fim.setDate(fim.getDate() + (6 - fim.getDay()));
			const diasArr = [];
			const cursor = new Date(inicio);
			while (cursor <= fim) {
				const chave = cursor.toISOString().slice(0, 10);
				diasArr.push({
					data: chave,
					dia: cursor.getDate(),
					mes: cursor.getMonth(),
					foraDoAno: cursor.getFullYear() !== ano,
					quantidade: mapa.get(chave) || 0
				});
				cursor.setDate(cursor.getDate() + 1);
			}
			const semanas = [];
			for (let i = 0; i < diasArr.length; i += 7) semanas.push(diasArr.slice(i, i + 7));
			return semanas;
		}
		$: fotoExibida = item?.fotoUrl || "";
		$: classeForma = item?.formaFoto === "quadrada" ? "foto-quadrada" : "foto-circular";
		$: agendamentosComFoto = mostrarSeletor && tipo !== "usuario" && item?.fotoUrl ? agendamentos.map((ag) => ({
			...ag,
			fotoUrl: item.fotoUrl
		})) : agendamentos;
		$: semanasHeatmap = montarSemanas(estatisticas?.heatmap, anoSelecionado);
		$: rotulosMeses = semanasHeatmap.map((semana, idx) => {
			const primeiroDia = semana[0];
			if (!primeiroDia) return "";
			if (idx === 0) return NOMES_MESES[primeiroDia.mes];
			const mesAnterior = semanasHeatmap[idx - 1][0]?.mes;
			return primeiroDia.mes !== mesAnterior ? NOMES_MESES[primeiroDia.mes] : "";
		});
		ConfirmarDelecaoModal($$renderer, {
			agendamento: agendamentoParaDeletar,
			onConfirmar: confirmarDelecao,
			onCancelar: fecharModal,
			processando
		});
		$$renderer.push(`<!----> <div${attr_class("informacoes", void 0, {
			"minhas-informacoes": !mostrarSeletor,
			"item-informacoes": mostrarSeletor
		})}><div class="scaffold">`);
		CabecalhoGlobal($$renderer, {
			titulo: "Portal de Agendamento",
			subtitulo,
			cargo,
			onVoltar: onSair
		});
		$$renderer.push(`<!----> <main class="page-content">`);
		if (erro) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="msg-erro">${escape_html(erro)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (mostrarSeletor) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card seletor-card"><div class="seletor-item"><select class="seletor-dropdown"${attr("disabled", carregandoItens, true)}>`);
			$$renderer.option({
				value: "",
				disabled: true,
				selected: itemSelecionadoId == null || itemSelecionadoId === ""
			}, ($$renderer) => {
				$$renderer.push(`Selecionar item`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array = ensure_array_like(itensDisponiveis);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let it = each_array[$$index];
				$$renderer.option({
					value: String(it.id),
					selected: String(it.id) === String(itemSelecionadoId)
				}, ($$renderer) => {
					$$renderer.push(`${escape_html(it.nome)}`);
				});
			}
			$$renderer.push(`<!--]--></select> <div class="seletor-tipos"><button type="button"${attr_class("btn-tipo", void 0, { "ativo": tipo === "sala" })}><span class="material-symbols-outlined">meeting_room</span> Salas</button> <button type="button"${attr_class("btn-tipo", void 0, { "ativo": tipo === "equipamento" })}><span class="material-symbols-outlined">devices</span> Equipamentos</button> <button type="button"${attr_class("btn-tipo", void 0, { "ativo": tipo === "usuario" })}><span class="material-symbols-outlined">person</span> Usuários</button></div></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="card" id="dados"><div class="card-header"><span class="material-symbols-outlined">info</span> <h3>${escape_html(tituloDados)}</h3> `);
		if (item && !carregandoItem && onSalvarPerfil) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button type="button" class="btn-editar-perfil"><span class="material-symbols-outlined">edit</span> Editar</button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		if (carregandoItem) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Carregando dados...</p>`);
		} else if (!item) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="estado-vazio">${escape_html(textoSemItem)}</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attr_class("item-conteudo", void 0, { "editando": editandoPerfil })}><div class="perfil-foto-area">`);
			if (fotoExibida) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<img${attr_class(`item-foto ${stringify(classeForma)}`)}${attr("src", fotoExibida)}${attr("alt", `Foto de ${stringify(item.nome)}`)}/>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div${attr_class(`item-foto-placeholder ${stringify(classeForma)}`)}>${escape_html(iniciais(item.nome))}</div>`);
			}
			$$renderer.push(`<!--]--> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="item-dados">`);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="item-nome-linha"><p class="item-nome">${escape_html(item.nome)}</p> `);
			if (item.status === false) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="badge-inativo">Inativo</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
			$$renderer.push(`<!--]--> <!--[-->`);
			const each_array_1 = ensure_array_like(item.campos);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let campo = each_array_1[$$index_1];
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="perfil-info-linha"><span class="material-symbols-outlined">${escape_html(campo.icone)}</span> ${escape_html(campo.label)}: ${escape_html(campo.valor)}</div>`);
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div></div> `);
			if (responsabilidades) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="responsabilidades"><!--[-->`);
				const each_array_2 = ensure_array_like(responsabilidades);
				for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
					let bloco = each_array_2[$$index_3];
					$$renderer.push(`<div class="responsabilidade-bloco"><span class="responsabilidade-titulo"><span class="material-symbols-outlined">${escape_html(bloco.icone)}</span> ${escape_html(bloco.titulo)}</span> `);
					if (bloco.itens.length) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="chips"><!--[-->`);
						const each_array_3 = ensure_array_like(bloco.itens);
						for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
							let r = each_array_3[$$index_2];
							$$renderer.push(`<span class="chip">${escape_html(r.nome)}</span>`);
						}
						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<span class="responsabilidade-vazio">${escape_html(bloco.vazio)}</span>`);
					}
					$$renderer.push(`<!--]--></div>`);
				}
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div> <div class="card" id="estatisticas"><div class="card-header"><span class="material-symbols-outlined">query_stats</span> <h3>${escape_html(tituloEstatisticas)}</h3></div> `);
		if (carregandoEstatisticas) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Carregando estatísticas...</p>`);
		} else if (!item) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="estado-vazio">${escape_html(textoSemItemEstatisticas)}</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="estatisticas-resumo"><!--[-->`);
			const each_array_4 = ensure_array_like(estatisticas.resumo);
			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let r = each_array_4[$$index_4];
				$$renderer.push(`<div class="estatistica-item"><span class="estatistica-valor">${escape_html(r.valor)}</span> <span class="estatistica-label">${escape_html(r.label)}</span></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="estatisticas-destaques"><!--[-->`);
			const each_array_5 = ensure_array_like(estatisticas.destaques);
			for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
				let d = each_array_5[$$index_5];
				$$renderer.push(`<div class="destaque-item"><div class="destaque-icone"><span class="material-symbols-outlined">${escape_html(d.icone)}</span></div> <div class="destaque-texto"><span class="destaque-label">${escape_html(d.label)}</span> <span class="destaque-valor">${escape_html(d.valor)}</span></div></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="heatmap-header"><button class="heatmap-nav-btn" title="Ano anterior"><span class="material-symbols-outlined">chevron_left</span></button> <button class="heatmap-ano-btn" title="Ir para o ano atual">${escape_html(anoSelecionado)}</button> <button class="heatmap-nav-btn" title="Próximo ano"><span class="material-symbols-outlined">chevron_right</span></button></div> <div class="heatmap-wrapper"><div class="heatmap-meses"><!--[-->`);
			const each_array_6 = ensure_array_like(rotulosMeses);
			for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
				let rotulo = each_array_6[$$index_6];
				$$renderer.push(`<span class="heatmap-mes-label">${escape_html(rotulo)}</span>`);
			}
			$$renderer.push(`<!--]--></div> <div class="heatmap-grid"><!--[-->`);
			const each_array_7 = ensure_array_like(semanasHeatmap);
			for (let $$index_8 = 0, $$length = each_array_7.length; $$index_8 < $$length; $$index_8++) {
				let semana = each_array_7[$$index_8];
				$$renderer.push(`<!--[-->`);
				const each_array_8 = ensure_array_like(semana);
				for (let $$index_7 = 0, $$length = each_array_8.length; $$index_7 < $$length; $$index_7++) {
					let dia = each_array_8[$$index_7];
					$$renderer.push(`<div${attr_class(`heatmap-dia nivel-${stringify(nivelHeatmap(dia.quantidade))}`, void 0, { "fora-do-ano": dia.foraDoAno })}${attr("title", `${stringify(dia.data)}: ${stringify(dia.quantidade)} agendamento(s)`)}></div>`);
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div> <div class="heatmap-legenda"><span>Menos</span> <div class="heatmap-dia nivel-0"></div> <div class="heatmap-dia nivel-1"></div> <div class="heatmap-dia nivel-2"></div> <div class="heatmap-dia nivel-3"></div> <div class="heatmap-dia nivel-4"></div> <span>Mais</span></div></div>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (mostrarGrade) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card" id="grade"><div class="card-header"><span class="material-symbols-outlined">calendar_month</span> <h3>${escape_html(tituloGrade)}</h3></div> `);
			if (blocos.length === 0 && !carregandoBlocos) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="estado-vazio">${escape_html(textoGradeVazia)}</p>`);
			} else {
				$$renderer.push("<!--[-1-->");
				GradeSemanal($$renderer, {
					dias,
					blocos,
					carregandoLista: carregandoBlocos,
					children: invalid_default_snippet,
					$$slots: { default: ($$renderer, { bloco }) => {
						BlocoHorarioCard($$renderer, {
							bloco,
							mostrarTurma: mostrarTurmaGrade
						});
					} }
				});
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (item) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card" id="agendamentos"><div class="card-header"><span class="material-symbols-outlined">event_available</span> <h3>${escape_html(tituloAgendamentos)}</h3></div> `);
			ListaAgendamentosCard($$renderer, {
				agendamentos: agendamentosComFoto,
				carregando: carregandoAgendamentos,
				usuarioId,
				cargo,
				onDeletar: abrirModal
			});
			$$renderer.push(`<!----></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></main></div></div>`);
		bind_props($$props, {
			usuarioId,
			cargo,
			subtitulo,
			tituloDados,
			tituloEstatisticas,
			tituloAgendamentos,
			textoGradeVazia,
			textoSemItem,
			textoSemItemEstatisticas,
			mostrarSeletor,
			tipo,
			onTipoChange,
			itensDisponiveis,
			carregandoItens,
			itemSelecionadoId,
			onItemChange,
			item,
			carregandoItem,
			onSalvarPerfil,
			responsabilidades,
			estatisticas,
			carregandoEstatisticas,
			mostrarGrade,
			tituloGrade,
			blocos,
			carregandoBlocos,
			mostrarTurmaGrade,
			agendamentos,
			carregandoAgendamentos,
			erro,
			onSair,
			onDeletar
		});
	});
}
//#endregion
export { InformacoesCard as t };
