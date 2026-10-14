import { T as escape_html, c as slot, i as ensure_array_like, lt as fallback, n as bind_props, t as attr_class, u as stringify, w as attr } from "./server.js";
import { u as AgendamentoDetalheModal } from "./Confirmar_Agendamento_Service.js";
//#region src/lib/components/Grades/GradeMensal.svelte
function GradeMensal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let usuariosDisponiveis, turmasDisponiveis, itensDisponiveis, agendamentosFiltrados, agendamentosPorData, dias, semanas, mesAnoLabel;
		let agendamentos = fallback($$props["agendamentos"], () => [], true);
		let carregandoLista = fallback($$props["carregandoLista"], false);
		let hojeStr = fallback($$props["hojeStr"], "");
		const LIMITE_VISIVEL = 1;
		let diaExpandido = null;
		let mesExibido = new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1);
		let pesquisaAg = "";
		let filtroStatusAg = "todos";
		let filtroTipoAg = "todos";
		let filtroItemAg = "todos";
		let filtroTurmaAg = "todos";
		let filtroUsuarioAg = "todos";
		let ordenacaoAg = "recente";
		function gerarDias(mes) {
			const deslocamento = new Date(mes.getFullYear(), mes.getMonth(), 1).getDay();
			const totalDias = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
			const totalCelulas = Math.ceil((deslocamento + totalDias) / 7) * 7;
			return Array.from({ length: totalCelulas }, (_, indice) => new Date(mes.getFullYear(), mes.getMonth(), indice - deslocamento + 1));
		}
		function gerarSemanas(dias) {
			const semanas = [];
			const primeiro = dias[0].getDay();
			const todos = [...Array(primeiro).fill(null), ...dias];
			const resto = todos.length % 7;
			if (resto !== 0) {
				const sufixo = Array(7 - resto).fill(null);
				todos.push(...sufixo);
			}
			for (let i = 0; i < todos.length; i += 7) semanas.push(todos.slice(i, i + 7));
			return semanas;
		}
		function formatarChave(date) {
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
		}
		function chaveDataAgendamento(dataHora) {
			return dataHora ? String(dataHora).slice(0, 10) : "";
		}
		function ehHoje(date) {
			if (!date) return false;
			return formatarChave(date) === formatarChave(/* @__PURE__ */ new Date());
		}
		function parseData(dataHora) {
			if (!dataHora) return null;
			const data = new Date(String(dataHora).replace(" ", "T").slice(0, 19));
			return Number.isNaN(data.getTime()) ? null : data;
		}
		function nomeAgendamento(ag) {
			return ag.tipo === "equipamento" ? ag.equipamento_nome || String(ag.equipamento_id || "") : ag.sala_nome || String(ag.sala_id || "");
		}
		function nomeResponsavel(ag) {
			return ag.user_nome || ag.usuario_nome || ag.professor_nome || "";
		}
		function chaveUsuario(ag) {
			if (ag.user_id != null && ag.user_id !== "") return `id:${ag.user_id}`;
			const nome = nomeResponsavel(ag);
			return nome ? `nome:${nome}` : "";
		}
		function chaveTurma(ag) {
			if (ag.turma_id != null && ag.turma_id !== "") return `id:${ag.turma_id}`;
			return ag.turma_nome ? `nome:${ag.turma_nome}` : "";
		}
		function tipoRecurso(ag) {
			return ag.tipo === "equipamento" ? "equipamento" : "sala";
		}
		function chaveItem(ag) {
			const id = tipoRecurso(ag) === "equipamento" ? ag.equipamento_id : ag.sala_id;
			const chave = id != null && id !== "" ? `id:${id}` : `nome:${nomeAgendamento(ag)}`;
			return `${tipoRecurso(ag)}:${chave}`;
		}
		function opcoesUnicas(ags, chaveFn, nomeFn) {
			const opcoes = /* @__PURE__ */ new Map();
			for (const ag of ags) {
				const chave = chaveFn(ag);
				if (chave) opcoes.set(chave, nomeFn(ag) || chave);
			}
			return [...opcoes].map(([id, nome]) => ({
				id,
				nome
			})).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
		}
		const CABECALHO = [
			"Dom",
			"Seg",
			"Ter",
			"Qua",
			"Qui",
			"Sex",
			"Sáb"
		];
		$: usuariosDisponiveis = opcoesUnicas(agendamentos, chaveUsuario, (ag) => nomeResponsavel(ag) || `Usuário ${ag.user_id}`);
		$: turmasDisponiveis = opcoesUnicas(agendamentos, chaveTurma, (ag) => ag.turma_nome || `Turma ${ag.turma_id}`);
		$: itensDisponiveis = opcoesUnicas(agendamentos.filter((ag) => true), chaveItem, (ag) => `${tipoRecurso(ag) === "sala" ? "Sala" : "Equipamento"}: ${nomeAgendamento(ag)}`);
		$: agendamentosFiltrados = agendamentos.filter((ag) => {
			const termo = pesquisaAg.trim().toLowerCase();
			if (!termo) return true;
			return nomeAgendamento(ag).toLowerCase().includes(termo) || nomeResponsavel(ag).toLowerCase().includes(termo) || String(ag.turma_nome || "").toLowerCase().includes(termo) || String(ag.obs || "").toLowerCase().includes(termo);
		}).filter((ag) => {
			return true;
		}).filter((ag) => {
			return true;
		}).filter((ag) => {
			return true;
		}).filter((ag) => {
			return true;
		}).filter((ag) => {
			return true;
		}).sort((a, b) => {
			const dataA = parseData(a.data_hora_inicio)?.getTime() ?? 0;
			return (parseData(b.data_hora_inicio)?.getTime() ?? 0) - dataA;
		});
		$: agendamentosPorData = agendamentosFiltrados.reduce((acc, ag) => {
			const chave = chaveDataAgendamento(ag.data_hora_inicio);
			if (!chave) return acc;
			if (!acc[chave]) acc[chave] = [];
			acc[chave].push(ag);
			return acc;
		}, {});
		$: dias = gerarDias(mesExibido);
		$: semanas = gerarSemanas(dias);
		$: mesAnoLabel = mesExibido.toLocaleDateString("pt-BR", {
			month: "long",
			year: "numeric"
		});
		$$renderer.push(`<div class="grade-mensal">`);
		if (carregandoLista) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Carregando agendamentos...</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="grade-toolbar"><div class="grade-periodo"><button type="button" class="btn-mes" aria-label="Mês anterior" title="Mês anterior"><span class="material-symbols-outlined">chevron_left</span></button> <strong>${escape_html(mesAnoLabel)}</strong> <button type="button" class="btn-mes" aria-label="Próximo mês" title="Próximo mês"><span class="material-symbols-outlined">chevron_right</span></button></div> <div class="grade-filtros"><label class="grade-pesquisa"><span class="material-symbols-outlined" aria-hidden="true">search</span> <input type="search" placeholder="Buscar agendamento..."${attr("value", pesquisaAg)} aria-label="Buscar agendamento"/></label> <label class="grade-filtro"><span>Status</span> `);
			$$renderer.select({ value: filtroStatusAg }, ($$renderer) => {
				$$renderer.option({ value: "todos" }, ($$renderer) => {
					$$renderer.push(`Todos`);
				});
				$$renderer.option({ value: "ativo" }, ($$renderer) => {
					$$renderer.push(`Ativos`);
				});
				$$renderer.option({ value: "em_andamento" }, ($$renderer) => {
					$$renderer.push(`Em andamento`);
				});
				$$renderer.option({ value: "finalizado" }, ($$renderer) => {
					$$renderer.push(`Concluídos`);
				});
				$$renderer.option({ value: "cancelado" }, ($$renderer) => {
					$$renderer.push(`Cancelados`);
				});
			});
			$$renderer.push(`</label> <label class="grade-filtro"><span>Tipo</span> `);
			$$renderer.select({ value: filtroTipoAg }, ($$renderer) => {
				$$renderer.option({ value: "todos" }, ($$renderer) => {
					$$renderer.push(`Todos`);
				});
				$$renderer.option({ value: "sala" }, ($$renderer) => {
					$$renderer.push(`Salas`);
				});
				$$renderer.option({ value: "equipamento" }, ($$renderer) => {
					$$renderer.push(`Equipamentos`);
				});
			});
			$$renderer.push(`</label> <label class="grade-filtro"><span>Item</span> `);
			$$renderer.select({ value: filtroItemAg }, ($$renderer) => {
				$$renderer.option({ value: "todos" }, ($$renderer) => {
					$$renderer.push(`Todos`);
				});
				$$renderer.push(`<!--[-->`);
				const each_array = ensure_array_like(itensDisponiveis);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];
					$$renderer.option({ value: item.id }, ($$renderer) => {
						$$renderer.push(`${escape_html(item.nome)}`);
					});
				}
				$$renderer.push(`<!--]-->`);
			});
			$$renderer.push(`</label> <label class="grade-filtro"><span>Turma</span> `);
			$$renderer.select({ value: filtroTurmaAg }, ($$renderer) => {
				$$renderer.option({ value: "todos" }, ($$renderer) => {
					$$renderer.push(`Todas`);
				});
				$$renderer.option({ value: "sem-turma" }, ($$renderer) => {
					$$renderer.push(`Sem turma`);
				});
				$$renderer.push(`<!--[-->`);
				const each_array_1 = ensure_array_like(turmasDisponiveis);
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let turma = each_array_1[$$index_1];
					$$renderer.option({ value: turma.id }, ($$renderer) => {
						$$renderer.push(`${escape_html(turma.nome)}`);
					});
				}
				$$renderer.push(`<!--]-->`);
			});
			$$renderer.push(`</label> <label class="grade-filtro"><span>Usuário</span> `);
			$$renderer.select({ value: filtroUsuarioAg }, ($$renderer) => {
				$$renderer.option({ value: "todos" }, ($$renderer) => {
					$$renderer.push(`Todos`);
				});
				$$renderer.push(`<!--[-->`);
				const each_array_2 = ensure_array_like(usuariosDisponiveis);
				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let usuario = each_array_2[$$index_2];
					$$renderer.option({ value: usuario.id }, ($$renderer) => {
						$$renderer.push(`${escape_html(usuario.nome)}`);
					});
				}
				$$renderer.push(`<!--]-->`);
			});
			$$renderer.push(`</label> <label class="grade-filtro"><span>Ordenar</span> `);
			$$renderer.select({ value: ordenacaoAg }, ($$renderer) => {
				$$renderer.option({ value: "recente" }, ($$renderer) => {
					$$renderer.push(`Mais recente`);
				});
				$$renderer.option({ value: "antigo" }, ($$renderer) => {
					$$renderer.push(`Mais antigo`);
				});
				$$renderer.option({ value: "az" }, ($$renderer) => {
					$$renderer.push(`Nome (A-Z)`);
				});
				$$renderer.option({ value: "za" }, ($$renderer) => {
					$$renderer.push(`Nome (Z-A)`);
				});
			});
			$$renderer.push(`</label></div></div> `);
			if (agendamentosFiltrados.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="grade-sem-resultados">Nenhum agendamento encontrado com os filtros selecionados.</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="grade-wrapper"><div class="grade-cabecalho"><!--[-->`);
			const each_array_3 = ensure_array_like(CABECALHO);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let dia = each_array_3[$$index_3];
				$$renderer.push(`<div class="cabecalho-dia">${escape_html(dia)}</div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="grade-semanas"><!--[-->`);
			const each_array_4 = ensure_array_like(semanas);
			for (let $$index_6 = 0, $$length = each_array_4.length; $$index_6 < $$length; $$index_6++) {
				let semana = each_array_4[$$index_6];
				$$renderer.push(`<div class="semana-row"><!--[-->`);
				const each_array_5 = ensure_array_like(semana);
				for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
					let dia = each_array_5[$$index_5];
					const chave = dia ? formatarChave(dia) : "";
					const ags = dia ? agendamentosPorData[chave] || [] : [];
					const expandido = !!chave && chave === diaExpandido;
					const visiveis = expandido ? ags : ags.slice(0, LIMITE_VISIVEL);
					$$renderer.push(`<div${attr_class(`dia-celula ${!dia ? "dia-vazio" : ""} ${dia && ehHoje(dia) ? "dia-hoje" : ""} ${expandido ? "expandido" : ""}`)}>`);
					if (dia) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span${attr_class(`dia-numero ${ehHoje(dia) ? "numero-hoje" : ""}`)}>${escape_html(dia.getDate())}</span> <div class="dia-expandir-slot">`);
						if (ags.length > LIMITE_VISIVEL || expandido) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<button type="button"${attr_class("btn-expandir", void 0, { "aberto": expandido })}${attr("aria-expanded", expandido)}${attr("title", expandido ? "Recolher" : "Ver todos os agendamentos")}><span class="material-symbols-outlined" aria-hidden="true">${escape_html(expandido ? "expand_less" : "expand_more")}</span> <span>${escape_html(expandido ? "Recolher" : `Ver mais (${ags.length - LIMITE_VISIVEL})`)}</span></button>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></div> <div${attr_class("dia-conteudo", void 0, { "expandido": expandido })}><!--[-->`);
						const each_array_6 = ensure_array_like(visiveis);
						for (let $$index_4 = 0, $$length = each_array_6.length; $$index_4 < $$length; $$index_4++) {
							let ag = each_array_6[$$index_4];
							$$renderer.push(`<div${attr_class(`ag-bloco ${stringify(ag.tipo ?? "sala")}`)}><!--[-->`);
							slot($$renderer, $$props, "default", { ag }, null);
							$$renderer.push(`<!--]--></div>`);
						}
						$$renderer.push(`<!--]--></div>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
		bind_props($$props, {
			agendamentos,
			carregandoLista,
			hojeStr
		});
	});
}
//#endregion
//#region src/lib/components/Card/BlocoAgendamentoCard.svelte
function BlocoAgendamentoCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let ehEquipamento, proprio, responsavelId, ehResponsavel, podeDeletar, recursoNome, recursoIcone, agendamentoCancelado, agendamentoPassado;
		let ag = $$props["ag"];
		let onDeletar = fallback($$props["onDeletar"], null);
		let usuarioId = fallback($$props["usuarioId"], null);
		let cargo = fallback($$props["cargo"], null);
		let mostrarDetalhes = false;
		function estaNoFuturo(dataHora) {
			if (!dataHora) return false;
			const data = new Date(String(dataHora).replace(" ", "T").slice(0, 19));
			return !Number.isNaN(data.getTime()) && data >= /* @__PURE__ */ new Date();
		}
		function cancelarPeloModal(agendamento) {
			mostrarDetalhes = false;
			onDeletar?.(agendamento);
		}
		$: ehEquipamento = ag.tipo === "equipamento";
		$: proprio = usuarioId != null && ag.user_id == usuarioId;
		$: responsavelId = ehEquipamento ? ag.equipamento_responsavel_id : ag.sala_responsavel_id;
		$: ehResponsavel = usuarioId != null && responsavelId != null && String(responsavelId) === String(usuarioId);
		$: podeDeletar = cargo === "admin" || proprio || ehResponsavel;
		$: recursoNome = ehEquipamento ? ag.equipamento_nome || ag.equipamento_id : ag.sala_nome || ag.sala_id;
		$: recursoIcone = ehEquipamento ? "devices" : "meeting_room";
		$: agendamentoCancelado = ag.status === "inativo";
		$: agendamentoPassado = !estaNoFuturo(ag.data_hora_inicio);
		if (mostrarDetalhes) {
			$$renderer.push("<!--[0-->");
			AgendamentoDetalheModal($$renderer, {
				ag,
				usuarioId,
				cargo,
				onFechar: () => mostrarDetalhes = false,
				onCancelar: onDeletar && !agendamentoPassado && !agendamentoCancelado ? cancelarPeloModal : null
			});
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div${attr_class(`ag-bloco-inner ${proprio ? "proprio" : "outro"}`, "svelte-qzbw3r", {
			"passado": agendamentoPassado,
			"ocioso": ag.status === "ocioso",
			"em-andamento": ag.status === "em_andamento",
			"cancelado": agendamentoCancelado
		})}><span class="ag-hora svelte-qzbw3r">${escape_html(ag.data_hora_inicio?.slice(11, 16))} - ${escape_html(ag.data_hora_fim?.slice(11, 16))}</span> `);
		if (recursoNome) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="ag-info svelte-qzbw3r"><span class="material-symbols-outlined ag-icon svelte-qzbw3r">${escape_html(recursoIcone)}</span> <span class="ag-label svelte-qzbw3r">${escape_html(recursoNome)}</span></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (ag.usuario_nome) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="ag-info svelte-qzbw3r"><span class="material-symbols-outlined ag-icon svelte-qzbw3r">person</span> <span class="ag-label svelte-qzbw3r">${escape_html(ag.usuario_nome)}</span></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (ag.turma_nome) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="ag-info svelte-qzbw3r"><span class="material-symbols-outlined ag-icon svelte-qzbw3r">groups</span> <span class="ag-label svelte-qzbw3r">${escape_html(ag.turma_nome)}</span></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="ag-acoes svelte-qzbw3r">`);
		if (onDeletar && podeDeletar && !agendamentoPassado && !agendamentoCancelado) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button class="btn-ag delete svelte-qzbw3r" title="Deletar"><span class="material-symbols-outlined svelte-qzbw3r">delete</span></button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <button type="button" class="btn-ag info svelte-qzbw3r" title="Ver detalhes" aria-label="Ver detalhes do agendamento"><span class="material-symbols-outlined svelte-qzbw3r">info</span></button></div></div>`);
		bind_props($$props, {
			ag,
			onDeletar,
			usuarioId,
			cargo
		});
	});
}
//#endregion
export { GradeMensal as n, BlocoAgendamentoCard as t };
