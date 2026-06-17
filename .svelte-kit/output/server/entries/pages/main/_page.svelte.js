import "../../../chunks/environment.js";
import { B as escape_html, Y as fallback, a as ensure_array_like, l as stringify, n as attr_class, r as bind_props } from "../../../chunks/dev.js";
import { t as goto } from "../../../chunks/client.js";
import "../../../chunks/navigation.js";
import { t as API_URL } from "../../../chunks/constants.js";
import { t as AUTH_ROUTES } from "../../../chunks/User_Endpoints.js";
import "../../../chunks/List_Agendamento_Sala_Service.js";
//#region src/lib/components/main/MainCard.svelte
function MainCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let agendamentosPorData, dias, semanas, totalRegistros;
		let titulo = fallback($$props["titulo"], "");
		let matricula = fallback($$props["matricula"], "");
		let cargo = fallback($$props["cargo"], "");
		let onSair = fallback($$props["onSair"], () => {});
		let onNovoAgendamento = fallback($$props["onNovoAgendamento"], () => {});
		let agendamentos = fallback($$props["agendamentos"], () => [], true);
		let carregando = fallback($$props["carregando"], false);
		let erro = fallback($$props["erro"], "");
		const DIAS_SEMANA = [
			"Dom",
			"Seg",
			"Ter",
			"Qua",
			"Qui",
			"Sex",
			"Sáb"
		];
		function inicioDaGrade() {
			const hoje = /* @__PURE__ */ new Date();
			const diaSemana = hoje.getDay();
			const domingo = new Date(hoje);
			domingo.setDate(hoje.getDate() - diaSemana);
			domingo.setHours(0, 0, 0, 0);
			return domingo;
		}
		function gerarDias() {
			const inicio = inicioDaGrade();
			return Array.from({ length: 60 }, (_, i) => {
				const d = new Date(inicio);
				d.setDate(inicio.getDate() + i);
				return d;
			});
		}
		function extrairData(datetime) {
			if (!datetime) return "";
			return datetime.slice(0, 10);
		}
		function extrairHora(datetime) {
			if (!datetime) return "";
			return datetime.slice(11, 16);
		}
		function formatarChave(date) {
			return date.toISOString().slice(0, 10);
		}
		function hoje() {
			return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		}
		$: agendamentosPorData = agendamentos.reduce((acc, ag) => {
			const chave = extrairData(ag.data_hora_inicio);
			if (!acc[chave]) acc[chave] = [];
			acc[chave].push(ag);
			return acc;
		}, {});
		$: dias = gerarDias();
		$: semanas = dias.reduce((acc, dia, i) => {
			const semana = Math.floor(i / 7);
			if (!acc[semana]) acc[semana] = [];
			acc[semana].push(dia);
			return acc;
		}, []);
		$: totalRegistros = agendamentos.length;
		$$renderer.push(`<div class="scaffold"><header class="app-bar"><div class="title-section"><h1>${escape_html(titulo)}</h1> <span>Matrícula: ${escape_html(matricula)}</span></div> <nav class="nav-menu"><button class="menu-card"><span class="material-symbols-outlined">calendar_today</span> <span>Meus<br/>Agendamentos</span></button> `);
		if (cargo === "admin") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button class="menu-card"><span class="material-symbols-outlined">meeting_room</span> <span>Gerenciar<br/>Salas</span></button> <button class="menu-card"><span class="material-symbols-outlined">groups</span> <span>Gerenciar<br/>Turmas</span></button> <button class="menu-card"><span class="material-symbols-outlined">calendar_month</span> <span>Gerenciar<br/>Horários</span></button> <button class="menu-card"><span class="material-symbols-outlined">playlist_add</span> <span>Gerenciar<br/>Equipamentos</span></button> <button class="menu-card"><span class="material-symbols-outlined">person_add</span> <span>Gerenciar<br/>Usuários</span></button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></nav> <div class="actions-section"><button class="btn-icon" title="Sair"><span class="material-symbols-outlined">logout</span></button></div></header> <main class="body-content"><div class="grade-header-title"><div class="title-left"><span class="material-symbols-outlined text-primary">calendar_month</span> <h2>Agendamentos — próximos 60 dias</h2></div> <div class="badge">${escape_html(totalRegistros)} registros</div></div> `);
		if (carregando) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="estado-vazio">Carregando...</div>`);
		} else if (erro) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="estado-vazio">${escape_html(erro)}</div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="grade-wrapper"><div class="grade-cabecalho"><!--[-->`);
			const each_array = ensure_array_like(DIAS_SEMANA);
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
					const chave = formatarChave(dia);
					const isHoje = chave === hoje();
					const ags = agendamentosPorData[chave] || [];
					$$renderer.push(`<div${attr_class(`dia-celula ${stringify(isHoje ? "dia-hoje" : "")}`)}><span${attr_class(`dia-numero ${stringify(isHoje ? "numero-hoje" : "")}`)}>${escape_html(dia.getDate())}</span> <!--[-->`);
					const each_array_3 = ensure_array_like(ags);
					for (let $$index_1 = 0, $$length = each_array_3.length; $$index_1 < $$length; $$index_1++) {
						let ag = each_array_3[$$index_1];
						$$renderer.push(`<div${attr_class(`ag-bloco ${stringify(ag.tipo)}`)}><span class="ag-hora">${escape_html(extrairHora(ag.data_hora_inicio))} - ${escape_html(extrairHora(ag.data_hora_fim))}</span> <span class="ag-tipo-label">${escape_html(ag.tipo === "sala" ? "Sala" : "Equipamento")}</span> <button class="btn-info-ag" title="Ver detalhes"><span class="material-symbols-outlined">info</span></button></div>`);
					}
					$$renderer.push(`<!--]--></div>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]--> <div class="bottom-action"><button class="btn-primary btn-novo-agendamento"><span class="material-symbols-outlined">add_circle</span> Novo Agendamento</button></div></main></div>`);
		bind_props($$props, {
			titulo,
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
//#region src/lib/services/UserServices/Logout_User_Service.js
/**
* @param {string} token
* @returns {Promise<void>}
*/
async function logoutUser(token) {
	if (!token) return;
	try {
		await fetch(AUTH_ROUTES.logout, {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Authorization": `Bearer ${token}`
			}
		});
	} catch (e) {
		console.error("Erro ao deslogar:", e);
	}
}
`${API_URL}`, `${API_URL}`;
//#endregion
//#region src/routes/main/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let token = "";
		let matricula = "";
		let cargo = "";
		let agendamentos = [];
		let carregando = false;
		let erro = "";
		async function handleSair() {
			await logoutUser(token);
			localStorage.removeItem("token");
			localStorage.removeItem("matricula");
			localStorage.removeItem("cargo");
			goto("/login");
		}
		MainCard($$renderer, {
			titulo: "Portal de Agendamento",
			matricula,
			cargo,
			onSair: handleSair,
			onNovoAgendamento: () => goto("/agendamento"),
			agendamentos,
			carregando,
			erro
		});
	});
}
//#endregion
export { _page as default };
