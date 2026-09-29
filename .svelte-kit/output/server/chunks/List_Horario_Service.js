import { r as createEventDispatcher } from "./internal.js";
import { T as escape_html, c as slot, i as ensure_array_like, lt as fallback, n as bind_props, t as attr_class } from "./server.js";
import { t as apiFetch } from "./api.js";
//#region src/lib/components/Grades/GradeSemanal.svelte
function GradeSemanal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let blocosPorDia;
		let dias = fallback($$props["dias"], () => [], true);
		let blocos = fallback($$props["blocos"], () => [], true);
		let carregandoLista = fallback($$props["carregandoLista"], false);
		let filtrarPor = fallback($$props["filtrarPor"], null);
		let anoInicial = fallback($$props["anoInicial"], () => (/* @__PURE__ */ new Date()).getFullYear(), true);
		let filtrarPorAno = fallback($$props["filtrarPorAno"], true);
		createEventDispatcher();
		let anoSelecionado = anoInicial;
		const diasLabels = {
			domingo: "Domingo",
			segunda: "Segunda",
			terca: "Terça",
			quarta: "Quarta",
			quinta: "Quinta",
			sexta: "Sexta",
			sabado: "Sábado"
		};
		const diasFimDeSemana = ["sabado", "domingo"];
		function agruparPorDia(blocos, ano, filtrarPor, filtrarPorAno) {
			const grupos = {};
			for (const b of blocos) {
				const anoTurma = b.turma_ano_letivo ?? b.turma_ano ?? b.ano_letivo ?? b.turma?.ano_letivo ?? b.turma?.ano;
				if (filtrarPorAno && anoTurma !== null && anoTurma !== void 0 && anoTurma !== "" && Number(anoTurma) !== Number(ano)) continue;
				if (filtrarPor && filtrarPor.valor != null && b[filtrarPor.campo] != filtrarPor.valor) continue;
				(grupos[b.dia_semana] ??= []).push(b);
			}
			for (const dia in grupos) grupos[dia].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
			return grupos;
		}
		$: blocosPorDia = agruparPorDia(blocos, anoSelecionado, filtrarPor, filtrarPorAno);
		if (carregandoLista) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio">Carregando horários...</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="grade-semanal"><div class="grade-header"><h3><span class="material-symbols-outlined">calendar_month</span> Grade
                Semanal</h3> `);
			if (filtrarPorAno) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="seletor-ano"><button type="button" aria-label="Ano anterior"><span class="material-symbols-outlined">chevron_left</span></button> <span class="ano-valor">${escape_html(anoSelecionado)}</span> <button type="button" aria-label="Próximo ano"><span class="material-symbols-outlined">chevron_right</span></button></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="grade-wrapper"><!--[-->`);
			const each_array = ensure_array_like(dias);
			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let dia = each_array[$$index_1];
				$$renderer.push(`<div${attr_class(`dia-coluna ${diasFimDeSemana.includes(dia) ? "fds" : ""}`)}><div class="dia-header">${escape_html(diasLabels[dia])}</div> <div class="dia-blocos">`);
				const each_array_1 = ensure_array_like(blocosPorDia[dia] ?? []);
				if (each_array_1.length !== 0) {
					$$renderer.push("<!--[-->");
					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
						let bloco = each_array_1[$$index];
						$$renderer.push(`<!--[-->`);
						slot($$renderer, $$props, "default", { bloco }, null);
						$$renderer.push(`<!--]-->`);
					}
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push(`<div class="bloco-vazio">—</div>`);
				}
				$$renderer.push(`<!--]--></div></div>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, {
			dias,
			blocos,
			carregandoLista,
			filtrarPor,
			anoInicial,
			filtrarPorAno
		});
	});
}
//#endregion
//#region src/lib/components/Card/BlocoHorarioCard.svelte
function BlocoHorarioCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let bloco = $$props["bloco"];
		/** @type {((bloco: any) => void) | null} */
		let onRemover = fallback($$props["onRemover"], null);
		let mostrarTurma = fallback($$props["mostrarTurma"], false);
		function formatarHora(hora) {
			return String(hora || "").split(":").slice(0, 2).join(":");
		}
		$$renderer.push(`<div class="bloco-card svelte-3lov78"><div class="bloco-horario svelte-3lov78">${escape_html(formatarHora(bloco.hora_inicio))} - ${escape_html(formatarHora(bloco.hora_fim))}</div> <div class="bloco-disciplina svelte-3lov78">${escape_html(bloco.disciplina)}</div> <div class="bloco-sala svelte-3lov78"><span class="material-symbols-outlined icon-tiny svelte-3lov78">meeting_room</span> ${escape_html(bloco.sala_nome || bloco.sala_id || "Sala não informada")}</div> <div class="bloco-professor svelte-3lov78"><span class="material-symbols-outlined icon-tiny svelte-3lov78">person</span> ${escape_html(bloco.professor?.name ?? bloco.professor_id)}</div> `);
		if (mostrarTurma) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bloco-turma svelte-3lov78"><span class="material-symbols-outlined icon-tiny svelte-3lov78">groups</span> ${escape_html(bloco.turma_nome ?? bloco.turma_id ?? "—")}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (onRemover) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bloco-actions svelte-3lov78"><button class="btn-action delete svelte-3lov78" title="Remover"><span class="material-symbols-outlined svelte-3lov78">delete</span></button></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
		bind_props($$props, {
			bloco,
			onRemover,
			mostrarTurma
		});
	});
}
//#endregion
//#region src/config/routes/Horario_Endpoits.js
var HORARIO_ROUTES = {
	listar: "/blocos-horario",
	buscar: (id) => `/blocos-horario/${id}`,
	cadastrar: "/blocos-horario",
	atualizar: (id) => `/blocos-horario/${id}`,
	deletar: (id) => `/blocos-horario/${id}`
};
//#endregion
//#region src/lib/services/HorarioServices/List_Horario_Service.js
async function parseJson(response) {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
function mapearBloco(s) {
	return {
		id: s.id,
		turma_id: s.turma?.id || s.turma_id || "",
		turma_nome: s.turma?.nome || "",
		turma_ano_letivo: s.turma?.ano_letivo ?? s.turma?.ano ?? s.turma_ano_letivo ?? s.ano_letivo ?? "",
		sala_id: s.sala?.id || s.sala_id || "",
		sala_nome: s.sala?.nome || "",
		professor_id: s.professor?.id || s.professor_id || "",
		dia_semana: s.dia_semana || "",
		disciplina: s.disciplina || "",
		hora_inicio: s.hora_inicio || "",
		hora_fim: s.hora_fim || "",
		professor: s.professor || null
	};
}
function limparParams(params) {
	return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== null && v !== void 0 && v !== ""));
}
async function buscarBlocos(token, params = {}) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	const query = new URLSearchParams(limparParams(params)).toString();
	const resp = await apiFetch(query ? `${HORARIO_ROUTES.listar}?${query}` : HORARIO_ROUTES.listar, {
		method: "GET",
		headers: { "Accept": "application/json" }
	});
	if (!resp) return [];
	const dados = await parseJson(resp);
	if (!resp.ok) throw new Error(dados?.message || dados?.error || "Erro ao carregar horários.");
	return (Array.isArray(dados) ? dados : dados?.blocos || dados?.data || []).map(mapearBloco);
}
/**
* @param {string} token
* @param {number|null} turma_id
* @param {number|null} ano
*/
async function carregarHorarios(token, turma_id = null, ano = null) {
	return buscarBlocos(token, {
		turma_id,
		ano
	});
}
/**
* @param {string} token
* @param {number|string} professor_id
* @param {number|null} ano
*/
async function carregarHorariosProfessor(token, professor_id, ano = null) {
	return buscarBlocos(token, {
		professor_id,
		ano
	});
}
/**
* @param {string} token
* @param {number|string} sala_id
* @param {number|null} ano
*/
async function carregarHorariosSala(token, sala_id, ano = null) {
	return buscarBlocos(token, {
		sala_id,
		ano
	});
}
//#endregion
export { BlocoHorarioCard as a, HORARIO_ROUTES as i, carregarHorariosProfessor as n, GradeSemanal as o, carregarHorariosSala as r, carregarHorarios as t };
