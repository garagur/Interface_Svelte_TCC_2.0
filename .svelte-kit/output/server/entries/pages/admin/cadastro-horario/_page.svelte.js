import "../../../../chunks/environment.js";
import { B as escape_html, Y as fallback, a as ensure_array_like, ct as invalid_default_snippet, r as bind_props, z as attr } from "../../../../chunks/dev.js";
import { t as goto } from "../../../../chunks/client.js";
import "../../../../chunks/navigation.js";
import { t as GradeSemanal } from "../../../../chunks/GradeSemanal.js";
import { i as HORARIO_ROUTES, t as carregarHorarios } from "../../../../chunks/List_Horario_Service.js";
import "../../../../chunks/List_Turma_Service.js";
import "../../../../chunks/List_Sala_Service.js";
import "../../../../chunks/List_User_Service.js";
//#region src/lib/components/admin/HorarioCard.svelte
function HorarioCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let turmas = fallback($$props["turmas"], () => [], true);
		let salas = fallback($$props["salas"], () => [], true);
		let professores = fallback($$props["professores"], () => [], true);
		let blocos = fallback($$props["blocos"], () => [], true);
		let turma_id = fallback($$props["turma_id"], null);
		let novoBloco = $$props["novoBloco"];
		let dias = fallback($$props["dias"], () => [], true);
		let carregando = fallback($$props["carregando"], false);
		let carregandoLista = fallback($$props["carregandoLista"], false);
		let erro = fallback($$props["erro"], "");
		let sucesso = fallback($$props["sucesso"], "");
		let onAdicionar = $$props["onAdicionar"];
		let onRemover = $$props["onRemover"];
		let onSair = $$props["onSair"];
		$$renderer.push(`<div class="scaffold"><header class="app-bar"><div class="title-section"><h1>Portal de Agendamento</h1> <span>Grade de Horários</span></div> <button class="btn-icon" title="Voltar"><span class="material-symbols-outlined">arrow_back</span></button></header> <main class="horario-content"><div class="card turma-select-card"><label for="turma">Turma</label> `);
		$$renderer.select({
			id: "turma",
			value: turma_id
		}, ($$renderer) => {
			$$renderer.option({ value: null }, ($$renderer) => {
				$$renderer.push(`Selecione uma turma`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array = ensure_array_like(turmas);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let t = each_array[$$index];
				$$renderer.option({ value: t.id }, ($$renderer) => {
					$$renderer.push(`${escape_html(t.nome)} — ${escape_html(t.ano_letivo)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div> <div class="card form-bloco-card"><h3><span class="material-symbols-outlined">add_circle</span> Novo Bloco</h3> <div class="form-bloco-fields"><div class="field"><label for="dia">Dia da Semana</label> `);
		$$renderer.select({
			id: "dia",
			value: novoBloco.dia_semana
		}, ($$renderer) => {
			$$renderer.push(`<!--[-->`);
			const each_array_1 = ensure_array_like(dias);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let dia = each_array_1[$$index_1];
				$$renderer.option({ value: dia }, ($$renderer) => {
					$$renderer.push(`${escape_html(dia)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div> <div class="field"><label for="sala">Sala</label> `);
		$$renderer.select({
			id: "sala",
			value: novoBloco.sala_id
		}, ($$renderer) => {
			$$renderer.option({ value: null }, ($$renderer) => {
				$$renderer.push(`Selecione uma sala`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_2 = ensure_array_like(salas);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let s = each_array_2[$$index_2];
				$$renderer.option({ value: s.id }, ($$renderer) => {
					$$renderer.push(`${escape_html(s.nome)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div> <div class="field"><label for="inicio">Início</label> <input id="inicio" type="time"${attr("value", novoBloco.hora_inicio)}/></div> <div class="field"><label for="fim">Fim</label> <input id="fim" type="time"${attr("value", novoBloco.hora_fim)}/></div> <div class="field"><label for="disciplina">Disciplina</label> <input id="disciplina" type="text"${attr("value", novoBloco.disciplina)} placeholder="Ex: Matemática"/></div> <div class="field"><label for="professor">Professor</label> `);
		$$renderer.select({
			id: "professor",
			value: novoBloco.professor_id
		}, ($$renderer) => {
			$$renderer.option({ value: null }, ($$renderer) => {
				$$renderer.push(`Selecione um professor`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_3 = ensure_array_like(professores);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let p = each_array_3[$$index_3];
				$$renderer.option({ value: p.id }, ($$renderer) => {
					$$renderer.push(`${escape_html(p.nome)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div></div> `);
		if (erro) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="msg-erro">${escape_html(erro)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (sucesso) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="msg-sucesso">${escape_html(sucesso)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <button class="btn-primary"${attr("disabled", carregando, true)}><span class="material-symbols-outlined">add</span> ${escape_html(carregando ? "Adicionando..." : "Adicionar")}</button></div> `);
		if (turma_id) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card grade-card"><h3><span class="material-symbols-outlined">calendar_month</span> Grade Semanal</h3> `);
			GradeSemanal($$renderer, {
				dias,
				blocos,
				carregandoLista,
				filtrarPor: {
					campo: "turma_id",
					valor: turma_id
				},
				children: invalid_default_snippet,
				$$slots: { default: ($$renderer, { bloco }) => {
					$$renderer.push(`<div class="bloco-card"><div class="bloco-horario">${escape_html(bloco.hora_inicio)} - ${escape_html(bloco.hora_fim)}</div> <div class="bloco-disciplina">${escape_html(bloco.disciplina)}</div> <div class="bloco-professor"><span class="material-symbols-outlined icon-tiny">person</span> ${escape_html(bloco.professor?.name ?? bloco.professor_id)}</div> <div class="bloco-actions"><button class="btn-action delete" title="Remover"><span class="material-symbols-outlined">delete</span></button></div></div>`);
				} }
			});
			$$renderer.push(`<!----></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></main></div>`);
		bind_props($$props, {
			turmas,
			salas,
			professores,
			blocos,
			turma_id,
			novoBloco,
			dias,
			carregando,
			carregandoLista,
			erro,
			sucesso,
			onAdicionar,
			onRemover,
			onSair
		});
	});
}
//#endregion
//#region src/lib/services/HorarioServices/Create_Horario_Service.js
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
* @param {{turma_id: number, sala_id: number, professor_id: string, dia_semana: string, disciplina: string,hora_inicio: string, hora_fim: string}} novoHorario
* @param {string} token
* @returns {Promise<any>}
*/
async function cadastrarHorario(novoHorario, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!novoHorario?.turma_id || !novoHorario?.sala_id || !novoHorario?.professor_id || !novoHorario?.dia_semana || !novoHorario?.disciplina || !novoHorario?.hora_inicio || !novoHorario?.hora_fim) throw new Error("Dados do horário incompletos.");
	const resp = await fetch(HORARIO_ROUTES.cadastrar, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": `Bearer ${token}`
		},
		body: JSON.stringify({
			turma_id: novoHorario.turma_id,
			sala_id: novoHorario.sala_id,
			professor_id: novoHorario.professor_id,
			dia_semana: novoHorario.dia_semana,
			disciplina: novoHorario.disciplina,
			hora_inicio: novoHorario.hora_inicio,
			hora_fim: novoHorario.hora_fim
		})
	});
	const dados = await parseJson(resp);
	if (!resp.ok) {
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao cadastrar horário.");
	}
	return dados?.data || dados || {};
}
//#endregion
//#region src/lib/services/HorarioServices/Deleted_Horario_Service.js
/**
* @param {number} id
* @param {string} token
* @returns {Promise<any>}
*/
async function deletarHorario(id, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	const resp = await fetch(HORARIO_ROUTES.deletar(id), {
		method: "DELETE",
		headers: {
			"Accept": "application/json",
			"Authorization": `Bearer ${token}`
		}
	});
	if (!resp.ok) {
		const text = await resp.text();
		let dados = null;
		try {
			dados = JSON.parse(text);
		} catch {}
		throw new Error(dados?.message || "Erro ao deletar horário.");
	}
}
//#endregion
//#region src/routes/admin/cadastro-horario/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let token = "";
		let turmas = [];
		let salas = [];
		let professores = [];
		let blocos = [];
		let turma_id = null;
		let novoBloco = {
			dia_semana: "segunda",
			hora_inicio: "",
			hora_fim: "",
			disciplina: "",
			professor_id: null,
			sala_id: null
		};
		let carregando = false;
		let carregandoLista = false;
		let erro = "";
		let sucesso = "";
		const dias = [
			"segunda",
			"terca",
			"quarta",
			"quinta",
			"sexta",
			"sabado",
			"domingo"
		];
		async function carregarLista(id = null) {
			carregandoLista = true;
			erro = "";
			try {
				blocos = await carregarHorarios(token, id);
			} catch (e) {
				erro = e?.message || "Erro ao carregar horários.";
			} finally {
				carregandoLista = false;
			}
		}
		async function adicionarBloco() {
			erro = "";
			sucesso = "";
			if (!turma_id) {
				erro = "Selecione uma turma antes de adicionar um horário.";
				return;
			}
			if (!novoBloco.sala_id) {
				erro = "Selecione uma sala.";
				return;
			}
			if (!novoBloco.professor_id) {
				erro = "Selecione um professor.";
				return;
			}
			if (!novoBloco.hora_inicio || !novoBloco.hora_fim || !novoBloco.disciplina) {
				erro = "Preencha todos os campos do bloco.";
				return;
			}
			if (novoBloco.hora_inicio >= novoBloco.hora_fim) {
				erro = "O horário de início deve ser anterior ao horário de fim.";
				return;
			}
			carregando = true;
			try {
				await cadastrarHorario({
					...novoBloco,
					turma_id
				}, token);
				sucesso = "Bloco adicionado com sucesso.";
				novoBloco = {
					dia_semana: novoBloco.dia_semana,
					hora_inicio: "",
					hora_fim: "",
					disciplina: "",
					professor_id: null,
					sala_id: null
				};
				await carregarLista(turma_id);
			} catch (e) {
				erro = e?.message || "Erro ao adicionar bloco.";
			} finally {
				carregando = false;
			}
		}
		async function removerBloco(id) {
			erro = "";
			try {
				await deletarHorario(id, token);
				await carregarLista(turma_id);
			} catch (e) {
				erro = e?.message || "Erro ao remover bloco.";
			}
		}
		$: if (turma_id) carregarLista(turma_id);
		else blocos = [];
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			HorarioCard($$renderer, {
				turmas,
				salas,
				professores,
				blocos,
				dias,
				carregando,
				carregandoLista,
				erro,
				sucesso,
				onAdicionar: adicionarBloco,
				onRemover: removerBloco,
				onSair: () => goto("/main"),
				get turma_id() {
					return turma_id;
				},
				set turma_id($$value) {
					turma_id = $$value;
					$$settled = false;
				},
				get novoBloco() {
					return novoBloco;
				},
				set novoBloco($$value) {
					novoBloco = $$value;
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
