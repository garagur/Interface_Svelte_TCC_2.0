import "../../../chunks/internal.js";
import { T as escape_html, lt as fallback, n as bind_props, t as attr_class } from "../../../chunks/server.js";
import { t as goto } from "../../../chunks/client.js";
import "../../../chunks/navigation.js";
import { t as CabecalhoGlobal } from "../../../chunks/CabecalhoGlobal.js";
import "../../../chunks/BlocoAgendamentoCard.js";
import { c as deletarAgendamentoSala, d as ConfirmarDelecaoModal, n as ConfirmarConflitoModal, o as deletarAgendamentoEquipamento, r as confirmarAgendamento, t as encontrarConflitosOciosos, u as ListaAgendamentosCard } from "../../../chunks/agendamentoConflito.js";
import "../../../chunks/Buscar_Usuario_Service.js";
//#region src/lib/components/main/MainCard.svelte
function MainCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let agendamentosVisiveis, totalRegistros;
		let titulo = fallback($$props["titulo"], "");
		let nome = fallback($$props["nome"], "");
		let matricula = fallback($$props["matricula"], "");
		let cargo = fallback($$props["cargo"], "");
		let usuarioId = fallback($$props["usuarioId"], null);
		let agendamentos = fallback($$props["agendamentos"], () => [], true);
		let carregando = fallback($$props["carregando"], false);
		let erro = fallback($$props["erro"], "");
		let onSair = fallback($$props["onSair"], () => {});
		let onNovoAgendamento = fallback($$props["onNovoAgendamento"], () => {});
		let onConfirmarAgendamento = fallback($$props["onConfirmarAgendamento"], null);
		/** @type {(ag: any) => Promise<void>} */
		let onDeletar = fallback($$props["onDeletar"], async () => {});
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
			try {
				await onDeletar(ag);
				agendamentoParaDeletar = null;
			} catch {} finally {
				cancelandoId = null;
			}
		}
		function sair() {
			onSair();
		}
		$: agendamentosVisiveis = agendamentos;
		$: totalRegistros = agendamentosVisiveis.length;
		ConfirmarDelecaoModal($$renderer, {
			agendamento: agendamentoParaDeletar,
			onConfirmar: confirmarDeletar,
			onCancelar: fecharModalDeletar,
			processando: !!cancelandoId
		});
		$$renderer.push(`<!----> <div class="scaffold">`);
		CabecalhoGlobal($$renderer, {
			titulo,
			nome,
			matricula,
			cargo,
			onLogout: sair
		});
		$$renderer.push(`<!----> <main class="body-content"><div class="grade-header-title"><div class="title-left"><span class="material-symbols-outlined text-primary">calendar_month</span> <h2>Agendamentos</h2></div> <div class="toggle-visao" role="group" aria-label="Modo de visualização"><button type="button" title="Lista de agendamentos" aria-label="Lista de agendamentos"${attr_class("", void 0, { "ativo": true })}><span class="material-symbols-outlined">view_list</span></button> <button type="button" title="Grade mensal" aria-label="Grade mensal"${attr_class("", void 0, { "ativo": false })}><span class="material-symbols-outlined">calendar_view_month</span></button></div> <div class="badge">${escape_html(totalRegistros)}
                ${escape_html(totalRegistros === 1 ? "registro" : "registros")}</div></div> `);
		if (erro) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="msg-erro svelte-o17hi9">${escape_html(erro)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="calendario-scroll-area">`);
		$$renderer.push("<!--[0-->");
		ListaAgendamentosCard($$renderer, {
			agendamentos: agendamentosVisiveis,
			carregando,
			usuarioId,
			cargo,
			onDeletar: abrirModalDeletar,
			onConfirmar: onConfirmarAgendamento
		});
		$$renderer.push(`<!--]--></div> <div class="bottom-action"><button class="btn-primary btn-novo-agendamento"><span class="material-symbols-outlined">add_circle</span> Novo Agendamento</button></div></main></div>`);
		bind_props($$props, {
			titulo,
			nome,
			matricula,
			cargo,
			usuarioId,
			agendamentos,
			carregando,
			erro,
			onSair,
			onNovoAgendamento,
			onConfirmarAgendamento,
			onDeletar
		});
	});
}
//#endregion
//#region src/routes/main/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let token = "";
		let titulo = "Portal de Agendamento";
		let nome = "";
		let matricula = "";
		let cargo = "";
		let usuarioId = null;
		let agendamentos = [];
		let carregando = false;
		let erro = "";
		let agendamentoEmConflito = null;
		let confirmandoConflito = false;
		async function confirmarAgendamento$1(ag) {
			const conflitos = encontrarConflitosOciosos(ag, agendamentos);
			if (conflitos.length > 0) {
				agendamentoEmConflito = {
					agendamento: ag,
					conflitos
				};
				return;
			}
			try {
				const atualizado = await confirmarAgendamento(ag);
				agendamentos = agendamentos.map((item) => item.id === ag.id && item.tipo === ag.tipo ? {
					...item,
					status: atualizado?.status || "ativo"
				} : item);
			} catch (e) {
				erro = e?.message || "Erro ao confirmar o agendamento.";
				throw e;
			}
		}
		async function confirmarConflito({ agendamento, conflitos, justificativa }) {
			confirmandoConflito = true;
			try {
				await Promise.all(conflitos.map(async (conflito) => {
					if (conflito.tipo === "sala") await deletarAgendamentoSala(conflito.id, token, justificativa || "");
					else if (conflito.tipo === "equipamento") await deletarAgendamentoEquipamento(conflito.id, token, justificativa || "");
				}));
				agendamentos = agendamentos.map((item) => {
					if (conflitos.some((conflito) => conflito.id === item.id && conflito.tipo === item.tipo)) return {
						...item,
						status: "inativo",
						justificativa: justificativa || item.justificativa || ""
					};
					if (item.id === agendamento.id && item.tipo === agendamento.tipo) return {
						...item,
						status: "ativo",
						justificativa: item.justificativa || ""
					};
					return item;
				});
				const atualizado = await confirmarAgendamento(agendamento);
				agendamentos = agendamentos.map((item) => item.id === agendamento.id && item.tipo === agendamento.tipo ? {
					...item,
					status: atualizado?.status || "ativo"
				} : item);
				agendamentoEmConflito = null;
			} catch (e) {
				erro = e?.message || "Erro ao confirmar o agendamento em conflito.";
				throw e;
			} finally {
				confirmandoConflito = false;
			}
		}
		async function deletarAgendamento(ag) {
			erro = "";
			try {
				if (ag.tipo === "sala") await deletarAgendamentoSala(ag.id, token, ag.justificativa || "");
				else if (ag.tipo === "equipamento") await deletarAgendamentoEquipamento(ag.id, token, ag.justificativa || "");
				agendamentos = agendamentos.map((item) => item.id === ag.id && item.tipo === ag.tipo ? {
					...item,
					status: "inativo",
					justificativa: ag.justificativa || ""
				} : item);
			} catch (e) {
				erro = e?.message || "Erro ao deletar agendamento.";
				throw e;
			}
		}
		function irParaNovoAgendamento() {
			goto("/agendamento");
		}
		function sair() {
			localStorage.clear();
			goto("/login");
		}
		ConfirmarConflitoModal($$renderer, {
			agendamento: agendamentoEmConflito?.agendamento ?? null,
			conflitos: agendamentoEmConflito?.conflitos ?? [],
			onConfirmar: confirmarConflito,
			onCancelar: () => agendamentoEmConflito = null,
			processando: confirmandoConflito
		});
		$$renderer.push(`<!----> `);
		MainCard($$renderer, {
			titulo,
			nome,
			matricula,
			cargo,
			usuarioId,
			agendamentos,
			carregando,
			erro,
			onSair: sair,
			onNovoAgendamento: irParaNovoAgendamento,
			onConfirmarAgendamento: confirmarAgendamento$1,
			onDeletar: deletarAgendamento
		});
		$$renderer.push(`<!---->`);
	});
}
//#endregion
export { _page as default };
