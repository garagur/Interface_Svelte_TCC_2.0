import "../../../chunks/internal.js";
import { S as escape_html, c as stringify, i as ensure_array_like, n as bind_props, ot as fallback, t as attr_class, tt as invalid_default_snippet, x as attr } from "../../../chunks/server.js";
import { t as goto } from "../../../chunks/client.js";
import "../../../chunks/navigation.js";
import "../../../chunks/api.js";
import "../../../chunks/User_Endpoints.js";
import { a as BlocoHorarioCard, o as GradeSemanal } from "../../../chunks/List_Horario_Service.js";
import { a as deletarAgendamentoSala, r as deletarAgendamentoEquipamento, s as ConfirmarDelecaoModal } from "../../../chunks/List_Agendamento_Equipamento_Service.js";
//#region src/lib/components/meusagendamentos/MinhasInformacoesCard.svelte
function MinhasInformacoesCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let semanasHeatmap, rotulosMeses, totalGeral, agendamentosOrdenados;
		let usuario = fallback($$props["usuario"], null);
		let carregandoUsuario = fallback($$props["carregandoUsuario"], false);
		let estatisticas = fallback($$props["estatisticas"], () => ({
			totalSala: 0,
			totalEquipamento: 0,
			salaMaisAgendada: null,
			equipamentoMaisAgendado: null,
			heatmap: []
		}), true);
		let carregandoEstatisticas = fallback($$props["carregandoEstatisticas"], false);
		let blocos = fallback($$props["blocos"], () => [], true);
		let agendamentos = fallback($$props["agendamentos"], () => [], true);
		let carregandoBlocos = fallback($$props["carregandoBlocos"], false);
		let carregandoAgendamentos = fallback($$props["carregandoAgendamentos"], false);
		let erro = fallback($$props["erro"], "");
		let onSair = $$props["onSair"];
		let onDeletar = fallback($$props["onDeletar"], null);
		let agendamentoParaDeletar = null;
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
		function formatarDataHora(iso) {
			if (!iso) return "—";
			const d = new Date(iso);
			return `${d.toLocaleDateString("pt-BR", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric"
			})} às ${d.toLocaleTimeString("pt-BR", {
				hour: "2-digit",
				minute: "2-digit"
			})}`;
		}
		function isFuturo(iso) {
			if (!iso) return false;
			return new Date(iso) >= /* @__PURE__ */ new Date();
		}
		/**
		* Determina o status de exibição do agendamento.
		* @param {any} ag
		* @returns {"cancelado" | "futuro" | "passado"}
		*/
		function statusExibicao(ag) {
			if (ag.status === "inativo") return "cancelado";
			return isFuturo(ag.data_hora_inicio) ? "futuro" : "passado";
		}
		function rotuloStatus(status) {
			if (status === "cancelado") return "Cancelado";
			if (status === "futuro") return "Agendado";
			return "Concluído";
		}
		function fecharModal() {
			agendamentoParaDeletar = null;
		}
		function confirmarDelecao(ag) {
			fecharModal();
			onDeletar?.(ag);
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
		$: totalGeral = (estatisticas?.totalSala || 0) + (estatisticas?.totalEquipamento || 0);
		$: agendamentosOrdenados = [...agendamentos].sort((a, b) => {
			const fa = isFuturo(a.data_hora_inicio);
			const fb = isFuturo(b.data_hora_inicio);
			if (fa !== fb) return fb ? 1 : -1;
			return new Date(a.data_hora_inicio).getTime() - new Date(b.data_hora_inicio).getTime();
		});
		ConfirmarDelecaoModal($$renderer, {
			agendamento: agendamentoParaDeletar,
			onConfirmar: confirmarDelecao,
			onCancelar: fecharModal
		});
		$$renderer.push(`<!----> <div class="minhas-informacoes"><div class="scaffold"><header class="app-bar"><div class="title-section"><h1>Portal de Agendamento</h1> <span>Meu Perfil</span></div> <button class="btn-icon" title="Voltar"><span class="material-symbols-outlined">arrow_back</span></button></header> <main class="page-content">`);
		if (erro) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="msg-erro">${escape_html(erro)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="card" id="dados"><div class="card-header"><span class="material-symbols-outlined">person</span> <h3>Meus Dados</h3></div> `);
		if (carregandoUsuario) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Carregando dados do usuário...</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="perfil-conteudo">`);
			if (usuario?.foto_url) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<img class="perfil-foto"${attr("src", usuario.foto_url)} alt="Foto de perfil"/>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="perfil-foto-placeholder">${escape_html(iniciais(usuario?.nome))}</div>`);
			}
			$$renderer.push(`<!--]--> <div class="perfil-dados"><p class="perfil-nome">${escape_html(usuario?.nome || "—")}</p> <div class="perfil-info-linha"><span class="material-symbols-outlined">mail</span> ${escape_html(usuario?.email || "—")}</div> <div class="perfil-info-linha"><span class="material-symbols-outlined">badge</span> Matrícula: ${escape_html(usuario?.matricula || "—")}</div></div></div>`);
		}
		$$renderer.push(`<!--]--></div> <div class="card" id="estatisticas"><div class="card-header"><span class="material-symbols-outlined">query_stats</span> <h3>Minhas Estatísticas</h3></div> `);
		if (carregandoEstatisticas) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Carregando estatísticas...</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="estatisticas-resumo"><div class="estatistica-item"><span class="estatistica-valor">${escape_html(estatisticas.totalSala)}</span> <span class="estatistica-label">Salas agendadas</span></div> <div class="estatistica-item"><span class="estatistica-valor">${escape_html(estatisticas.totalEquipamento)}</span> <span class="estatistica-label">Equipamentos agendados</span></div> <div class="estatistica-item"><span class="estatistica-valor">${escape_html(totalGeral)}</span> <span class="estatistica-label">Total geral</span></div></div> <div class="estatisticas-destaques"><div class="destaque-item"><div class="destaque-icone"><span class="material-symbols-outlined">meeting_room</span></div> <div class="destaque-texto"><span class="destaque-label">Sala mais agendada</span> <span class="destaque-valor">${escape_html(estatisticas.salaMaisAgendada || "—")}</span></div></div> <div class="destaque-item"><div class="destaque-icone"><span class="material-symbols-outlined">devices</span></div> <div class="destaque-texto"><span class="destaque-label">Equipamento mais agendado</span> <span class="destaque-valor">${escape_html(estatisticas.equipamentoMaisAgendado || "—")}</span></div></div></div> <div class="heatmap-header"><button class="heatmap-nav-btn" title="Ano anterior"><span class="material-symbols-outlined">chevron_left</span></button> <button class="heatmap-ano-btn" title="Ir para o ano atual">${escape_html(anoSelecionado)}</button> <button class="heatmap-nav-btn" title="Próximo ano"><span class="material-symbols-outlined">chevron_right</span></button></div> <div class="heatmap-wrapper"><div class="heatmap-meses"><!--[-->`);
			const each_array = ensure_array_like(rotulosMeses);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let rotulo = each_array[$$index];
				$$renderer.push(`<span class="heatmap-mes-label">${escape_html(rotulo)}</span>`);
			}
			$$renderer.push(`<!--]--></div> <div class="heatmap-grid"><!--[-->`);
			const each_array_1 = ensure_array_like(semanasHeatmap);
			for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
				let semana = each_array_1[$$index_2];
				$$renderer.push(`<!--[-->`);
				const each_array_2 = ensure_array_like(semana);
				for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
					let dia = each_array_2[$$index_1];
					$$renderer.push(`<div${attr_class(`heatmap-dia nivel-${stringify(nivelHeatmap(dia.quantidade))}`, void 0, { "fora-do-ano": dia.foraDoAno })}${attr("title", `${stringify(dia.data)}: ${stringify(dia.quantidade)} agendamento(s)`)}></div>`);
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div> <div class="heatmap-legenda"><span>Menos</span> <div class="heatmap-dia nivel-0"></div> <div class="heatmap-dia nivel-1"></div> <div class="heatmap-dia nivel-2"></div> <div class="heatmap-dia nivel-3"></div> <div class="heatmap-dia nivel-4"></div> <span>Mais</span></div></div>`);
		}
		$$renderer.push(`<!--]--></div> <div class="card" id="grade"><div class="card-header"><span class="material-symbols-outlined">calendar_month</span> <h3>Minha Grade de Aulas</h3></div> `);
		if (blocos.length === 0 && !carregandoBlocos) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Nenhuma aula cadastrada para você.</p>`);
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
						mostrarTurma: true
					});
				} }
			});
		}
		$$renderer.push(`<!--]--></div> <div class="card" id="agendamentos"><div class="card-header"><span class="material-symbols-outlined">event_available</span> <h3>Meus Agendamentos</h3></div> `);
		if (carregandoAgendamentos) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Carregando agendamentos...</p>`);
		} else if (agendamentosOrdenados.length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="estado-vazio">Nenhum agendamento de sala encontrado.</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="agendamentos-lista"><!--[-->`);
			const each_array_3 = ensure_array_like(agendamentosOrdenados);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let ag = each_array_3[$$index_3];
				const status = statusExibicao(ag);
				$$renderer.push(`<div${attr_class("agendamento-item", void 0, { "cancelado": status === "cancelado" })}><div class="agendamento-faixa"></div> <div class="agendamento-body"><div class="agendamento-data-hora"><span class="material-symbols-outlined">schedule</span> ${escape_html(formatarDataHora(ag.data_hora_inicio))}
                                         → 
                                        ${escape_html(formatarDataHora(ag.data_hora_fim))}</div> <div class="agendamento-sala"><span class="material-symbols-outlined">${escape_html(ag.tipo === "equipamento" ? "devices" : "meeting_room")}</span> ${escape_html(ag.tipo === "equipamento" ? ag.equipamento_nome || ag.equipamento_id || "Equipamento não informado" : ag.sala_nome || ag.sala_id || "Sala não informada")}</div> `);
				if (ag.obs) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="agendamento-obs">${escape_html(ag.obs)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (status === "cancelado" && ag.justificativa) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="agendamento-justificativa"><span class="material-symbols-outlined">info</span> Motivo do cancelamento: ${escape_html(ag.justificativa)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (status === "cancelado") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="agendamento-cancelador"><span class="material-symbols-outlined">person</span> Cancelado por:
                                            ${escape_html(ag.cancelador_nome || "Nome não informado")}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <div class="agendamento-status"><span${attr_class(`badge-status ${stringify(status)}`)}>${escape_html(rotuloStatus(status))}</span> `);
				if (status === "futuro" && onDeletar) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<button class="btn-deletar-ag" title="Deletar agendamento"><span class="material-symbols-outlined">delete</span></button>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div></main></div></div>`);
		bind_props($$props, {
			usuario,
			carregandoUsuario,
			estatisticas,
			carregandoEstatisticas,
			blocos,
			agendamentos,
			carregandoBlocos,
			carregandoAgendamentos,
			erro,
			onSair,
			onDeletar
		});
	});
}
//#endregion
//#region src/routes/minhasinformacoes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let token = "";
		let usuario = null;
		let carregandoUsuario = false;
		let blocos = [];
		let agendamentosSala = [];
		let agendamentosEquipamento = [];
		let carregandoBlocos = false;
		let carregandoAgendamentos = false;
		let carregandoEstatisticas = false;
		let erro = "";
		let estatisticas = {
			totalSala: 0,
			totalEquipamento: 0,
			salaMaisAgendada: null,
			equipamentoMaisAgendado: null,
			heatmap: []
		};
		function itemMaisFrequente(lista, campoNome, campoId) {
			const contagem = /* @__PURE__ */ new Map();
			for (const item of lista) {
				const chave = item[campoNome] || item[campoId] || "Não informado";
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
		function montarHeatmap(todos) {
			const contagemPorDia = /* @__PURE__ */ new Map();
			for (const ag of todos) {
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
			const todos = [...agendamentosSala, ...agendamentosEquipamento];
			estatisticas = {
				totalSala: agendamentosSala.length,
				totalEquipamento: agendamentosEquipamento.length,
				salaMaisAgendada: itemMaisFrequente(agendamentosSala, "sala_nome", "sala_id"),
				equipamentoMaisAgendado: itemMaisFrequente(agendamentosEquipamento, "equipamento_nome", "equipamento_id"),
				heatmap: montarHeatmap(todos)
			};
			carregandoEstatisticas = false;
		}
		async function deletar(ag) {
			try {
				if (ag.tipo === "equipamento") await deletarAgendamentoEquipamento(ag.id, token, ag.justificativa || "");
				else await deletarAgendamentoSala(ag.id, token, ag.justificativa || "");
				if (ag.tipo === "equipamento") agendamentosEquipamento = agendamentosEquipamento.filter((a) => a.id !== ag.id);
				else agendamentosSala = agendamentosSala.filter((a) => a.id !== ag.id);
				montarEstatisticas();
			} catch (e) {
				erro = e?.message || "Erro ao deletar agendamento.";
			}
		}
		MinhasInformacoesCard($$renderer, {
			usuario,
			carregandoUsuario,
			estatisticas,
			carregandoEstatisticas,
			blocos,
			agendamentos: [...agendamentosSala, ...agendamentosEquipamento],
			carregandoBlocos,
			carregandoAgendamentos,
			erro,
			onSair: () => goto("/main"),
			onDeletar: deletar
		});
	});
}
//#endregion
export { _page as default };
