import "../../../chunks/internal.js";
import { C as escape_html, S as attr, c as slot, i as ensure_array_like, n as bind_props, nt as invalid_default_snippet, st as fallback, t as attr_class } from "../../../chunks/server.js";
import { t as goto } from "../../../chunks/client.js";
import "../../../chunks/navigation.js";
import { t as apiFetch } from "../../../chunks/api.js";
import "../../../chunks/List_Equipamento_Service.js";
import { a as BlocoHorarioCard, o as GradeSemanal, r as carregarHorariosSala } from "../../../chunks/List_Horario_Service.js";
import "../../../chunks/List_Sala_Service.js";
import { n as GradeMensal, t as BlocoAgendamentoCard } from "../../../chunks/BlocoAgendamentoCard.js";
import { a as deletarAgendamentoSala, c as ConfirmarDelecaoModal, i as AGENDAMENTOEQUIPAMENTO_ROUTE, n as carregarAgendamentosSalas, o as AGENDAMENTOSALA_ROUTE, r as deletarAgendamentoEquipamento, t as carregarAgendamentosEquipamentos } from "../../../chunks/List_Agendamento_Equipamento_Service.js";
//#region src/lib/components/Card/ConfirmarRecorrenciaModal.svelte
function ConfirmarRecorrenciaModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {{ data: string, payload: Object }[] | null} */
		let ocorrencias = fallback($$props["ocorrencias"], null);
		let enviando = fallback($$props["enviando"], false);
		/** @type {{ atual: number, total: number }} */
		let progresso = fallback($$props["progresso"], () => ({
			atual: 0,
			total: 0
		}), true);
		/** @type {{ sucesso: { data: string, criado: any }[], falha: { data: string, erro: string }[] } | null} */
		let resultadoFinal = fallback($$props["resultadoFinal"], null);
		let horaInicio = fallback($$props["horaInicio"], "");
		let horaFim = fallback($$props["horaFim"], "");
		let onConfirmar = $$props["onConfirmar"];
		let onCancelar = $$props["onCancelar"];
		if (ocorrencias || resultadoFinal) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="modal-overlay"><div class="modal-recorrencia">`);
			if (resultadoFinal) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<h3>Resultado do agendamento</h3> <p class="msg-sucesso">${escape_html(resultadoFinal.sucesso.length)} agendamento(s) criado(s) com
                    sucesso.</p> `);
				if (resultadoFinal.falha.length > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="msg-erro">${escape_html(resultadoFinal.falha.length)} falharam:</p> <ul class="lista-falhas"><!--[-->`);
					const each_array = ensure_array_like(resultadoFinal.falha);
					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let f = each_array[$$index];
						$$renderer.push(`<li>${escape_html(f.data)}: ${escape_html(f.erro)}</li>`);
					}
					$$renderer.push(`<!--]--></ul>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <div class="bottom-action"><button class="btn-primary">Fechar</button></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<h3>Confirmar ${escape_html(ocorrencias.length)} agendamento(s)</h3> <ul class="lista-ocorrencias"><!--[-->`);
				const each_array_1 = ensure_array_like(ocorrencias);
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let o = each_array_1[$$index_1];
					$$renderer.push(`<li>${escape_html(o.data)} — ${escape_html(horaInicio)} às ${escape_html(horaFim)}</li>`);
				}
				$$renderer.push(`<!--]--></ul> <p class="aviso-modal">Alguns podem falhar caso já exista conflito de horário.</p> <div class="bottom-action"><button class="btn-secondary"${attr("disabled", enviando, true)}>Cancelar</button> <button class="btn-primary"${attr("disabled", enviando, true)}>${escape_html(enviando ? `Enviando ${progresso.atual}/${progresso.total}...` : "Confirmar e Agendar")}</button></div>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		bind_props($$props, {
			ocorrencias,
			enviando,
			progresso,
			resultadoFinal,
			horaInicio,
			horaFim,
			onConfirmar,
			onCancelar
		});
	});
}
//#endregion
//#region src/lib/components/agendamento/AgendamentoCard.svelte
function AgendamentoCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let agendamentosVisiveis;
		let modo = fallback($$props["modo"], "sala");
		let salas = fallback($$props["salas"], () => [], true);
		let sala_id = fallback($$props["sala_id"], null);
		let agendamentos = fallback($$props["agendamentos"], () => [], true);
		let blocosFixos = fallback($$props["blocosFixos"], () => [], true);
		let carregandoLista = fallback($$props["carregandoLista"], false);
		let carregandoBlocos = fallback($$props["carregandoBlocos"], false);
		let carregando = fallback($$props["carregando"], false);
		let erro = fallback($$props["erro"], "");
		let sucesso = fallback($$props["sucesso"], "");
		let tipo = fallback($$props["tipo"], "avulso");
		let diasSemana = fallback($$props["diasSemana"], () => [], true);
		let dataAgendamento = fallback($$props["dataAgendamento"], "");
		let horaInicio = fallback($$props["horaInicio"], "");
		let horaFim = fallback($$props["horaFim"], "");
		let obs = fallback($$props["obs"], "");
		let hojeStr = fallback($$props["hojeStr"], "");
		let onSubmit = $$props["onSubmit"];
		let onLimpar = $$props["onLimpar"];
		let onSair = $$props["onSair"];
		let ocorrenciasPendentes = fallback($$props["ocorrenciasPendentes"], null);
		let enviando = fallback($$props["enviando"], false);
		let progresso = fallback($$props["progresso"], () => ({
			atual: 0,
			total: 0
		}), true);
		let resultadoFinal = fallback($$props["resultadoFinal"], null);
		let onConfirmarRecorrencia = $$props["onConfirmarRecorrencia"];
		let onCancelarRecorrencia = $$props["onCancelarRecorrencia"];
		let token = "";
		let cargo = null;
		let usuarioId = null;
		const dias = [
			"segunda",
			"terca",
			"quarta",
			"quinta",
			"sexta",
			"sabado",
			"domingo"
		];
		const diasSemanaOpcoes = [
			{
				key: "dom",
				label: "Dom"
			},
			{
				key: "seg",
				label: "Seg"
			},
			{
				key: "ter",
				label: "Ter"
			},
			{
				key: "qua",
				label: "Qua"
			},
			{
				key: "qui",
				label: "Qui"
			},
			{
				key: "sex",
				label: "Sex"
			},
			{
				key: "sab",
				label: "Sab"
			}
		];
		let agendamentoParaDeletar = null;
		let cancelandoId = null;
		function abrirModalDeletar(ag) {
			if (cancelandoId) return;
			agendamentoParaDeletar = ag;
		}
		function fecharModalDeletar() {
			if (cancelandoId) return;
			agendamentoParaDeletar = null;
		}
		async function confirmarDeletar(ag) {
			cancelandoId = `${ag.tipo}-${ag.id}`;
			erro = "";
			try {
				if (ag.tipo === "sala") await deletarAgendamentoSala(ag.id, token, ag.justificativa || "");
				else if (ag.tipo === "equipamento") await deletarAgendamentoEquipamento(ag.id, token, ag.justificativa || "");
				agendamentos = agendamentos.filter((a) => a.id !== ag.id || a.tipo !== ag.tipo);
				agendamentoParaDeletar = null;
			} catch (e) {
				erro = e?.message || "Erro ao deletar agendamento.";
			} finally {
				cancelandoId = null;
			}
		}
		$: agendamentosVisiveis = agendamentos;
		$$renderer.push(`<div class="escopo-agendamento">`);
		ConfirmarDelecaoModal($$renderer, {
			agendamento: agendamentoParaDeletar,
			onConfirmar: confirmarDeletar,
			onCancelar: fecharModalDeletar,
			processando: !!cancelandoId
		});
		$$renderer.push(`<!----> `);
		ConfirmarRecorrenciaModal($$renderer, {
			ocorrencias: ocorrenciasPendentes,
			enviando,
			progresso,
			resultadoFinal,
			horaInicio,
			horaFim,
			onConfirmar: onConfirmarRecorrencia,
			onCancelar: onCancelarRecorrencia
		});
		$$renderer.push(`<!----> <div class="scaffold"><header class="app-bar"><div class="title-section"><h1>Portal de Agendamento</h1> <span>Novo Agendamento</span></div> <button class="btn-icon" title="Voltar"><span class="material-symbols-outlined">arrow_back</span></button></header> <main class="body-content"><div class="toggle-container"></div> <!--[-->`);
		slot($$renderer, $$props, "botoes-topo", {}, null);
		$$renderer.push(`<!--]--> <div class="card sala-select-card">`);
		$$renderer.select({
			id: "sala-select",
			value: sala_id
		}, ($$renderer) => {
			$$renderer.option({ value: null }, ($$renderer) => {
				$$renderer.push(`Selecione ${escape_html(modo === "sala" ? "uma sala" : "um equipamento")}`);
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
		$$renderer.push(` <button type="button"${attr_class(`toggle-btn ${modo === "sala" ? "active" : ""}`)}><span class="material-symbols-outlined">meeting_room</span> Salas</button> <button type="button"${attr_class(`toggle-btn ${modo === "equipamento" ? "active" : ""}`)}><span class="material-symbols-outlined">devices</span> Equipamentos</button></div> `);
		if (sala_id && modo === "sala") {
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
					BlocoHorarioCard($$renderer, {
						bloco,
						mostrarTurma: true
					});
				} }
			});
			$$renderer.push(`<!----></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="conteudo-principal"><div class="card calendario-card"><div class="grade-header-title"><div class="title-left"><span class="material-symbols-outlined text-primary">calendar_month</span> <h3>Agendamentos — próximos 60 dias</h3></div> <div class="toggle-visao" role="group" aria-label="Modo de visualização"><button type="button" title="Calendário"${attr_class("", void 0, { "ativo": true })}><span class="material-symbols-outlined">calendar_view_month</span></button> <button type="button" title="Lista"${attr_class("", void 0, { "ativo": false })}><span class="material-symbols-outlined">view_list</span></button></div> <span class="badge">${escape_html(agendamentosVisiveis.length)}
                            ${escape_html(agendamentosVisiveis.length === 1 ? "registro" : "registros")}</span></div> `);
		if (!sala_id) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Selecione uma sala para ver os agendamentos.</p>`);
		} else {
			$$renderer.push("<!--[1-->");
			GradeMensal($$renderer, {
				agendamentos: agendamentosVisiveis,
				hojeStr,
				carregandoLista,
				children: invalid_default_snippet,
				$$slots: { default: ($$renderer, { ag }) => {
					BlocoAgendamentoCard($$renderer, {
						ag,
						usuarioId,
						cargo,
						onDeletar: abrirModalDeletar
					});
				} }
			});
		}
		$$renderer.push(`<!--]--></div> <div class="card form-card"><div class="card-header"><span class="material-symbols-outlined icon-large">calendar_add_on</span></div> <div class="tabs-recorrencia"><button type="button"${attr_class(`tab-btn ${tipo === "avulso" ? "ativo" : ""}`)}>Avulso</button> <button type="button"${attr_class(`tab-btn ${tipo === "semanal" ? "ativo" : ""}`)}>Semanal</button> <button type="button"${attr_class(`tab-btn ${tipo === "quinzenal" ? "ativo" : ""}`)}>Quinzenal</button></div> <form><div class="form-fields"><div class="field"><label for="data-agendamento">${escape_html(tipo === "avulso" ? "Data" : "Data de início")}</label> <input id="data-agendamento" type="date"${attr("value", dataAgendamento)}${attr("min", hojeStr)} required=""/></div> <div class="field"><label for="hora-inicio">Hora de Início</label> <input id="hora-inicio" type="time"${attr("value", horaInicio)} required=""/></div> <div class="field"><label for="hora-fim">Hora de Fim</label> <input id="hora-fim" type="time"${attr("value", horaFim)} required=""/></div> <div class="field"><label for="obs">Observação</label> <input id="obs" type="text"${attr("value", obs)} placeholder="Ex: Aula de reposição"/></div></div> `);
		if (tipo !== "avulso") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="field dias-semana-field"><div class="dias-semana-label">Dias da semana</div> <div class="dias-semana" role="group" aria-label="Dias da semana"><!--[-->`);
			const each_array_1 = ensure_array_like(diasSemanaOpcoes);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let d = each_array_1[$$index_1];
				$$renderer.push(`<button type="button"${attr_class(`dia-btn ${diasSemana.includes(d.key) ? "ativo" : ""}`)}>${escape_html(d.label)}</button>`);
			}
			$$renderer.push(`<!--]--></div></div> <p class="aviso-recorrencia"><span class="material-symbols-outlined">info</span> ${escape_html(tipo === "semanal" ? "Cobre 7 dias a partir da data escolhida." : "Cobre 14 dias a partir da data escolhida.")}
                                Início só a partir de amanhã.</p>`);
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
		$$renderer.push(`<!--]--> <div class="bottom-action"><button type="button" class="btn-secondary"><span class="material-symbols-outlined">restart_alt</span> Limpar</button> <button type="submit" class="btn-primary"${attr("disabled", carregando || !sala_id, true)}><span class="material-symbols-outlined">save</span> ${escape_html(carregando ? "Salvando..." : tipo === "avulso" ? "Confirmar" : "Revisar Agendamentos")}</button></div></form></div></div></main></div></div>`);
		bind_props($$props, {
			modo,
			salas,
			sala_id,
			agendamentos,
			blocosFixos,
			carregandoLista,
			carregandoBlocos,
			carregando,
			erro,
			sucesso,
			tipo,
			diasSemana,
			dataAgendamento,
			horaInicio,
			horaFim,
			obs,
			hojeStr,
			onSubmit,
			onLimpar,
			onSair,
			ocorrenciasPendentes,
			enviando,
			progresso,
			resultadoFinal,
			onConfirmarRecorrencia,
			onCancelarRecorrencia
		});
	});
}
//#endregion
//#region src/lib/services/AgendamentoServices/AgendamentoSala/Create_Agendamento_Sala_Service.js
async function parseJson$1(response) {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
async function cadastrarAgendamento$1(novoAgendamentoSala, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!isFuturo(novoAgendamentoSala.data_hora_inicio)) throw new Error("Não é possível agendar para um horário que já passou.");
	const resp = await apiFetch(AGENDAMENTOSALA_ROUTE.cadastrar, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			sala_id: novoAgendamentoSala.sala_id,
			data_hora_inicio: novoAgendamentoSala.data_hora_inicio,
			data_hora_fim: novoAgendamentoSala.data_hora_fim,
			obs: novoAgendamentoSala.obs
		})
	});
	if (!resp) return;
	const dados = await parseJson$1(resp);
	if (!resp.ok) {
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao agendar sala.");
	}
	return dados?.data || dados || {};
}
function isFuturo(dataHoraInicio) {
	const inicio = new Date(dataHoraInicio);
	if (isNaN(inicio.getTime())) return false;
	return inicio >= /* @__PURE__ */ new Date();
}
//#endregion
//#region src/lib/services/AgendamentoServices/AgendamentoEquipamento/Create_Agendamento_Equipamento_Service.js
async function parseJson(response) {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
async function cadastrarAgendamento(novoAgendamentoEquipamento, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	const resp = await apiFetch(AGENDAMENTOEQUIPAMENTO_ROUTE.cadastrar, {
		method: "POST",
		headers: { "Accept": "application/json" },
		body: JSON.stringify({
			equipamento_id: novoAgendamentoEquipamento.equipamento_id,
			data_hora_inicio: novoAgendamentoEquipamento.data_hora_inicio,
			data_hora_fim: novoAgendamentoEquipamento.data_hora_fim,
			obs: novoAgendamentoEquipamento.obs
		})
	});
	if (!resp) return {};
	const dados = await parseJson(resp);
	if (!resp.ok) {
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao agendar equipamento.");
	}
	return dados?.data || dados || {};
}
//#endregion
//#region src/lib/services/RecorrenciaService/Validar_Recorrencia.js
/**
* Retorna a data de hoje "zerada" (sem hora), no fuso local.
* @returns {Date}
*/
function hojeSemHora() {
	const agora = /* @__PURE__ */ new Date();
	return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}
/**
* Valida se a data de início de uma recorrência (semanal/quinzenal) é válida.
* Regra: só pode começar a partir de amanhã (não pode ser hoje nem retroativo).
* @param {string} dataInicio - 'YYYY-MM-DD'
* @returns {string|null} mensagem de erro, ou null se válido
*/
function validarDataInicioRecorrencia(dataInicio) {
	if (!dataInicio) return "Informe a data de início.";
	const [ano, mes, dia] = dataInicio.split("-").map(Number);
	if (new Date(ano, mes - 1, dia) <= hojeSemHora()) return "Agendamentos semanais ou quinzenais só podem começar a partir de amanhã.";
	return null;
}
/**
* Valida o conjunto completo de campos de uma recorrência antes de gerar as datas.
* @param {Object} params
* @param {'avulso'|'semanal'|'quinzenal'} params.tipo
* @param {string[]} params.diasSemana
* @param {string} params.dataInicio - 'YYYY-MM-DD'
* @param {string} params.horaInicio - 'HH:mm'
* @param {string} params.horaFim - 'HH:mm'
* @returns {string|null} mensagem de erro, ou null se válido
*/
function validarRecorrencia({ tipo, diasSemana, dataInicio, horaInicio, horaFim }) {
	if (tipo === "avulso") return null;
	if (!diasSemana || diasSemana.length === 0) return "Selecione pelo menos um dia da semana.";
	if (!dataInicio || !horaInicio || !horaFim) return "Preencha a data de início e os horários.";
	const erroDataInicio = validarDataInicioRecorrencia(dataInicio);
	if (erroDataInicio) return erroDataInicio;
	if (horaFim <= horaInicio) return "O horário de fim deve ser depois do horário de início.";
	return null;
}
//#endregion
//#region src/lib/services/RecorrenciaService/Gerar_Datas_Recorrentes.js
var MAPA_DIAS = {
	dom: 0,
	seg: 1,
	ter: 2,
	qua: 3,
	qui: 4,
	sex: 5,
	sab: 6
};
var DURACAO_DIAS = {
	semanal: 7,
	quinzenal: 14
};
/**
* Formata um objeto Date como 'YYYY-MM-DD' no fuso local.
* @param {Date} data
* @returns {string}
*/
function formatarDataLocal(data) {
	return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}
/**
* Gera as datas de ocorrência de um agendamento recorrente.
* Semanal cobre 7 dias a partir da data de início; quinzenal cobre 14 dias.
* @param {Object} params
* @param {string[]} params.diasSemana - ex: ['seg', 'qua', 'sex']
* @param {string} params.dataInicio - 'YYYY-MM-DD'
* @param {string} params.horaInicio - 'HH:mm'
* @param {string} params.horaFim - 'HH:mm'
* @param {'semanal'|'quinzenal'} params.recorrencia
* @returns {{ data: string, data_hora_inicio: string, data_hora_fim: string }[]}
*/
function gerarDatasRecorrentes({ diasSemana, dataInicio, horaInicio, horaFim, recorrencia }) {
	const diasSelecionados = diasSemana.map((d) => MAPA_DIAS[d]);
	const [anoIni, mesIni, diaIni] = dataInicio.split("-").map(Number);
	const inicio = new Date(anoIni, mesIni - 1, diaIni);
	const totalDias = DURACAO_DIAS[recorrencia];
	const fim = new Date(inicio);
	fim.setDate(fim.getDate() + (totalDias - 1));
	const ocorrencias = [];
	let dataAtual = new Date(inicio);
	while (dataAtual <= fim) {
		if (diasSelecionados.includes(dataAtual.getDay())) {
			const dataStr = formatarDataLocal(dataAtual);
			ocorrencias.push({
				data: dataStr,
				data_hora_inicio: `${dataStr} ${horaInicio}:00`,
				data_hora_fim: `${dataStr} ${horaFim}:00`
			});
		}
		dataAtual.setDate(dataAtual.getDate() + 1);
	}
	return ocorrencias;
}
//#endregion
//#region src/lib/services/RecorrenciaService/Executar_Lote_Agendamentos.js
/**
* Executa a criação de múltiplos agendamentos sequencialmente, um de cada vez.
* Sequencial de propósito: evita que requisições simultâneas passem pela
* validação de conflito de horário do backend ao mesmo tempo.
*
* @param {{ data: string, payload: Object }[]} ocorrencias - lista de ocorrências, cada uma com a data (pra exibição) e o payload pronto pra enviar
* @param {(payload: Object, token: string) => Promise<any>} criarFn - função de criação do agendamento (sala ou equipamento)
* @param {string} token
* @param {(progresso: { atual: number, total: number }) => void} [onProgresso] - callback opcional, chamado após cada tentativa
* @returns {Promise<{ sucesso: { data: string, criado: any }[], falha: { data: string, erro: string }[] }>}
*/
async function executarLoteAgendamentos(ocorrencias, criarFn, token, onProgresso) {
	const resultados = {
		sucesso: [],
		falha: []
	};
	for (let i = 0; i < ocorrencias.length; i++) {
		const ocorrencia = ocorrencias[i];
		try {
			const criado = await criarFn(ocorrencia.payload, token);
			resultados.sucesso.push({
				data: ocorrencia.data,
				criado
			});
		} catch (e) {
			resultados.falha.push({
				data: ocorrencia.data,
				erro: e?.message || "Erro desconhecido."
			});
		}
		if (onProgresso) onProgresso({
			atual: i + 1,
			total: ocorrencias.length
		});
	}
	return resultados;
}
//#endregion
//#region src/routes/agendamento/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let token = "";
		let modo = "sala";
		let salas = [];
		let equipamentos = [];
		let itensDisponiveis = [];
		let itemSelecionadoId = null;
		/** @type {'avulso' | 'semanal' | 'quinzenal'} */
		let tipo = "avulso";
		let diasSemana = [];
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
		let ocorrenciasPendentes = null;
		let enviando = false;
		let progresso = {
			atual: 0,
			total: 0
		};
		let resultadoFinal = null;
		async function carregarAgendamentos(id) {
			carregandoLista = true;
			erro = "";
			try {
				if (modo === "sala") agendamentos = (await carregarAgendamentosSalas(token, id)).map((agendamento) => ({
					...agendamento,
					tipo: "sala"
				}));
				else agendamentos = (await carregarAgendamentosEquipamentos(token)).filter((agendamento) => agendamento.equipamento_id === id).map((agendamento) => ({
					...agendamento,
					tipo: "equipamento"
				}));
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
			resultadoFinal = null;
			if (!itemSelecionadoId) {
				erro = `Selecione um${modo === "sala" ? "a sala" : " equipamento"}.`;
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
			const payloadBase = {
				data_hora_inicio: `${dataAgendamento}T${horaInicio}`,
				data_hora_fim: `${dataAgendamento}T${horaFim}`,
				obs
			};
			if (modo === "sala") payloadBase.sala_id = itemSelecionadoId;
			else payloadBase.equipamento_id = itemSelecionadoId;
			const serviceCadastrar = modo === "sala" ? cadastrarAgendamento$1 : cadastrarAgendamento;
			if (tipo === "avulso") {
				carregando = true;
				try {
					await serviceCadastrar(payloadBase, token);
					sucesso = "Agendamento realizado com sucesso.";
					resetForm();
					await carregarAgendamentos(itemSelecionadoId);
				} catch (e) {
					erro = e?.message || "Erro ao realizar agendamento.";
				} finally {
					carregando = false;
				}
				return;
			}
			const erroValidacao = validarRecorrencia({
				tipo,
				diasSemana,
				dataInicio: dataAgendamento,
				horaInicio,
				horaFim
			});
			if (erroValidacao) {
				erro = erroValidacao;
				return;
			}
			const datasGeradas = gerarDatasRecorrentes({
				diasSemana,
				dataInicio: dataAgendamento,
				horaInicio,
				horaFim,
				recorrencia: tipo
			});
			if (datasGeradas.length === 0) {
				erro = "Nenhuma data corresponde aos dias da semana selecionados nesse período.";
				return;
			}
			ocorrenciasPendentes = datasGeradas.map((d) => ({
				data: d.data,
				payload: {
					...payloadBase,
					data_hora_inicio: d.data_hora_inicio,
					data_hora_fim: d.data_hora_fim
				}
			}));
		}
		async function confirmarRecorrencia() {
			if (!ocorrenciasPendentes) return;
			enviando = true;
			progresso = {
				atual: 0,
				total: ocorrenciasPendentes.length
			};
			resultadoFinal = await executarLoteAgendamentos(ocorrenciasPendentes, modo === "sala" ? cadastrarAgendamento$1 : cadastrarAgendamento, token, (p) => progresso = p);
			enviando = false;
			ocorrenciasPendentes = null;
			resetForm();
			await carregarAgendamentos(itemSelecionadoId);
		}
		function cancelarRecorrencia() {
			ocorrenciasPendentes = null;
			resultadoFinal = null;
		}
		function resetForm() {
			tipo = "avulso";
			diasSemana = [];
			dataAgendamento = hoje();
			horaInicio = "08:00";
			horaFim = "10:00";
			obs = "";
		}
		function hoje() {
			return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		}
		$: if (modo === "sala") itensDisponiveis = salas;
		else itensDisponiveis = equipamentos;
		$: if (itemSelecionadoId) {
			carregarAgendamentos(itemSelecionadoId);
			if (modo === "sala") carregarBlocosFixos(itemSelecionadoId);
			else blocosFixos = [];
		} else {
			agendamentos = [];
			blocosFixos = [];
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			AgendamentoCard($$renderer, {
				salas: itensDisponiveis,
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
				ocorrenciasPendentes,
				enviando,
				progresso,
				resultadoFinal,
				onConfirmarRecorrencia: confirmarRecorrencia,
				onCancelarRecorrencia: cancelarRecorrencia,
				get modo() {
					return modo;
				},
				set modo($$value) {
					modo = $$value;
					$$settled = false;
				},
				get sala_id() {
					return itemSelecionadoId;
				},
				set sala_id($$value) {
					itemSelecionadoId = $$value;
					$$settled = false;
				},
				get tipo() {
					return tipo;
				},
				set tipo($$value) {
					tipo = $$value;
					$$settled = false;
				},
				get diasSemana() {
					return diasSemana;
				},
				set diasSemana($$value) {
					diasSemana = $$value;
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
