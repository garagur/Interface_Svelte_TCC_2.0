import { S as escape_html, n as bind_props, ot as fallback, x as attr } from "./server.js";
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
export { deletarAgendamentoSala as a, AGENDAMENTOEQUIPAMENTO_ROUTE as i, carregarAgendamentosSalas as n, AGENDAMENTOSALA_ROUTE as o, deletarAgendamentoEquipamento as r, ConfirmarDelecaoModal as s, carregarAgendamentosEquipamentos as t };
