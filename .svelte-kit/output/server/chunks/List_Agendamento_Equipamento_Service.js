import { C as escape_html, S as attr, i as ensure_array_like, l as stringify, n as bind_props, st as fallback, t as attr_class } from "./server.js";
import { t as apiFetch } from "./api.js";
//#region src/lib/components/Card/ConfirmarDelecaoModal.svelte
function ConfirmarDelecaoModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let ehEquipamento, recursoNome;
		let agendamento = fallback($$props["agendamento"], null);
		let onConfirmar = $$props["onConfirmar"];
		let onCancelar = $$props["onCancelar"];
		let processando = fallback($$props["processando"], false);
		let justificativa = "";
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
		$: ehEquipamento = agendamento?.tipo === "equipamento";
		$: recursoNome = ehEquipamento ? agendamento?.equipamento_nome || agendamento?.equipamento_id : agendamento?.sala_nome || agendamento?.sala_id;
		$: if (!agendamento) justificativa = "";
		if (agendamento) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="modal-overlay svelte-ojso7o" role="button" tabindex="-1" aria-label="Fechar modal"><div class="modal-box svelte-ojso7o" role="dialog" aria-modal="true" tabindex="-1"><div class="modal-header svelte-ojso7o"><span class="icon-wrapper svelte-ojso7o"><span class="material-symbols-outlined svelte-ojso7o">warning</span></span> <h3 class="svelte-ojso7o">Confirmar cancelamento</h3></div> <p class="modal-descricao svelte-ojso7o">Deseja cancelar o agendamento do
                ${escape_html(ehEquipamento ? "equipamento" : "sala")} <strong>${escape_html(recursoNome)}</strong>?</p> <p class="modal-horario svelte-ojso7o">${escape_html(formatarDataHora(agendamento.data_hora_inicio))}
                 → 
                ${escape_html(formatarDataHora(agendamento.data_hora_fim))}</p> <div class="modal-campo svelte-ojso7o"><label for="justificativa" class="svelte-ojso7o">Justificativa do cancelamento</label> <textarea id="justificativa" placeholder="Descreva o motivo do cancelamento..." rows="3"${attr("disabled", processando, true)} class="svelte-ojso7o">`);
			const $$body = escape_html(justificativa);
			if ($$body) $$renderer.push(`${$$body}`);
			$$renderer.push(`</textarea></div> <div class="modal-acoes svelte-ojso7o"><button class="btn-secondary svelte-ojso7o"${attr("disabled", processando, true)}>Cancelar</button> <button class="btn-danger svelte-ojso7o"${attr("disabled", processando, true)}>`);
			if (processando) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="material-symbols-outlined spin svelte-ojso7o">progress_activity</span> Cancelando...`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`Confirmar exclusão`);
			}
			$$renderer.push(`<!--]--></button></div></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		bind_props($$props, {
			agendamento,
			onConfirmar,
			onCancelar,
			processando
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
		let onDeletar = fallback($$props["onDeletar"], null);
		let embutido = fallback($$props["embutido"], false);
		let recursoUnico = fallback($$props["recursoUnico"], false);
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
		function responsavelId(ag) {
			return tipoAgendamento(ag) === "equipamento" ? ag.equipamento_responsavel_id : ag.sala_responsavel_id;
		}
		function podeDeletar(ag, status) {
			if (!onDeletar || status !== "futuro") return false;
			if (cargo === "admin") return true;
			if (String(ag.user_id) === String(usuarioId)) return true;
			const respId = responsavelId(ag);
			return respId != null && String(respId) === String(usuarioId);
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
		$$renderer.push(`<div${attr_class("lista-agendamentos-card svelte-1c63qri", void 0, { "embutido": embutido })}><div class="agendamentos-toolbar svelte-1c63qri"><div class="campo-pesquisa-ag svelte-1c63qri"><span class="material-symbols-outlined svelte-1c63qri">search</span> <input type="text"${attr("placeholder", recursoUnico ? "Pesquisar por responsável ou observação..." : "Pesquisar por sala, equipamento ou responsável...")}${attr("value", pesquisaAg)} class="svelte-1c63qri"/></div> <div class="filtro-grupo svelte-1c63qri"><span class="filtro-grupo-label svelte-1c63qri">Status</span> `);
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
			$$renderer.option({ value: "cancelado" }, ($$renderer) => {
				$$renderer.push(`Cancelados`);
			});
		}, "svelte-1c63qri");
		$$renderer.push(`</div> `);
		if (!recursoUnico) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="filtro-grupo svelte-1c63qri"><span class="filtro-grupo-label svelte-1c63qri">Tipo</span> `);
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
			$$renderer.push(`</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="filtro-grupo svelte-1c63qri"><span class="filtro-grupo-label svelte-1c63qri">Ordenar</span> `);
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
			if (!recursoUnico) {
				$$renderer.push("<!--[0-->");
				$$renderer.option({ value: "az" }, ($$renderer) => {
					$$renderer.push(`Nome (A-Z)`);
				});
				$$renderer.push(` `);
				$$renderer.option({ value: "za" }, ($$renderer) => {
					$$renderer.push(`Nome (Z-A)`);
				});
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
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
			onDeletar,
			embutido,
			recursoUnico
		});
	});
}
//#endregion
//#region src/config/routes/Agendamento_Sala_Endpoints.js
var AGENDAMENTOSALA_ROUTE = {
	listar: "/agendamento-salas",
	buscar: (id) => `/agendamento-salas/${id}`,
	cadastrar: "/agendamento-salas",
	deletar: (id) => `/agendamento-salas/${id}`
};
//#endregion
//#region src/lib/services/AgendamentoServices/AgendamentoSala/Deleted_Agendamento_Sala_Service.js
async function parseJson$3(response) {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
/**
* @param {number} id
* @param {string} token
* @param {string} [justificativa]
* @returns {Promise<void>}
*/
async function deletarAgendamentoSala(id, token, justificativa = "") {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	const resp = await apiFetch(AGENDAMENTOSALA_ROUTE.deletar(id), {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({ justificativa })
	});
	if (!resp) return;
	if (!resp.ok) {
		const dados = await parseJson$3(resp);
		if (resp.status === 409) throw new Error(dados?.message || "Agendamento já está cancelado.");
		if (resp.status === 403) throw new Error(dados?.message || "Você não tem permissão para cancelar este agendamento.");
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao cancelar agendamento.");
	}
}
//#endregion
//#region src/config/routes/Agendamento_Equipamento_Endpoints.js
var AGENDAMENTOEQUIPAMENTO_ROUTE = {
	listar: "/agendamento-equipamentos",
	buscar: (id) => `/agendamento-equipamentos/${id}`,
	cadastrar: "/agendamento-equipamentos",
	deletar: (id) => `/agendamento-equipamentos/${id}`
};
//#endregion
//#region src/lib/services/AgendamentoServices/AgendamentoEquipamento/Deleted_Agendamento_equipamento.js
async function parseJson$2(response) {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
/**
* @param {number} id
* @param {string} token
* @param {string} [justificativa]
* @returns {Promise<void>}
*/
async function deletarAgendamentoEquipamento(id, token, justificativa = "") {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	const resp = await apiFetch(AGENDAMENTOEQUIPAMENTO_ROUTE.deletar(id), {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({ justificativa })
	});
	if (!resp) return;
	if (!resp.ok) {
		const dados = await parseJson$2(resp);
		if (resp.status === 409) throw new Error(dados?.message || "Agendamento já está cancelado.");
		if (resp.status === 403) throw new Error(dados?.message || "Você não tem permissão para cancelar este agendamento.");
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao cancelar agendamento.");
	}
}
//#endregion
//#region src/lib/services/AgendamentoServices/AgendamentoSala/List_Agendamento_Sala_Service.js
async function parseJson$1(response) {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
/**
* @param {string} token
* @param {number|null} sala_id
* @returns {Promise<any[]>}
*/
async function carregarAgendamentosSalas(token, sala_id = null) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	const resp = await apiFetch(sala_id ? `${AGENDAMENTOSALA_ROUTE.listar}?sala_id=${sala_id}` : AGENDAMENTOSALA_ROUTE.listar, {
		method: "GET",
		headers: { "Accept": "application/json" }
	});
	if (!resp) return [];
	const dados = await parseJson$1(resp);
	if (!resp.ok) throw new Error(dados?.message || dados?.error || "Erro ao carregar agendamentos.");
	return (Array.isArray(dados) ? dados : dados?.data || []).map((s) => {
		const item = {
			id: s.id,
			user_id: s.user_id || "",
			usuario_nome: s.usuario_nome || "",
			sala_id: s.sala_id || "",
			sala_nome: s.sala_nome || "",
			data_hora_inicio: s.data_hora_inicio || "",
			data_hora_fim: s.data_hora_fim || "",
			obs: s.obs || "",
			status: s.status === false || s.status === 0 || s.status === "0" ? "inativo" : String(s.status ?? "").toLowerCase(),
			justificativa: s.justificativa || s.justificativa_cancelamento || s.motivo_cancelamento || "",
			cancelador_id: s.cancelador_id || "",
			cancelador_nome: s.cancelador_nome || "",
			tipo: "sala"
		};
		console.log("agendamento mapeado:", item);
		return item;
	});
}
//#endregion
//#region src/lib/services/AgendamentoServices/AgendamentoEquipamento/List_Agendamento_Equipamento_Service.js
async function parseJson(response) {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
async function carregarAgendamentosEquipamentos(token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	const resp = await apiFetch(AGENDAMENTOEQUIPAMENTO_ROUTE.listar, {
		method: "GET",
		headers: { "Accept": "application/json" }
	});
	if (!resp) return [];
	const dados = await parseJson(resp);
	if (!resp.ok) throw new Error(dados?.message || dados?.error || "Erro ao carregar agendamentos de equipamento.");
	return (Array.isArray(dados) ? dados : dados?.data || []).map((s) => ({
		id: s.id,
		user_id: s.user_id || "",
		usuario_nome: s.usuario_nome || "",
		equipamento_id: s.equipamento_id || "",
		equipamento_nome: s.equipamento_nome || "",
		data_hora_inicio: s.data_hora_inicio || "",
		data_hora_fim: s.data_hora_fim || "",
		obs: s.obs || "",
		status: s.status === false || s.status === 0 || s.status === "0" ? "inativo" : String(s.status ?? "").toLowerCase(),
		justificativa: s.justificativa || s.justificativa_cancelamento || s.motivo_cancelamento || "",
		cancelador_id: s.cancelador_id || "",
		cancelador_nome: s.cancelador_nome || "",
		tipo: "equipamento"
	}));
}
//#endregion
export { deletarAgendamentoSala as a, ConfirmarDelecaoModal as c, AGENDAMENTOEQUIPAMENTO_ROUTE as i, carregarAgendamentosSalas as n, AGENDAMENTOSALA_ROUTE as o, deletarAgendamentoEquipamento as r, ListaAgendamentosCard as s, carregarAgendamentosEquipamentos as t };
