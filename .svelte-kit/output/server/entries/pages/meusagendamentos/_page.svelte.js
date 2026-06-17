import "../../../chunks/environment.js";
import { B as escape_html, Y as fallback, a as ensure_array_like, l as stringify, n as attr_class, r as bind_props } from "../../../chunks/dev.js";
import { t as goto } from "../../../chunks/client.js";
import "../../../chunks/navigation.js";
import "../../../chunks/List_Horario_Service.js";
import "../../../chunks/List_Agendamento_Sala_Service.js";
//#region src/lib/components/meusagendamentos/MeusAgendamentosCard.svelte
function MeusAgendamentosCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let agendamentosOrdenados;
		let blocos = fallback($$props["blocos"], () => [], true);
		let agendamentos = fallback($$props["agendamentos"], () => [], true);
		let carregandoBlocos = fallback($$props["carregandoBlocos"], false);
		let carregandoAgendamentos = fallback($$props["carregandoAgendamentos"], false);
		let erro = fallback($$props["erro"], "");
		let onSair = $$props["onSair"];
		const dias = [
			"segunda",
			"terca",
			"quarta",
			"quinta",
			"sexta"
		];
		const diasLabels = {
			segunda: "Segunda",
			terca: "Terça",
			quarta: "Quarta",
			quinta: "Quinta",
			sexta: "Sexta"
		};
		function blocosOrdenados(dia) {
			return blocos.filter((b) => b.dia_semana === dia).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
		}
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
		$: agendamentosOrdenados = [...agendamentos].sort((a, b) => {
			const fa = isFuturo(a.data_hora_inicio);
			const fb = isFuturo(b.data_hora_inicio);
			if (fa !== fb) return fb ? 1 : -1;
			return new Date(a.data_hora_inicio).getTime() - new Date(b.data_hora_inicio).getTime();
		});
		$$renderer.push(`<div class="scaffold"><header class="app-bar"><div class="title-section"><h1>Portal de Agendamento</h1> <span>Meus Agendamentos</span></div> <button class="btn-icon" title="Voltar"><span class="material-symbols-outlined">arrow_back</span></button></header> <main class="page-content">`);
		if (erro) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="msg-erro">${escape_html(erro)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="card"><div class="card-header"><span class="material-symbols-outlined">calendar_month</span> <h3>Minha Grade de Aulas</h3></div> `);
		if (carregandoBlocos) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Carregando grade...</p>`);
		} else if (blocos.length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="estado-vazio">Nenhuma aula cadastrada para você.</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="grade-wrapper"><!--[-->`);
			const each_array = ensure_array_like(dias);
			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let dia = each_array[$$index_1];
				$$renderer.push(`<div class="dia-coluna"><div class="dia-header">${escape_html(diasLabels[dia])}</div> <div class="dia-blocos">`);
				const each_array_1 = ensure_array_like(blocosOrdenados(dia));
				if (each_array_1.length !== 0) {
					$$renderer.push("<!--[-->");
					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
						let bloco = each_array_1[$$index];
						$$renderer.push(`<div class="bloco-aula"><span class="bloco-horario">${escape_html(bloco.hora_inicio)} – ${escape_html(bloco.hora_fim)}</span> <span class="bloco-disciplina">${escape_html(bloco.disciplina)}</span> <div class="bloco-meta"><span class="material-symbols-outlined">meeting_room</span> ${escape_html(bloco.sala_nome || bloco.sala_id || "—")}</div> <div class="bloco-meta"><span class="material-symbols-outlined">group</span> ${escape_html(bloco.turma_nome || bloco.turma_id || "—")}</div></div>`);
					}
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push(`<div class="bloco-vazio">—</div>`);
				}
				$$renderer.push(`<!--]--></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div> <div class="card"><div class="card-header"><span class="material-symbols-outlined">event_available</span> <h3>Meus Agendamentos de Sala</h3></div> `);
		if (carregandoAgendamentos) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Carregando agendamentos...</p>`);
		} else if (agendamentosOrdenados.length === 0) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="estado-vazio">Nenhum agendamento de sala encontrado.</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="agendamentos-lista"><!--[-->`);
			const each_array_2 = ensure_array_like(agendamentosOrdenados);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let ag = each_array_2[$$index_2];
				$$renderer.push(`<div class="agendamento-item"><div class="agendamento-faixa"></div> <div class="agendamento-body"><div class="agendamento-data-hora"><span class="material-symbols-outlined">schedule</span> ${escape_html(formatarDataHora(ag.data_hora_inicio))}
                                     → 
                                    ${escape_html(formatarDataHora(ag.data_hora_fim))}</div> <div class="agendamento-sala"><span class="material-symbols-outlined">meeting_room</span> ${escape_html(ag.sala_nome || ag.sala_id || "Sala não informada")}</div> `);
				if (ag.obs) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="agendamento-obs">${escape_html(ag.obs)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <div class="agendamento-status"><span${attr_class(`badge-status ${stringify(isFuturo(ag.data_hora_inicio) ? "futuro" : "passado")}`)}>${escape_html(isFuturo(ag.data_hora_inicio) ? "Agendado" : "Concluído")}</span></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div></main></div>`);
		bind_props($$props, {
			blocos,
			agendamentos,
			carregandoBlocos,
			carregandoAgendamentos,
			erro,
			onSair
		});
	});
}
//#endregion
//#region src/routes/meusagendamentos/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		MeusAgendamentosCard($$renderer, {
			blocos: [],
			agendamentos: [],
			carregandoBlocos: false,
			carregandoAgendamentos: false,
			erro: "",
			onSair: () => goto("/main")
		});
	});
}
//#endregion
export { _page as default };
