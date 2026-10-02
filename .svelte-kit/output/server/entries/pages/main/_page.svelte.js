import "../../../chunks/internal.js";
import { T as escape_html, lt as fallback, n as bind_props, t as attr_class } from "../../../chunks/server.js";
import { t as goto } from "../../../chunks/client.js";
import "../../../chunks/navigation.js";
import { t as CabecalhoGlobal } from "../../../chunks/CabecalhoGlobal.js";
import "../../../chunks/BlocoAgendamentoCard.js";
import { a as deletarAgendamentoSala, c as ConfirmarDelecaoModal, r as deletarAgendamentoEquipamento, s as ListaAgendamentosCard } from "../../../chunks/List_Agendamento_Equipamento_Service.js";
import "../../../chunks/Buscar_Usuario_Service.js";
//#region src/lib/components/main/MainCard.svelte
function MainCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let agendamentosVisiveis, totalRegistros;
		let titulo = fallback($$props["titulo"], "");
		let nome = fallback($$props["nome"], "");
		let matricula = fallback($$props["matricula"], "");
		let cargo = fallback($$props["cargo"], "");
		let onSair = fallback($$props["onSair"], () => {});
		let onNovoAgendamento = fallback($$props["onNovoAgendamento"], () => {});
		let agendamentos = fallback($$props["agendamentos"], () => [], true);
		let carregando = fallback($$props["carregando"], false);
		let erro = fallback($$props["erro"], "");
		let token = "";
		let usuarioId = null;
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
				agendamentos = agendamentos.map((a) => a.id === ag.id && a.tipo === ag.tipo ? {
					...a,
					status: "inativo",
					justificativa: ag.justificativa || ""
				} : a);
				agendamentoParaDeletar = null;
			} catch (e) {
				erro = e?.message || "Erro ao deletar agendamento.";
			} finally {
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
			onDeletar: abrirModalDeletar
		});
		$$renderer.push(`<!--]--></div> <div class="bottom-action"><button class="btn-primary btn-novo-agendamento"><span class="material-symbols-outlined">add_circle</span> Novo Agendamento</button></div></main></div>`);
		bind_props($$props, {
			titulo,
			nome,
			matricula,
			cargo,
			onSair,
			onNovoAgendamento,
			agendamentos,
			carregando,
			erro
		});
	});
}
//#endregion
//#region src/routes/main/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let titulo = "Portal de Agendamento";
		let nome = "";
		let matricula = "";
		let cargo = "";
		let agendamentos = [];
		let carregando = false;
		let erro = "";
		function irParaNovoAgendamento() {
			goto("/agendamento");
		}
		function sair() {
			localStorage.clear();
			goto("/login");
		}
		MainCard($$renderer, {
			titulo,
			nome,
			matricula,
			cargo,
			agendamentos,
			carregando,
			erro,
			onSair: sair,
			onNovoAgendamento: irParaNovoAgendamento
		});
	});
}
//#endregion
export { _page as default };
