import "../../../chunks/internal.js";
import { S as escape_html, n as bind_props, ot as fallback, t as attr_class, x as attr } from "../../../chunks/server.js";
import { t as goto } from "../../../chunks/client.js";
import "../../../chunks/navigation.js";
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
		let mostrarMenuUsuario = false;
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
		$: totalRegistros = agendamentosVisiveis.length;
		ConfirmarDelecaoModal($$renderer, {
			agendamento: agendamentoParaDeletar,
			onConfirmar: confirmarDeletar,
			onCancelar: fecharModalDeletar,
			processando: !!cancelandoId
		});
		$$renderer.push(`<!----> <div class="scaffold"><header class="app-bar"><div class="title-section"><h1>${escape_html(titulo)}</h1> <span>${escape_html(nome)} | Matrícula: ${escape_html(matricula)}</span></div> <nav class="nav-menu">`);
		if (cargo === "admin") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button type="button" class="menu-card" title="Gerenciar salas" aria-label="Gerenciar salas"><span class="material-symbols-outlined">meeting_room</span> <span>Gerenciar<br/>Salas</span></button> <button type="button" class="menu-card" title="Gerenciar turmas" aria-label="Gerenciar turmas"><span class="material-symbols-outlined">groups</span> <span>Gerenciar<br/>Turmas</span></button> <button type="button" class="menu-card" title="Gerenciar horários" aria-label="Gerenciar horários"><span class="material-symbols-outlined">calendar_month</span> <span>Gerenciar<br/>Horários</span></button> <button type="button" class="menu-card" title="Gerenciar equipamentos" aria-label="Gerenciar equipamentos"><span class="material-symbols-outlined">playlist_add</span> <span>Gerenciar<br/>Equipamentos</span></button> <button type="button" class="menu-card" title="Gerenciar usuários" aria-label="Gerenciar usuários"><span class="material-symbols-outlined">person_add</span> <span>Gerenciar<br/>Usuários</span></button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></nav> <div class="actions-section"><div class="user-menu"><button class="btn-icon" title="Minha conta" aria-haspopup="true"${attr("aria-expanded", mostrarMenuUsuario)}><span class="material-symbols-outlined">account_circle</span></button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div></header> <main class="body-content"><div class="grade-header-title"><div class="title-left"><span class="material-symbols-outlined text-primary">calendar_month</span> <h2>Agendamentos — próximos 60 dias</h2></div> <div class="toggle-visao" role="group" aria-label="Modo de visualização"><button type="button" title="Lista de agendamentos" aria-label="Lista de agendamentos"${attr_class("", void 0, { "ativo": true })}><span class="material-symbols-outlined">view_list</span></button> <button type="button" title="Grade mensal" aria-label="Grade mensal"${attr_class("", void 0, { "ativo": false })}><span class="material-symbols-outlined">calendar_view_month</span></button></div> <div class="badge">${escape_html(totalRegistros)}
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
