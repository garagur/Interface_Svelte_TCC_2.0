import "../../../chunks/environment.js";
import { B as escape_html, Y as fallback, a as ensure_array_like, ct as invalid_default_snippet, l as stringify, n as attr_class, r as bind_props, z as attr } from "../../../chunks/dev.js";
import { t as goto } from "../../../chunks/client.js";
import "../../../chunks/navigation.js";
import { t as GradeSemanal } from "../../../chunks/GradeSemanal.js";
import { r as carregarHorariosSala } from "../../../chunks/List_Horario_Service.js";
import "../../../chunks/List_Sala_Service.js";
import { n as AGENDAMENTOSALA_ROUTE, t as carregarAgendamentosSalas } from "../../../chunks/List_Agendamento_Sala_Service.js";
//#region src/lib/components/agendamento/AgendamentoCard.svelte
function AgendamentoCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let dias60, semanas;
		let salas = fallback($$props["salas"], () => [], true);
		let sala_id = fallback($$props["sala_id"], null);
		let agendamentos = fallback($$props["agendamentos"], () => [], true);
		let blocosFixos = fallback($$props["blocosFixos"], () => [], true);
		let carregandoLista = fallback($$props["carregandoLista"], false);
		let carregandoBlocos = fallback($$props["carregandoBlocos"], false);
		let carregando = fallback($$props["carregando"], false);
		let erro = fallback($$props["erro"], "");
		let sucesso = fallback($$props["sucesso"], "");
		let dataAgendamento = fallback($$props["dataAgendamento"], "");
		let horaInicio = fallback($$props["horaInicio"], "");
		let horaFim = fallback($$props["horaFim"], "");
		let obs = fallback($$props["obs"], "");
		let hojeStr = fallback($$props["hojeStr"], "");
		let onSubmit = $$props["onSubmit"];
		let onLimpar = $$props["onLimpar"];
		let onSair = $$props["onSair"];
		const dias = [
			"segunda",
			"terca",
			"quarta",
			"quinta",
			"sexta",
			"sabado",
			"domingo"
		];
		function gerarDias60() {
			const dias = [];
			const base = /* @__PURE__ */ new Date();
			base.setHours(0, 0, 0, 0);
			for (let i = 0; i < 60; i++) {
				const d = new Date(base);
				d.setDate(base.getDate() + i);
				dias.push(d);
			}
			return dias;
		}
		function gerarSemanas(dias) {
			const semanas = [];
			const primeiro = dias[0].getDay();
			const todos = [...Array(primeiro).fill(null), ...dias];
			for (let i = 0; i < todos.length; i += 7) semanas.push(todos.slice(i, i + 7));
			return semanas;
		}
		function agendamentosDoDia(data) {
			if (!data) return [];
			const str = data.toISOString().slice(0, 10);
			return agendamentos.filter((a) => a.data_hora_inicio?.slice(0, 10) === str);
		}
		function formatarHora(dtStr) {
			if (!dtStr) return "";
			return dtStr.slice(11, 16);
		}
		function ehHoje(data) {
			if (!data) return false;
			return data.toISOString().slice(0, 10) === hojeStr;
		}
		const cabecalho = [
			"Dom",
			"Seg",
			"Ter",
			"Qua",
			"Qui",
			"Sex",
			"Sáb"
		];
		$: dias60 = gerarDias60();
		$: semanas = gerarSemanas(dias60);
		$$renderer.push(`<div class="escopo-agendamento"><div class="scaffold"><header class="app-bar"><div class="title-section"><h1>Portal de Agendamento</h1> <span>Novo Agendamento</span></div> <button class="btn-icon" title="Voltar"><span class="material-symbols-outlined">arrow_back</span></button></header> <main class="body-content"><div class="card sala-select-card"><label for="sala-select">Sala</label> `);
		$$renderer.select({
			id: "sala-select",
			value: sala_id
		}, ($$renderer) => {
			$$renderer.option({ value: null }, ($$renderer) => {
				$$renderer.push(`Selecione uma sala`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array = ensure_array_like(salas);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let s = each_array[$$index];
				$$renderer.option({ value: s.id }, ($$renderer) => {
					$$renderer.push(`${escape_html(s.nome)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div> `);
		if (sala_id) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card grade-card"><div class="grade-header-title"><div class="title-left"><span class="material-symbols-outlined text-primary">event_repeat</span> <h3>Aulas Fixas — Grade Semanal</h3></div></div> `);
			GradeSemanal($$renderer, {
				dias,
				blocos: blocosFixos,
				carregandoLista: carregandoBlocos,
				filtrarPor: {
					campo: "sala_id",
					valor: sala_id
				},
				children: invalid_default_snippet,
				$$slots: { default: ($$renderer, { bloco }) => {
					$$renderer.push(`<div class="bloco-card"><div class="bloco-horario">${escape_html(bloco.hora_inicio)} - ${escape_html(bloco.hora_fim)}</div> <div class="bloco-disciplina">${escape_html(bloco.disciplina)}</div> <div class="bloco-professor"><span class="material-symbols-outlined icon-tiny">person</span> ${escape_html(bloco.professor?.name ?? bloco.professor_id)}</div> <div class="bloco-turma"><span class="material-symbols-outlined icon-tiny">groups</span> ${escape_html(bloco.turma_nome)}</div></div>`);
				} }
			});
			$$renderer.push(`<!----></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="conteudo-principal"><div class="card form-card"><div class="card-header"><span class="material-symbols-outlined icon-large">calendar_add_on</span></div> <form><div class="field"><label for="data-agendamento">Data</label> <input id="data-agendamento" type="date"${attr("value", dataAgendamento)}${attr("min", hojeStr)} required=""/></div> <div class="field"><label for="hora-inicio">Hora de Início</label> <input id="hora-inicio" type="time"${attr("value", horaInicio)} required=""/></div> <div class="field"><label for="hora-fim">Hora de Fim</label> <input id="hora-fim" type="time"${attr("value", horaFim)} required=""/></div> <div class="field"><label for="obs">Observação</label> <input id="obs" type="text"${attr("value", obs)} placeholder="Ex: Aula de reposição"/></div> `);
		if (erro) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="msg-erro">${escape_html(erro)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (sucesso) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="msg-sucesso">${escape_html(sucesso)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="bottom-action"><button type="button" class="btn-secondary"><span class="material-symbols-outlined">restart_alt</span> Limpar</button> <button type="submit" class="btn-primary"${attr("disabled", carregando || !sala_id, true)}><span class="material-symbols-outlined">save</span> ${escape_html(carregando ? "Salvando..." : "Confirmar")}</button></div></form></div> <div class="card calendario-card"><div class="grade-header-title"><div class="title-left"><span class="material-symbols-outlined text-primary">calendar_month</span> <h3>Agendamentos — próximos 60 dias</h3></div> <span class="badge">${escape_html(agendamentos.length)} registros</span></div> `);
		if (!sala_id) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Selecione uma sala para ver os agendamentos.</p>`);
		} else if (carregandoLista) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="estado-vazio">Carregando agendamentos...</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="grade-wrapper"><div class="grade-cabecalho"><!--[-->`);
			const each_array_1 = ensure_array_like(cabecalho);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let dia = each_array_1[$$index_1];
				$$renderer.push(`<div class="cabecalho-dia">${escape_html(dia)}</div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="grade-semanas"><!--[-->`);
			const each_array_2 = ensure_array_like(semanas);
			for (let $$index_4 = 0, $$length = each_array_2.length; $$index_4 < $$length; $$index_4++) {
				let semana = each_array_2[$$index_4];
				$$renderer.push(`<div class="semana-row"><!--[-->`);
				const each_array_3 = ensure_array_like(semana);
				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let dia = each_array_3[$$index_3];
					$$renderer.push(`<div${attr_class(`dia-celula ${stringify(dia && ehHoje(dia) ? "dia-hoje" : "")} ${stringify(!dia ? "dia-vazio" : "")}`)}>`);
					if (dia) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span${attr_class(`dia-numero ${stringify(ehHoje(dia) ? "numero-hoje" : "")}`)}>${escape_html(dia.getDate())}</span> <!--[-->`);
						const each_array_4 = ensure_array_like(agendamentosDoDia(dia));
						for (let $$index_2 = 0, $$length = each_array_4.length; $$index_2 < $$length; $$index_2++) {
							let ag = each_array_4[$$index_2];
							$$renderer.push(`<div class="ag-bloco sala"><span class="ag-hora">${escape_html(formatarHora(ag.data_hora_inicio))} - ${escape_html(formatarHora(ag.data_hora_fim))}</span> `);
							if (ag.obs) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<span class="ag-tipo-label">${escape_html(ag.obs)}</span>`);
							} else $$renderer.push("<!--[-1-->");
							$$renderer.push(`<!--]--></div>`);
						}
						$$renderer.push(`<!--]-->`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]--></div></div></main></div></div>`);
		bind_props($$props, {
			salas,
			sala_id,
			agendamentos,
			blocosFixos,
			carregandoLista,
			carregandoBlocos,
			carregando,
			erro,
			sucesso,
			dataAgendamento,
			horaInicio,
			horaFim,
			obs,
			hojeStr,
			onSubmit,
			onLimpar,
			onSair
		});
	});
}
//#endregion
//#region src/lib/services/AgendamentoServices/AgendamentoSala/Create_Agendamento_Sala_Service.js
async function parseJson(response) {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
/**
* @param {{ sala_id: number, data_hora_inicio: string, data_hora_fim: string, obs: string }} novoAgendamentoSala
* @param {string} token
* @returns {Promise<any>}
*/
async function cadastrarAgendamento(novoAgendamentoSala, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	const resp = await fetch(AGENDAMENTOSALA_ROUTE.cadastrar, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": `Bearer ${token}`
		},
		body: JSON.stringify({
			sala_id: novoAgendamentoSala.sala_id,
			data_hora_inicio: novoAgendamentoSala.data_hora_inicio,
			data_hora_fim: novoAgendamentoSala.data_hora_fim,
			obs: novoAgendamentoSala.obs
		})
	});
	const dados = await parseJson(resp);
	if (!resp.ok) {
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao agendar sala.");
	}
	return dados?.data || dados || {};
}
//#endregion
//#region src/routes/agendamento/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let token = "";
		let sala_id = null;
		let salas = [];
		let dataAgendamento = hoje();
		let horaInicio = "08:00";
		let horaFim = "10:00";
		let obs = "";
		let agendamentos = [];
		let carregandoLista = false;
		let blocosFixos = [];
		let carregandoBlocos = false;
		let carregando = false;
		let erro = "";
		let sucesso = "";
		async function carregarAgendamentos(id) {
			carregandoLista = true;
			erro = "";
			try {
				agendamentos = await carregarAgendamentosSalas(token, id);
			} catch (e) {
				erro = e?.message || "Erro ao carregar agendamentos.";
			} finally {
				carregandoLista = false;
			}
		}
		async function carregarBlocosFixos(id) {
			carregandoBlocos = true;
			try {
				blocosFixos = await carregarHorariosSala(token, id);
			} catch (e) {
				erro = e?.message || "Erro ao carregar aulas fixas.";
			} finally {
				carregandoBlocos = false;
			}
		}
		async function salvarAgendamento() {
			erro = "";
			sucesso = "";
			if (!sala_id) {
				erro = "Selecione uma sala.";
				return;
			}
			if (!dataAgendamento || !horaInicio || !horaFim) {
				erro = "Preencha a data e os horários.";
				return;
			}
			if (horaInicio >= horaFim) {
				erro = "A hora de início deve ser anterior à hora de fim.";
				return;
			}
			carregando = true;
			try {
				await cadastrarAgendamento({
					sala_id,
					data_hora_inicio: `${dataAgendamento}T${horaInicio}`,
					data_hora_fim: `${dataAgendamento}T${horaFim}`,
					obs
				}, token);
				sucesso = "Agendamento realizado com sucesso.";
				resetForm();
				await carregarAgendamentos(sala_id);
			} catch (e) {
				erro = e?.message || "Erro ao realizar agendamento.";
			} finally {
				carregando = false;
			}
		}
		function resetForm() {
			dataAgendamento = hoje();
			horaInicio = "08:00";
			horaFim = "10:00";
			obs = "";
		}
		function hoje() {
			return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		}
		$: if (sala_id) {
			carregarAgendamentos(sala_id);
			carregarBlocosFixos(sala_id);
		} else {
			agendamentos = [];
			blocosFixos = [];
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			AgendamentoCard($$renderer, {
				salas,
				agendamentos,
				blocosFixos,
				carregandoLista,
				carregandoBlocos,
				carregando,
				erro,
				sucesso,
				hojeStr: hoje(),
				onSubmit: salvarAgendamento,
				onLimpar: resetForm,
				onSair: () => goto("/main"),
				get sala_id() {
					return sala_id;
				},
				set sala_id($$value) {
					sala_id = $$value;
					$$settled = false;
				},
				get dataAgendamento() {
					return dataAgendamento;
				},
				set dataAgendamento($$value) {
					dataAgendamento = $$value;
					$$settled = false;
				},
				get horaInicio() {
					return horaInicio;
				},
				set horaInicio($$value) {
					horaInicio = $$value;
					$$settled = false;
				},
				get horaFim() {
					return horaFim;
				},
				set horaFim($$value) {
					horaFim = $$value;
					$$settled = false;
				},
				get obs() {
					return obs;
				},
				set obs($$value) {
					obs = $$value;
					$$settled = false;
				}
			});
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
	});
}
//#endregion
export { _page as default };
