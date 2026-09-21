import { S as escape_html, c as stringify, i as ensure_array_like, n as bind_props, ot as fallback, s as slot, t as attr_class, x as attr } from "./server.js";
//#region src/lib/components/MesGrade/GradeMensal.svelte
function GradeMensal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let agendamentosPorData, dias, semanas;
		let agendamentos = fallback($$props["agendamentos"], () => [], true);
		let carregandoLista = fallback($$props["carregandoLista"], false);
		let hojeStr = fallback($$props["hojeStr"], "");
		const LIMITE_VISIVEL = 1;
		let diaExpandido = null;
		function gerarDias() {
			const hoje = /* @__PURE__ */ new Date();
			const diaSemana = hoje.getDay();
			const inicio = new Date(hoje);
			inicio.setDate(hoje.getDate() - diaSemana);
			inicio.setHours(0, 0, 0, 0);
			return Array.from({ length: 60 }, (_, i) => {
				const d = new Date(inicio);
				d.setDate(inicio.getDate() + i);
				return d;
			});
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
			return date.toISOString().slice(0, 10);
		}
		function ehHoje(date) {
			if (!date) return false;
			return formatarChave(date) === hojeStr;
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
		$: agendamentosPorData = agendamentos.filter((ag) => ag.status !== "inativo").reduce((acc, ag) => {
			const chave = ag.data_hora_inicio?.slice(0, 10);
			if (!chave) return acc;
			if (!acc[chave]) acc[chave] = [];
			acc[chave].push(ag);
			return acc;
		}, {});
		$: dias = gerarDias();
		$: semanas = gerarSemanas(dias);
		$$renderer.push(`<div class="grade-mensal">`);
		if (carregandoLista) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Carregando agendamentos...</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="grade-wrapper"><div class="grade-cabecalho"><!--[-->`);
			const each_array = ensure_array_like(CABECALHO);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let dia = each_array[$$index];
				$$renderer.push(`<div class="cabecalho-dia">${escape_html(dia)}</div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="grade-semanas"><!--[-->`);
			const each_array_1 = ensure_array_like(semanas);
			for (let $$index_3 = 0, $$length = each_array_1.length; $$index_3 < $$length; $$index_3++) {
				let semana = each_array_1[$$index_3];
				$$renderer.push(`<div class="semana-row"><!--[-->`);
				const each_array_2 = ensure_array_like(semana);
				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let dia = each_array_2[$$index_2];
					const chave = dia ? formatarChave(dia) : "";
					const ags = dia ? agendamentosPorData[chave] || [] : [];
					const expandido = !!chave && chave === diaExpandido;
					const visiveis = expandido ? ags : ags.slice(0, LIMITE_VISIVEL);
					$$renderer.push(`<div${attr_class(`dia-celula ${!dia ? "dia-vazio" : ""} ${dia && ehHoje(dia) ? "dia-hoje" : ""} ${expandido ? "expandido" : ""}`)}>`);
					if (dia) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span${attr_class(`dia-numero ${ehHoje(dia) ? "numero-hoje" : ""}`)}>${escape_html(dia.getDate())}</span> <div class="dia-conteudo"><!--[-->`);
						const each_array_3 = ensure_array_like(visiveis);
						for (let $$index_1 = 0, $$length = each_array_3.length; $$index_1 < $$length; $$index_1++) {
							let ag = each_array_3[$$index_1];
							$$renderer.push(`<div${attr_class(`ag-bloco ${stringify(ag.tipo ?? "sala")}`)}><!--[-->`);
							slot($$renderer, $$props, "default", { ag }, null);
							$$renderer.push(`<!--]--></div>`);
						}
						$$renderer.push(`<!--]--> `);
						if (ags.length > LIMITE_VISIVEL || expandido) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<button type="button" class="btn-expandir"${attr("title", expandido ? "Recolher" : "Ver todos os agendamentos")}><span class="material-symbols-outlined">${escape_html(expandido ? "expand_less" : "expand_more")}</span></button>`);
						} else $$renderer.push("<!--[-1-->");
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
		let proprio, podeDeletar, ehEquipamento, recursoNome, recursoIcone;
		let ag = $$props["ag"];
		let onDetalhes = fallback($$props["onDetalhes"], null);
		let onDeletar = fallback($$props["onDeletar"], null);
		let usuarioId = fallback($$props["usuarioId"], null);
		let cargo = fallback($$props["cargo"], null);
		$: proprio = usuarioId != null && ag.user_id == usuarioId;
		$: podeDeletar = cargo === "admin" || proprio;
		$: ehEquipamento = ag.tipo === "equipamento";
		$: recursoNome = ehEquipamento ? ag.equipamento_nome || ag.equipamento_id : ag.sala_nome || ag.sala_id;
		$: recursoIcone = ehEquipamento ? "devices" : "meeting_room";
		$$renderer.push(`<div${attr_class(`ag-bloco-inner ${proprio ? "proprio" : "outro"}`, "svelte-qzbw3r")}><span class="ag-hora svelte-qzbw3r">${escape_html(ag.data_hora_inicio?.slice(11, 16))} - ${escape_html(ag.data_hora_fim?.slice(11, 16))}</span> `);
		if (recursoNome) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="ag-info svelte-qzbw3r"><span class="material-symbols-outlined ag-icon svelte-qzbw3r">${escape_html(recursoIcone)}</span> <span class="ag-label svelte-qzbw3r">${escape_html(recursoNome)}</span></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (ag.usuario_nome) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="ag-info svelte-qzbw3r"><span class="material-symbols-outlined ag-icon svelte-qzbw3r">person</span> <span class="ag-label svelte-qzbw3r">${escape_html(ag.usuario_nome)}</span></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="ag-acoes svelte-qzbw3r">`);
		if (onDeletar && podeDeletar) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button class="btn-ag delete svelte-qzbw3r" title="Deletar"><span class="material-symbols-outlined svelte-qzbw3r">delete</span></button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (onDetalhes) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button class="btn-ag info svelte-qzbw3r" title="Ver detalhes"><span class="material-symbols-outlined svelte-qzbw3r">info</span></button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div>`);
		bind_props($$props, {
			ag,
			onDetalhes,
			onDeletar,
			usuarioId,
			cargo
		});
	});
}
//#endregion
//#region src/lib/components/Card/ListaAgendamentosCard.svelte
function ListaAgendamentosCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let agendamentosFiltrados;
		let agendamentos = fallback($$props["agendamentos"], () => [], true);
		let carregando = fallback($$props["carregando"], false);
		let usuarioId = fallback($$props["usuarioId"], null);
		let cargo = fallback($$props["cargo"], "");
		let embutido = fallback($$props["embutido"], false);
		let recursoUnico = fallback($$props["recursoUnico"], false);
		let onDeletar = fallback($$props["onDeletar"], null);
		let pesquisaAg = "";
		let filtroStatusAg = "todos";
		let filtroTipoAg = "todos";
		let ordenacaoAg = "recente";
		function parseData(str) {
			if (!str) return null;
			const d = new Date(String(str).replace(" ", "T").slice(0, 19));
			return isNaN(d.getTime()) ? null : d;
		}
		function formatarDataHora(str) {
			const d = parseData(str);
			if (!d) return "—";
			return `${d.toLocaleDateString("pt-BR", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric"
			})} às ${d.toLocaleTimeString("pt-BR", {
				hour: "2-digit",
				minute: "2-digit"
			})}`;
		}
		function isFuturo(str) {
			const d = parseData(str);
			return !!d && d >= /* @__PURE__ */ new Date();
		}
		/** @returns {"cancelado" | "futuro" | "passado"} */
		function statusExibicao(ag) {
			if (ag.status === "inativo") return "cancelado";
			return isFuturo(ag.data_hora_inicio) ? "futuro" : "passado";
		}
		function rotuloStatus(status) {
			if (status === "cancelado") return "Cancelado";
			if (status === "futuro") return "Agendado";
			return "Concluído";
		}
		function tipoAgendamento(ag) {
			return ag.tipo === "equipamento" ? "equipamento" : "sala";
		}
		function nomeAgendamento(ag) {
			return tipoAgendamento(ag) === "equipamento" ? ag.equipamento_nome || ag.equipamento_id || "" : ag.sala_nome || ag.sala_id || "";
		}
		function nomeResponsavel(ag) {
			return ag.user_nome || ag.usuario_nome || ag.professor_nome || "";
		}
		function podeDeletar(ag, status) {
			if (!onDeletar || status !== "futuro") return false;
			return cargo === "admin" || String(ag.user_id) === String(usuarioId);
		}
		$: agendamentosFiltrados = agendamentos.filter((ag) => {
			if (!pesquisaAg.trim()) return true;
			const termo = pesquisaAg.toLowerCase();
			return nomeAgendamento(ag).toLowerCase().includes(termo) || nomeResponsavel(ag).toLowerCase().includes(termo) || (ag.obs || "").toLowerCase().includes(termo);
		}).filter((ag) => {
			return true;
		}).filter((ag) => {
			return true;
		}).sort((a, b) => {
			const dataA = parseData(a.data_hora_inicio)?.getTime() ?? 0;
			return (parseData(b.data_hora_inicio)?.getTime() ?? 0) - dataA;
		});
		$$renderer.push(`<div class="lista-agendamentos-card svelte-1c63qri"><div class="agendamentos-toolbar svelte-1c63qri"><div class="campo-pesquisa-ag svelte-1c63qri"><span class="material-symbols-outlined svelte-1c63qri">search</span> <input type="text" placeholder="Pesquisar por sala, equipamento ou responsável..."${attr("value", pesquisaAg)} class="svelte-1c63qri"/></div> <div class="filtro-grupo svelte-1c63qri"><span class="filtro-grupo-label svelte-1c63qri">Status</span> `);
		$$renderer.select({
			class: "select-filtro-ag",
			value: filtroStatusAg
		}, ($$renderer) => {
			$$renderer.option({ value: "todos" }, ($$renderer) => {
				$$renderer.push(`Todos`);
			});
			$$renderer.option({ value: "ativo" }, ($$renderer) => {
				$$renderer.push(`Ativos`);
			});
			$$renderer.option({ value: "finalizado" }, ($$renderer) => {
				$$renderer.push(`Finalizados`);
			});
		}, "svelte-1c63qri");
		$$renderer.push(`</div> <div class="filtro-grupo svelte-1c63qri"><span class="filtro-grupo-label svelte-1c63qri">Tipo</span> `);
		$$renderer.select({
			class: "select-filtro-ag",
			value: filtroTipoAg
		}, ($$renderer) => {
			$$renderer.option({ value: "todos" }, ($$renderer) => {
				$$renderer.push(`Todos`);
			});
			$$renderer.option({ value: "sala" }, ($$renderer) => {
				$$renderer.push(`Salas`);
			});
			$$renderer.option({ value: "equipamento" }, ($$renderer) => {
				$$renderer.push(`Equipamentos`);
			});
		}, "svelte-1c63qri");
		$$renderer.push(`</div> <div class="filtro-grupo svelte-1c63qri"><span class="filtro-grupo-label svelte-1c63qri">Ordenar</span> `);
		$$renderer.select({
			class: "select-filtro-ag",
			value: ordenacaoAg
		}, ($$renderer) => {
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
		}, "svelte-1c63qri");
		$$renderer.push(`</div></div> `);
		if (carregando) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio svelte-1c63qri">Carregando agendamentos...</p>`);
		} else if (agendamentosFiltrados.length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="estado-vazio svelte-1c63qri">Nenhum agendamento encontrado com os filtros selecionados.</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="agendamentos-lista svelte-1c63qri"><!--[-->`);
			const each_array = ensure_array_like(agendamentosFiltrados);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let ag = each_array[$$index];
				const status = statusExibicao(ag);
				const responsavel = nomeResponsavel(ag);
				$$renderer.push(`<div class="agendamento-item svelte-1c63qri"><div class="agendamento-faixa svelte-1c63qri"></div> <div class="agendamento-body svelte-1c63qri"><div class="agendamento-data-hora svelte-1c63qri"><span class="material-symbols-outlined svelte-1c63qri">schedule</span> ${escape_html(formatarDataHora(ag.data_hora_inicio))}
                             → 
                            ${escape_html(formatarDataHora(ag.data_hora_fim))}</div> <div class="agendamento-sala svelte-1c63qri"><span class="material-symbols-outlined svelte-1c63qri">${escape_html(tipoAgendamento(ag) === "equipamento" ? "devices" : "meeting_room")}</span> ${escape_html(nomeAgendamento(ag) || (tipoAgendamento(ag) === "equipamento" ? "Equipamento não informado" : "Sala não informada"))}</div> `);
				if (responsavel) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="agendamento-sala svelte-1c63qri"><span class="material-symbols-outlined svelte-1c63qri">person</span> ${escape_html(responsavel)}</div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (ag.obs) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="agendamento-obs svelte-1c63qri">${escape_html(ag.obs)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <div class="agendamento-status svelte-1c63qri"><span${attr_class(`badge-status ${stringify(status)}`, "svelte-1c63qri")}>${escape_html(rotuloStatus(status))}</span> `);
				if (podeDeletar(ag, status)) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<button type="button" class="btn-deletar-ag svelte-1c63qri" title="Deletar agendamento"><span class="material-symbols-outlined">delete</span></button>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
		bind_props($$props, {
			agendamentos,
			carregando,
			usuarioId,
			cargo,
			embutido,
			recursoUnico,
			onDeletar
		});
	});
}
//#endregion
export { BlocoAgendamentoCard as n, GradeMensal as r, ListaAgendamentosCard as t };
