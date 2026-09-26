import { C as escape_html, S as attr, c as slot, i as ensure_array_like, l as stringify, n as bind_props, st as fallback, t as attr_class } from "./server.js";
//#region src/lib/components/Grades/GradeMensal.svelte
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
		let ehEquipamento, proprio, responsavelId, ehResponsavel, podeDeletar, recursoNome, recursoIcone;
		let ag = $$props["ag"];
		let onDetalhes = fallback($$props["onDetalhes"], null);
		let onDeletar = fallback($$props["onDeletar"], null);
		let usuarioId = fallback($$props["usuarioId"], null);
		let cargo = fallback($$props["cargo"], null);
		$: ehEquipamento = ag.tipo === "equipamento";
		$: proprio = usuarioId != null && ag.user_id == usuarioId;
		$: responsavelId = ehEquipamento ? ag.equipamento_responsavel_id : ag.sala_responsavel_id;
		$: ehResponsavel = usuarioId != null && responsavelId != null && String(responsavelId) === String(usuarioId);
		$: podeDeletar = cargo === "admin" || proprio || ehResponsavel;
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
export { GradeMensal as n, BlocoAgendamentoCard as t };
