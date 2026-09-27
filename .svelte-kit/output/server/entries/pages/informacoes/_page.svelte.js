import "../../../chunks/internal.js";
import { T as escape_html, d as unsubscribe_stores, i as ensure_array_like, it as invalid_default_snippet, lt as fallback, n as bind_props, t as attr_class, u as stringify, w as attr } from "../../../chunks/server.js";
import { t as goto } from "../../../chunks/client.js";
import "../../../chunks/navigation.js";
import { t as carregarEquipamentos } from "../../../chunks/List_Equipamento_Service.js";
import { t as carregarUsuarios } from "../../../chunks/List_User_Service.js";
import { a as BlocoHorarioCard, n as carregarHorariosProfessor, o as GradeSemanal, r as carregarHorariosSala } from "../../../chunks/List_Horario_Service.js";
import { t as carregarSalas } from "../../../chunks/List_Sala_Service.js";
import { a as deletarAgendamentoSala, c as ConfirmarDelecaoModal, n as carregarAgendamentosSalas, r as deletarAgendamentoEquipamento, s as ListaAgendamentosCard, t as carregarAgendamentosEquipamentos } from "../../../chunks/List_Agendamento_Equipamento_Service.js";
import { t as buscarUsuario } from "../../../chunks/Buscar_Usuario_Service.js";
//#endregion
//#region src/lib/components/informacoes_itens/ItemInformacoesCard.svelte
function ItemInformacoesCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let semanasHeatmap, rotulosMeses;
		let tipo = fallback($$props["tipo"], "sala");
		let onTipoChange = fallback($$props["onTipoChange"], null);
		let rotuloSelecionar = fallback($$props["rotuloSelecionar"], "Selecione um item");
		let itensDisponiveis = fallback($$props["itensDisponiveis"], () => [], true);
		let carregandoItens = fallback($$props["carregandoItens"], false);
		let itemSelecionadoId = fallback($$props["itemSelecionadoId"], null);
		let onItemChange = fallback($$props["onItemChange"], null);
		let item = fallback($$props["item"], null);
		let carregandoItem = fallback($$props["carregandoItem"], false);
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
		$$renderer.push(`<!----> <div class="item-informacoes"><div class="scaffold"><header class="app-bar"><div class="title-section"><h1>Portal de Agendamento</h1> <span>Detalhes do Item</span></div> <button class="btn-icon" title="Voltar"><span class="material-symbols-outlined">arrow_back</span></button></header> <main class="page-content">`);
		if (erro) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="msg-erro">${escape_html(erro)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="card seletor-card"><div class="seletor-item">`);
		$$renderer.select({
			class: "seletor-dropdown",
			value: itemSelecionadoId ?? "",
			disabled: carregandoItens
		}, ($$renderer) => {
			$$renderer.option({
				value: "",
				disabled: true,
				selected: !itemSelecionadoId
			}, ($$renderer) => {
				$$renderer.push(`${escape_html(rotuloSelecionar)}`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array = ensure_array_like(itensDisponiveis);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let it = each_array[$$index];
				$$renderer.option({ value: it.id }, ($$renderer) => {
					$$renderer.push(`${escape_html(it.nome)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(` <div class="seletor-tipos"><button type="button"${attr_class("btn-tipo", void 0, { "ativo": tipo === "sala" })}><span class="material-symbols-outlined">meeting_room</span> Salas</button> <button type="button"${attr_class("btn-tipo", void 0, { "ativo": tipo === "equipamento" })}><span class="material-symbols-outlined">devices</span> Equipamentos</button> <button type="button"${attr_class("btn-tipo", void 0, { "ativo": tipo === "usuario" })}><span class="material-symbols-outlined">person</span> Usuários</button></div></div></div> <div class="card" id="dados"><div class="card-header"><span class="material-symbols-outlined">info</span> <h3>Dados</h3></div> `);
		if (carregandoItem) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Carregando dados...</p>`);
		} else if (!item) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="estado-vazio">Selecione um item acima para ver os detalhes.</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="item-conteudo"><div class="item-foto-area">`);
			if (item.fotoUrl) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<img${attr_class(`item-foto ${item.formaFoto === "quadrada" ? "foto-quadrada" : "foto-circular"}`)}${attr("src", item.fotoUrl)}${attr("alt", `Foto de ${stringify(item.nome)}`)}/>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div${attr_class(`item-foto-placeholder ${item.formaFoto === "quadrada" ? "foto-quadrada" : "foto-circular"}`)}>${escape_html(iniciais(item.nome))}</div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="item-dados"><div class="item-nome-linha"><p class="item-nome">${escape_html(item.nome)}</p> `);
			if (item.status === false) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="badge-inativo">Inativo</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <!--[-->`);
			const each_array_1 = ensure_array_like(item.campos);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let campo = each_array_1[$$index_1];
				$$renderer.push(`<div class="perfil-info-linha"><span class="material-symbols-outlined">${escape_html(campo.icone)}</span> ${escape_html(campo.label)}: ${escape_html(campo.valor)}</div>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]--></div> <div class="card" id="estatisticas"><div class="card-header"><span class="material-symbols-outlined">query_stats</span> <h3>Estatísticas</h3></div> `);
		if (carregandoEstatisticas) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Carregando estatísticas...</p>`);
		} else if (!item) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="estado-vazio">Selecione um item para ver as estatísticas.</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="estatisticas-resumo"><!--[-->`);
			const each_array_2 = ensure_array_like(estatisticas.resumo);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let r = each_array_2[$$index_2];
				$$renderer.push(`<div class="estatistica-item"><span class="estatistica-valor">${escape_html(r.valor)}</span> <span class="estatistica-label">${escape_html(r.label)}</span></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="estatisticas-destaques"><!--[-->`);
			const each_array_3 = ensure_array_like(estatisticas.destaques);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let d = each_array_3[$$index_3];
				$$renderer.push(`<div class="destaque-item"><div class="destaque-icone"><span class="material-symbols-outlined">${escape_html(d.icone)}</span></div> <div class="destaque-texto"><span class="destaque-label">${escape_html(d.label)}</span> <span class="destaque-valor">${escape_html(d.valor)}</span></div></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="heatmap-header"><button class="heatmap-nav-btn" title="Ano anterior"><span class="material-symbols-outlined">chevron_left</span></button> <button class="heatmap-ano-btn" title="Ir para o ano atual">${escape_html(anoSelecionado)}</button> <button class="heatmap-nav-btn" title="Próximo ano"><span class="material-symbols-outlined">chevron_right</span></button></div> <div class="heatmap-wrapper"><div class="heatmap-meses"><!--[-->`);
			const each_array_4 = ensure_array_like(rotulosMeses);
			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let rotulo = each_array_4[$$index_4];
				$$renderer.push(`<span class="heatmap-mes-label">${escape_html(rotulo)}</span>`);
			}
			$$renderer.push(`<!--]--></div> <div class="heatmap-grid"><!--[-->`);
			const each_array_5 = ensure_array_like(semanasHeatmap);
			for (let $$index_6 = 0, $$length = each_array_5.length; $$index_6 < $$length; $$index_6++) {
				let semana = each_array_5[$$index_6];
				$$renderer.push(`<!--[-->`);
				const each_array_6 = ensure_array_like(semana);
				for (let $$index_5 = 0, $$length = each_array_6.length; $$index_5 < $$length; $$index_5++) {
					let dia = each_array_6[$$index_5];
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
				$$renderer.push(`<p class="estado-vazio">Nenhum horário cadastrado.</p>`);
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
			$$renderer.push(`<div class="card" id="agendamentos"><div class="card-header"><span class="material-symbols-outlined">event_available</span> <h3>Agendamentos</h3></div> `);
			ListaAgendamentosCard($$renderer, {
				agendamentos,
				carregando: carregandoAgendamentos,
				onDeletar: abrirModal
			});
			$$renderer.push(`<!----></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></main></div></div>`);
		bind_props($$props, {
			tipo,
			onTipoChange,
			rotuloSelecionar,
			itensDisponiveis,
			carregandoItens,
			itemSelecionadoId,
			onItemChange,
			item,
			carregandoItem,
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
//#region src/routes/informacoes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let agendamentos;
		const ROTULOS_CARGO = {
			admin: "Administrador",
			servidor: "Servidor",
			educador: "Educador"
		};
		const ROTULOS_TIPO = {
			sala: "Selecione uma sala",
			equipamento: "Selecione um equipamento",
			usuario: "Selecione um usuário"
		};
		let token = "";
		let tipo = "sala";
		let itensDisponiveis = [];
		let carregandoItens = false;
		let salasCache = [];
		let equipamentosCache = [];
		let idSelecionado = null;
		let usuarioBruto = null;
		let item = null;
		let carregandoItem = false;
		let blocos = [];
		let carregandoBlocos = false;
		let mostrarGrade = false;
		let tituloGrade = "Grade de Aulas";
		let mostrarTurmaGrade = true;
		let agendamentosSalaItem = [];
		let agendamentosEquipamentoItem = [];
		let carregandoAgendamentos = false;
		let estatisticas = {
			resumo: [],
			destaques: [],
			heatmap: []
		};
		let carregandoEstatisticas = false;
		let erro = "";
		async function carregarListaItens(tipoAlvo) {
			carregandoItens = true;
			try {
				if (tipoAlvo === "sala") {
					salasCache = await carregarSalas(token);
					itensDisponiveis = salasCache.map((s) => ({
						id: s.id,
						nome: s.nome
					}));
				} else if (tipoAlvo === "equipamento") {
					equipamentosCache = await carregarEquipamentos(token);
					itensDisponiveis = equipamentosCache.map((e) => ({
						id: e.id,
						nome: e.nome
					}));
				} else itensDisponiveis = (await carregarUsuarios(token)).map((u) => ({
					id: u.id,
					nome: u.nome
				}));
			} catch (e) {
				erro = e?.message || "Erro ao carregar a lista.";
			} finally {
				carregandoItens = false;
			}
		}
		async function selecionarTipo(novoTipo) {
			if (novoTipo === tipo) return;
			tipo = novoTipo;
			idSelecionado = null;
			item = null;
			usuarioBruto = null;
			blocos = [];
			mostrarGrade = false;
			agendamentosSalaItem = [];
			agendamentosEquipamentoItem = [];
			estatisticas = {
				resumo: [],
				destaques: [],
				heatmap: []
			};
			await carregarListaItens(tipo);
		}
		async function selecionarItem(novoId) {
			if (!novoId) return;
			idSelecionado = novoId;
			await carregarDetalhesItem();
		}
		async function carregarDetalhesItem() {
			carregandoItem = true;
			try {
				if (tipo === "usuario") {
					usuarioBruto = await buscarUsuario(token, idSelecionado);
					item = usuarioBruto && {
						id: usuarioBruto.id,
						nome: usuarioBruto.nome,
						fotoUrl: usuarioBruto.foto_url,
						formaFoto: "circular",
						status: usuarioBruto.status,
						campos: [
							{
								icone: "mail",
								label: "E-mail",
								valor: usuarioBruto.email || "—"
							},
							{
								icone: "badge",
								label: "Matrícula",
								valor: usuarioBruto.matricula || "—"
							},
							{
								icone: "work",
								label: "Cargo",
								valor: ROTULOS_CARGO[usuarioBruto.cargo] || usuarioBruto.cargo || "—"
							}
						]
					};
				} else if (tipo === "sala") {
					const sala = salasCache.find((s) => String(s.id) === String(idSelecionado));
					usuarioBruto = null;
					item = sala && {
						id: sala.id,
						nome: sala.nome,
						fotoUrl: sala.fotoUrl,
						formaFoto: "quadrada",
						status: sala.status,
						campos: [{
							icone: "person",
							label: "Responsável",
							valor: sala.responsavel_nome || "—"
						}, {
							icone: "sticky_note_2",
							label: "Observações",
							valor: sala.obs || "—"
						}]
					};
				} else {
					const equipamento = equipamentosCache.find((e) => String(e.id) === String(idSelecionado));
					usuarioBruto = null;
					item = equipamento && {
						id: equipamento.id,
						nome: equipamento.nome,
						fotoUrl: equipamento.fotoUrl,
						formaFoto: "quadrada",
						status: equipamento.status,
						campos: [
							{
								icone: "tag",
								label: "Nº Patrimônio",
								valor: equipamento.N_patrimonio || "—"
							},
							{
								icone: "person",
								label: "Responsável",
								valor: equipamento.responsavel_nome || "—"
							},
							{
								icone: "sticky_note_2",
								label: "Observações",
								valor: equipamento.obs || "—"
							}
						]
					};
				}
				await carregarGradeEAgendamentos();
			} catch (e) {
				erro = e?.message || "Erro ao carregar dados do item.";
			} finally {
				carregandoItem = false;
			}
		}
		async function carregarGradeEAgendamentos() {
			carregandoBlocos = true;
			carregandoAgendamentos = true;
			carregandoEstatisticas = true;
			try {
				if (tipo === "usuario") {
					if (usuarioBruto?.cargo === "educador") {
						blocos = await carregarHorariosProfessor(token, idSelecionado);
						mostrarGrade = true;
						tituloGrade = "Grade de Aulas";
						mostrarTurmaGrade = true;
					} else {
						blocos = [];
						mostrarGrade = false;
					}
					const [todasSalas, todosEquipamentos] = await Promise.all([carregarAgendamentosSalas(token, null), carregarAgendamentosEquipamentos(token)]);
					agendamentosSalaItem = todasSalas.filter((a) => String(a.user_id) === String(idSelecionado));
					agendamentosEquipamentoItem = todosEquipamentos.filter((a) => String(a.user_id) === String(idSelecionado));
				} else if (tipo === "sala") {
					blocos = await carregarHorariosSala(token, idSelecionado);
					mostrarGrade = true;
					tituloGrade = "Grade de Aulas da Sala";
					mostrarTurmaGrade = true;
					agendamentosSalaItem = await carregarAgendamentosSalas(token, idSelecionado);
					agendamentosEquipamentoItem = [];
				} else {
					blocos = [];
					mostrarGrade = false;
					agendamentosEquipamentoItem = (await carregarAgendamentosEquipamentos(token)).filter((a) => String(a.equipamento_id) === String(idSelecionado));
					agendamentosSalaItem = [];
				}
				montarEstatisticas();
			} catch (e) {
				erro = e?.message || "Erro ao carregar grade e agendamentos.";
			} finally {
				carregandoBlocos = false;
				carregandoAgendamentos = false;
			}
		}
		function itemMaisFrequente(lista, campoNome, campoId) {
			const contagem = /* @__PURE__ */ new Map();
			for (const it of lista) {
				const chave = it[campoNome] || it[campoId] || "Não informado";
				contagem.set(chave, (contagem.get(chave) || 0) + 1);
			}
			let maisFrequente = null;
			let maiorQtd = 0;
			for (const [chave, qtd] of contagem) if (qtd > maiorQtd) {
				maiorQtd = qtd;
				maisFrequente = chave;
			}
			return maisFrequente;
		}
		function montarHeatmap(lista) {
			const contagemPorDia = /* @__PURE__ */ new Map();
			for (const ag of lista) {
				if (!ag.data_hora_inicio) continue;
				const chave = new Date(ag.data_hora_inicio).toISOString().slice(0, 10);
				contagemPorDia.set(chave, (contagemPorDia.get(chave) || 0) + 1);
			}
			return Array.from(contagemPorDia.entries()).map(([data, quantidade]) => ({
				data,
				quantidade
			}));
		}
		function montarEstatisticas() {
			if (tipo === "usuario") {
				const salasAtivas = agendamentosSalaItem.filter((a) => a.status !== "inativo");
				const equipamentosAtivos = agendamentosEquipamentoItem.filter((a) => a.status !== "inativo");
				const totalGeral = salasAtivas.length + equipamentosAtivos.length;
				estatisticas = {
					resumo: [
						{
							valor: salasAtivas.length,
							label: "Salas agendadas"
						},
						{
							valor: equipamentosAtivos.length,
							label: "Equipamentos agendados"
						},
						{
							valor: totalGeral,
							label: "Total geral"
						}
					],
					destaques: [{
						icone: "meeting_room",
						label: "Sala mais agendada",
						valor: itemMaisFrequente(salasAtivas, "sala_nome", "sala_id") || "—"
					}, {
						icone: "devices",
						label: "Equipamento mais agendado",
						valor: itemMaisFrequente(equipamentosAtivos, "equipamento_nome", "equipamento_id") || "—"
					}],
					heatmap: montarHeatmap([...salasAtivas, ...equipamentosAtivos])
				};
			} else if (tipo === "sala") {
				const ativos = agendamentosSalaItem.filter((a) => a.status !== "inativo");
				estatisticas = {
					resumo: [{
						valor: ativos.length,
						label: "Agendamentos ativos"
					}, {
						valor: agendamentosSalaItem.length,
						label: "Total histórico"
					}],
					destaques: [{
						icone: "person",
						label: "Usuário mais frequente",
						valor: itemMaisFrequente(ativos, "usuario_nome", "user_id") || "—"
					}],
					heatmap: montarHeatmap(ativos)
				};
			} else {
				const ativos = agendamentosEquipamentoItem.filter((a) => a.status !== "inativo");
				estatisticas = {
					resumo: [{
						valor: ativos.length,
						label: "Agendamentos ativos"
					}, {
						valor: agendamentosEquipamentoItem.length,
						label: "Total histórico"
					}],
					destaques: [{
						icone: "person",
						label: "Usuário mais frequente",
						valor: itemMaisFrequente(ativos, "usuario_nome", "user_id") || "—"
					}],
					heatmap: montarHeatmap(ativos)
				};
			}
			carregandoEstatisticas = false;
		}
		async function deletar(ag) {
			try {
				if (ag.tipo === "equipamento") {
					await deletarAgendamentoEquipamento(ag.id, token, ag.justificativa || "");
					agendamentosEquipamentoItem = agendamentosEquipamentoItem.map((a) => a.id === ag.id ? {
						...a,
						status: "inativo",
						justificativa: ag.justificativa || ""
					} : a);
				} else {
					await deletarAgendamentoSala(ag.id, token, ag.justificativa || "");
					agendamentosSalaItem = agendamentosSalaItem.map((a) => a.id === ag.id ? {
						...a,
						status: "inativo",
						justificativa: ag.justificativa || ""
					} : a);
				}
				montarEstatisticas();
			} catch (e) {
				erro = e?.message || "Erro ao deletar agendamento.";
				throw e;
			}
		}
		$: agendamentos = [...agendamentosSalaItem, ...agendamentosEquipamentoItem];
		ItemInformacoesCard($$renderer, {
			tipo,
			onTipoChange: selecionarTipo,
			rotuloSelecionar: ROTULOS_TIPO[tipo],
			itensDisponiveis,
			carregandoItens,
			itemSelecionadoId: idSelecionado,
			onItemChange: selecionarItem,
			item,
			carregandoItem,
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
			onSair: () => goto("/main"),
			onDeletar: deletar
		});
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
