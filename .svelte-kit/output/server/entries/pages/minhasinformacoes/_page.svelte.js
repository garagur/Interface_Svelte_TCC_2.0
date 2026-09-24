import { i as onDestroy } from "../../../chunks/internal.js";
import { S as escape_html, c as stringify, i as ensure_array_like, n as bind_props, ot as fallback, t as attr_class, tt as invalid_default_snippet, x as attr } from "../../../chunks/server.js";
import { t as goto } from "../../../chunks/client.js";
import "../../../chunks/navigation.js";
import "../../../chunks/api.js";
import "../../../chunks/User_Endpoints.js";
import { a as BlocoHorarioCard, o as GradeSemanal } from "../../../chunks/List_Horario_Service.js";
import { t as atualizarUsuario } from "../../../chunks/Update_User_Service.js";
import { a as deletarAgendamentoSala, c as ConfirmarDelecaoModal, r as deletarAgendamentoEquipamento, s as ListaAgendamentosCard } from "../../../chunks/List_Agendamento_Equipamento_Service.js";
//#region src/lib/components/meusagendamentos/MinhasInformacoesCard.svelte
function MinhasInformacoesCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let fotoExibida, semanasHeatmap, rotulosMeses, totalGeral;
		let usuario = fallback($$props["usuario"], null);
		let carregandoUsuario = fallback($$props["carregandoUsuario"], false);
		let salasResponsavel = fallback($$props["salasResponsavel"], null);
		let equipamentosResponsavel = fallback($$props["equipamentosResponsavel"], null);
		let onSalvarPerfil = fallback($$props["onSalvarPerfil"], null);
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
		/**
		* Normaliza o tipo do agendamento ("sala" | "equipamento").
		* @param {any} ag
		*/
		function tipoAgendamento(ag) {
			return ag.tipo === "equipamento" ? "equipamento" : "sala";
		}
		/**
		* Nome de exibição do recurso agendado, usado na ordenação A-Z/Z-A.
		* @param {any} ag
		*/
		function nomeAgendamento(ag) {
			return tipoAgendamento(ag) === "equipamento" ? ag.equipamento_nome || "" : ag.sala_nome || "";
		}
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
		const ROTULOS_CARGO = {
			admin: "Administrador",
			servidor: "Servidor",
			educador: "Educador"
		};
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
		let pesquisaAg = "";
		$: fotoExibida = usuario?.foto_url || "";
		$: semanasHeatmap = montarSemanas(estatisticas?.heatmap, anoSelecionado);
		$: rotulosMeses = semanasHeatmap.map((semana, idx) => {
			const primeiroDia = semana[0];
			if (!primeiroDia) return "";
			if (idx === 0) return NOMES_MESES[primeiroDia.mes];
			const mesAnterior = semanasHeatmap[idx - 1][0]?.mes;
			return primeiroDia.mes !== mesAnterior ? NOMES_MESES[primeiroDia.mes] : "";
		});
		$: totalGeral = (estatisticas?.totalSala || 0) + (estatisticas?.totalEquipamento || 0);
		$: agendamentos.filter((ag) => {
			if (!pesquisaAg.trim()) return true;
			const termo = pesquisaAg.toLowerCase();
			return nomeAgendamento(ag).toLowerCase().includes(termo) || (ag.obs || "").toLowerCase().includes(termo);
		}).filter((ag) => {
			return true;
		}).filter((ag) => {
			return true;
		}).sort((a, b) => {
			const dataA = new Date(a.data_hora_inicio).getTime();
			return new Date(b.data_hora_inicio).getTime() - dataA;
		});
		ConfirmarDelecaoModal($$renderer, {
			agendamento: agendamentoParaDeletar,
			onConfirmar: confirmarDelecao,
			onCancelar: fecharModal,
			processando
		});
		$$renderer.push(`<!----> <div class="minhas-informacoes"><div class="scaffold"><header class="app-bar"><div class="title-section"><h1>Portal de Agendamento</h1> <span>Meu Perfil</span></div> <button class="btn-icon" title="Voltar"><span class="material-symbols-outlined">arrow_back</span></button></header> <main class="page-content">`);
		if (erro) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="msg-erro">${escape_html(erro)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->  <div class="card" id="dados"><div class="card-header"><span class="material-symbols-outlined">person</span> <h3>Meus Dados</h3> `);
		if (!carregandoUsuario && onSalvarPerfil) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button type="button" class="btn-editar-perfil"><span class="material-symbols-outlined">edit</span> Editar</button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		if (carregandoUsuario) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Carregando dados do usuário...</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attr_class("perfil-conteudo", void 0, { "editando": editandoPerfil })}><div class="perfil-foto-area">`);
			if (fotoExibida) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<img class="perfil-foto"${attr("src", fotoExibida)} alt="Foto de perfil"/>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="perfil-foto-placeholder">${escape_html(iniciais(usuario?.nome))}</div>`);
			}
			$$renderer.push(`<!--]--> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="perfil-dados">`);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="perfil-nome">${escape_html(usuario?.nome || "—")}</p> <div class="perfil-info-linha"><span class="material-symbols-outlined">mail</span> ${escape_html(usuario?.email || "—")}</div>`);
			$$renderer.push(`<!--]--> <div class="perfil-info-linha"><span class="material-symbols-outlined">badge</span> Matrícula: ${escape_html(usuario?.matricula || "—")}</div> <div class="perfil-info-linha"><span class="material-symbols-outlined">work</span> Cargo: ${escape_html(ROTULOS_CARGO[usuario?.cargo] || usuario?.cargo || "—")}</div></div></div> `);
			if (salasResponsavel && equipamentosResponsavel) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="responsabilidades"><div class="responsabilidade-bloco"><span class="responsabilidade-titulo"><span class="material-symbols-outlined">meeting_room</span> Salas sob minha responsabilidade</span> `);
				if (salasResponsavel.length) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="chips"><!--[-->`);
					const each_array = ensure_array_like(salasResponsavel);
					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let sala = each_array[$$index];
						$$renderer.push(`<span class="chip">${escape_html(sala.nome)}</span>`);
					}
					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="responsabilidade-vazio">Nenhuma sala.</span>`);
				}
				$$renderer.push(`<!--]--></div> <div class="responsabilidade-bloco"><span class="responsabilidade-titulo"><span class="material-symbols-outlined">devices</span> Equipamentos sob minha responsabilidade</span> `);
				if (equipamentosResponsavel.length) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="chips"><!--[-->`);
					const each_array_1 = ensure_array_like(equipamentosResponsavel);
					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let equipamento = each_array_1[$$index_1];
						$$renderer.push(`<span class="chip">${escape_html(equipamento.nome)}</span>`);
					}
					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="responsabilidade-vazio">Nenhum equipamento.</span>`);
				}
				$$renderer.push(`<!--]--></div></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div> <div class="card" id="estatisticas"><div class="card-header"><span class="material-symbols-outlined">query_stats</span> <h3>Minhas Estatísticas</h3></div> `);
		if (carregandoEstatisticas) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Carregando estatísticas...</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="estatisticas-resumo"><div class="estatistica-item"><span class="estatistica-valor">${escape_html(estatisticas.totalSala)}</span> <span class="estatistica-label">Salas agendadas</span></div> <div class="estatistica-item"><span class="estatistica-valor">${escape_html(estatisticas.totalEquipamento)}</span> <span class="estatistica-label">Equipamentos agendados</span></div> <div class="estatistica-item"><span class="estatistica-valor">${escape_html(totalGeral)}</span> <span class="estatistica-label">Total geral</span></div></div> <div class="estatisticas-destaques"><div class="destaque-item"><div class="destaque-icone"><span class="material-symbols-outlined">meeting_room</span></div> <div class="destaque-texto"><span class="destaque-label">Sala mais agendada</span> <span class="destaque-valor">${escape_html(estatisticas.salaMaisAgendada || "—")}</span></div></div> <div class="destaque-item"><div class="destaque-icone"><span class="material-symbols-outlined">devices</span></div> <div class="destaque-texto"><span class="destaque-label">Equipamento mais agendado</span> <span class="destaque-valor">${escape_html(estatisticas.equipamentoMaisAgendado || "—")}</span></div></div></div> <div class="heatmap-header"><button class="heatmap-nav-btn" title="Ano anterior"><span class="material-symbols-outlined">chevron_left</span></button> <button class="heatmap-ano-btn" title="Ir para o ano atual">${escape_html(anoSelecionado)}</button> <button class="heatmap-nav-btn" title="Próximo ano"><span class="material-symbols-outlined">chevron_right</span></button></div> <div class="heatmap-wrapper"><div class="heatmap-meses"><!--[-->`);
			const each_array_2 = ensure_array_like(rotulosMeses);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let rotulo = each_array_2[$$index_2];
				$$renderer.push(`<span class="heatmap-mes-label">${escape_html(rotulo)}</span>`);
			}
			$$renderer.push(`<!--]--></div> <div class="heatmap-grid"><!--[-->`);
			const each_array_3 = ensure_array_like(semanasHeatmap);
			for (let $$index_4 = 0, $$length = each_array_3.length; $$index_4 < $$length; $$index_4++) {
				let semana = each_array_3[$$index_4];
				$$renderer.push(`<!--[-->`);
				const each_array_4 = ensure_array_like(semana);
				for (let $$index_3 = 0, $$length = each_array_4.length; $$index_3 < $$length; $$index_3++) {
					let dia = each_array_4[$$index_3];
					$$renderer.push(`<div${attr_class(`heatmap-dia nivel-${stringify(nivelHeatmap(dia.quantidade))}`, "svelte-viwrfp", { "fora-do-ano": dia.foraDoAno })}${attr("title", `${stringify(dia.data)}: ${stringify(dia.quantidade)} agendamento(s)`)}></div>`);
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
		ListaAgendamentosCard($$renderer, {
			agendamentos,
			carregando: carregandoAgendamentos,
			onDeletar: abrirModal
		});
		$$renderer.push(`<!----></div></main></div></div>`);
		bind_props($$props, {
			usuario,
			carregandoUsuario,
			salasResponsavel,
			equipamentosResponsavel,
			onSalvarPerfil,
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
		let professor_id = "";
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
		async function salvarPerfil({ nome, email, foto, removerFoto }) {
			const resposta = await atualizarUsuario(Number(professor_id), {
				nome,
				email,
				foto,
				removerFoto
			}, token);
			if (!resposta) return;
			const atualizado = resposta?.user || resposta?.data?.user || resposta?.data || resposta;
			if (!atualizado) throw new Error("Resposta inesperada do servidor.");
			usuario = {
				...usuario,
				nome: atualizado.name || atualizado.nome || usuario?.nome || "",
				email: atualizado.email || usuario?.email || "",
				foto_url: atualizado.foto_url ?? atualizado.avatar_url ?? atualizado.foto ?? null
			};
			try {
				const salvo = JSON.parse(localStorage.getItem("user") || "null");
				if (salvo) localStorage.setItem("user", JSON.stringify({
					...salvo,
					name: atualizado.name || atualizado.nome || salvo.name,
					email: atualizado.email,
					foto_url: atualizado.foto_url ?? atualizado.avatar_url ?? atualizado.foto ?? null
				}));
			} catch {}
		}
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
			const salasAtivas = agendamentosSala.filter((a) => a.status !== "inativo");
			const equipamentosAtivos = agendamentosEquipamento.filter((a) => a.status !== "inativo");
			const todos = [...salasAtivas, ...equipamentosAtivos];
			estatisticas = {
				totalSala: salasAtivas.length,
				totalEquipamento: equipamentosAtivos.length,
				salaMaisAgendada: itemMaisFrequente(salasAtivas, "sala_nome", "sala_id"),
				equipamentoMaisAgendado: itemMaisFrequente(equipamentosAtivos, "equipamento_nome", "equipamento_id"),
				heatmap: montarHeatmap(todos)
			};
			carregandoEstatisticas = false;
		}
		async function deletar(ag) {
			try {
				if (ag.tipo === "equipamento") await deletarAgendamentoEquipamento(ag.id, token, ag.justificativa || "");
				else await deletarAgendamentoSala(ag.id, token, ag.justificativa || "");
				if (ag.tipo === "equipamento") agendamentosEquipamento = agendamentosEquipamento.map((a) => a.id === ag.id ? {
					...a,
					status: "inativo",
					justificativa: ag.justificativa || ""
				} : a);
				else agendamentosSala = agendamentosSala.map((a) => a.id === ag.id ? {
					...a,
					status: "inativo",
					justificativa: ag.justificativa || ""
				} : a);
				montarEstatisticas();
			} catch (e) {
				erro = e?.message || "Erro ao deletar agendamento.";
				throw e;
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
			onDeletar: deletar,
			onSalvarPerfil: salvarPerfil
		});
	});
}
//#endregion
export { _page as default };
