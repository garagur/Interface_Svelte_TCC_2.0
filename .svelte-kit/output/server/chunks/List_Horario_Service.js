import { S as escape_html, i as ensure_array_like, n as bind_props, ot as fallback, s as slot, t as attr_class } from "./server.js";
import { t as apiFetch } from "./api.js";
//#region src/lib/components/SemanalGrade/GradeSemanal.svelte
function GradeSemanal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let dias = fallback($$props["dias"], () => [], true);
		let blocos = fallback($$props["blocos"], () => [], true);
		let carregandoLista = fallback($$props["carregandoLista"], false);
		let filtrarPor = fallback($$props["filtrarPor"], null);
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
		function blocosOrdenados(dia) {
			return blocos.filter((b) => {
				if (b.dia_semana !== dia) return false;
				if (filtrarPor && filtrarPor.valor != null) return b[filtrarPor.campo] == filtrarPor.valor;
				return true;
			}).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
		}
		if (carregandoLista) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="estado-vazio svelte-n39eg1">Carregando horários...</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="grade-wrapper svelte-n39eg1"><!--[-->`);
			const each_array = ensure_array_like(dias);
			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let dia = each_array[$$index_1];
				$$renderer.push(`<div${attr_class(`dia-coluna ${diasFimDeSemana.includes(dia) ? "fds" : ""}`, "svelte-n39eg1")}><div class="dia-header svelte-n39eg1">${escape_html(diasLabels[dia])}</div> <div class="dia-blocos svelte-n39eg1">`);
				const each_array_1 = ensure_array_like(blocosOrdenados(dia));
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
					$$renderer.push(`<div class="bloco-vazio svelte-n39eg1">—</div>`);
				}
				$$renderer.push(`<!--]--></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, {
			dias,
			blocos,
			carregandoLista,
			filtrarPor
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
		$$renderer.push(`<div class="bloco-card svelte-3lov78"><div class="bloco-horario svelte-3lov78">${escape_html(bloco.hora_inicio)} - ${escape_html(bloco.hora_fim)}</div> <div class="bloco-disciplina svelte-3lov78">${escape_html(bloco.disciplina)}</div> <div class="bloco-professor svelte-3lov78"><span class="material-symbols-outlined icon-tiny svelte-3lov78">person</span> ${escape_html(bloco.professor?.name ?? bloco.professor_id)}</div> `);
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
async function buscarBlocos(token, params = {}) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	const query = new URLSearchParams(params).toString();
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
* @returns {Promise<any[]>}
*/
async function carregarHorarios(token, turma_id = null) {
	return buscarBlocos(token, turma_id ? { turma_id } : {});
}
/**
* @param {string} token
* @param {number|string} professor_id
* @returns {Promise<any[]>}
*/
async function carregarHorariosProfessor(token, professor_id) {
	return buscarBlocos(token, { professor_id });
}
/**
* @param {string} token
* @param {number|string} sala_id
* @returns {Promise<any[]>}
*/
async function carregarHorariosSala(token, sala_id) {
	return buscarBlocos(token, { sala_id });
}
//#endregion
export { BlocoHorarioCard as a, HORARIO_ROUTES as i, carregarHorariosProfessor as n, GradeSemanal as o, carregarHorariosSala as r, carregarHorarios as t };
