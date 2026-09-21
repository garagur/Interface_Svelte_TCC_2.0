import "../../../../chunks/internal.js";
import { S as escape_html, i as ensure_array_like, t as attr_class, x as attr } from "../../../../chunks/server.js";
import { t as goto } from "../../../../chunks/client.js";
import "../../../../chunks/navigation.js";
import { t as CadastroCard } from "../../../../chunks/CadastroCard.js";
import { t as apiFetch } from "../../../../chunks/api.js";
import { n as TURMA_ROUTES, t as carregarTurmas } from "../../../../chunks/List_Turma_Service.js";
//#region src/lib/services/TurmaServices/Create_Turma_Service.js
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
* @param {{ serie: number, turma: string, turno: string, grau: string, ano_letivo: number}} novaTurma
* @param {string} token
* @returns {Promise<any>}
*/
async function cadastrarTurma(novaTurma, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!novaTurma?.serie || !novaTurma?.turma || !novaTurma?.turno || !novaTurma?.grau || !novaTurma?.ano_letivo) throw new Error("Dados da turma incompletos.");
	const resp = await apiFetch(TURMA_ROUTES.cadastrar, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			serie: novaTurma.serie,
			turma: novaTurma.turma,
			turno: novaTurma.turno,
			grau: novaTurma.grau,
			ano_letivo: novaTurma.ano_letivo
		})
	});
	if (!resp) return;
	const dados = await parseJson$1(resp);
	if (!resp.ok) {
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao cadastrar turma.");
	}
	return dados?.data || dados || {};
}
//#endregion
//#region src/lib/services/TurmaServices/Update_Turma_Service.js
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
* @param {number} id
* @param {{ serie: number, turma: string, turno: string, grau: string, ano_letivo: number }} dadosTurma
* @param {string} token
* @returns {Promise<any>}
*/
async function atualizarTurma(id, dadosTurma, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!dadosTurma?.serie || !dadosTurma?.turma || !dadosTurma?.turno || !dadosTurma?.grau || !dadosTurma?.ano_letivo) throw new Error("Dados da turma incompletos.");
	const resp = await apiFetch(TURMA_ROUTES.atualizar(id), {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			serie: dadosTurma.serie,
			turma: dadosTurma.turma,
			turno: dadosTurma.turno,
			grau: dadosTurma.grau,
			ano_letivo: dadosTurma.ano_letivo
		})
	});
	if (!resp) return;
	const dados = await parseJson(resp);
	if (!resp.ok) {
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao atualizar turma.");
	}
	return dados?.data || dados || {};
}
//#endregion
//#region src/routes/admin/cadastro-turma/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let anosDisponiveis, seriesDisponiveis, turmasFiltradas;
		let token = "";
		let novaSerie = null;
		let novaLetra = "";
		let novoTurno = "";
		let novoGrau = "";
		let novoAnoLetivo = null;
		const TURNOS = [
			"matutino",
			"vespertino",
			"noturno",
			"integral"
		];
		const GRAUS = [
			"fundamental",
			"medio",
			"superior"
		];
		let turmas = [];
		let carregando = false;
		let carregandoLista = false;
		let erro = "";
		let sucesso = "";
		let editando = false;
		let turmaEditandoId = null;
		let pesquisa = "";
		let ordenacao = "asc";
		let filtroAno = "todos";
		let filtroSerie = "todos";
		async function carregarLista() {
			carregandoLista = true;
			erro = "";
			try {
				turmas = await carregarTurmas(token);
			} catch (e) {
				erro = e?.message || "Não foi possível carregar as turmas.";
			} finally {
				carregandoLista = false;
			}
		}
		async function salvarTurma() {
			erro = "";
			sucesso = "";
			if (!novaSerie || !novaLetra || !novoTurno || !novoGrau || !novoAnoLetivo) {
				erro = "Preencha todos os campos do formulário.";
				return;
			}
			const serieNum = Number(novaSerie);
			if (!Number.isInteger(serieNum) || serieNum < 1 || serieNum > 10) {
				erro = "A série deve ser um número entre 1 e 10.";
				return;
			}
			if (!/^[A-Za-z]$/.test(novaLetra)) {
				erro = "A turma deve ser uma única letra de A a Z.";
				return;
			}
			const payload = {
				serie: serieNum,
				turma: novaLetra.toUpperCase(),
				turno: novoTurno,
				grau: novoGrau,
				ano_letivo: novoAnoLetivo
			};
			carregando = true;
			try {
				if (editando && turmaEditandoId) {
					await atualizarTurma(turmaEditandoId, payload, token);
					sucesso = "Turma atualizada com sucesso.";
				} else {
					await cadastrarTurma(payload, token);
					sucesso = "Turma cadastrada com sucesso.";
				}
				resetForm();
				await carregarLista();
			} catch (e) {
				erro = e?.message || "Erro ao salvar turma.";
			} finally {
				carregando = false;
			}
		}
		function resetForm() {
			novaSerie = null;
			novaLetra = "";
			novoTurno = "";
			novoGrau = "";
			novoAnoLetivo = null;
			editando = false;
			turmaEditandoId = null;
		}
		function mudarOrdenacao(novoValor) {
			ordenacao = novoValor;
		}
		$: anosDisponiveis = [...new Set(turmas.map((t) => t.ano_letivo).filter(Boolean))].sort((a, b) => b - a);
		$: seriesDisponiveis = [...new Set(turmas.map((t) => t.serie).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
		$: turmasFiltradas = turmas.filter((t) => {
			if (!pesquisa.trim()) return true;
			const termo = pesquisa.toLowerCase();
			return t.nome?.toLowerCase().includes(termo) || t.turno?.toLowerCase().includes(termo) || t.grau?.toLowerCase().includes(termo) || String(t.ano_letivo ?? "").includes(termo);
		}).filter((t) => {
			return true;
		}).filter((t) => {
			return true;
		}).sort((a, b) => {
			const nomeA = (a.nome || "").toLowerCase();
			const nomeB = (b.nome || "").toLowerCase();
			return ordenacao === "asc" ? nomeA.localeCompare(nomeB) : nomeB.localeCompare(nomeA);
		});
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			CadastroCard($$renderer, {
				titulo: "Portal de Agendamento",
				subtitulo: "Cadastro de Turmas",
				onSair: () => goto("/main"),
				onSubmit: salvarTurma,
				onCancelar: resetForm,
				editando,
				carregando,
				erro,
				sucesso,
				iconeForm: editando ? "edit" : "add_circle",
				tituloTabela: "Turmas Cadastradas",
				iconeTabela: "groups",
				totalRegistros: turmasFiltradas.length,
				carregandoLista,
				estadoVazioTexto: "Nenhuma turma encontrada.",
				carregandoTexto: "Carregando turmas...",
				mostrarPesquisa: true,
				placeholderPesquisa: "Pesquisar por nome, turno, grau ou ano...",
				ordenacao,
				onOrdenarChange: mudarOrdenacao,
				get pesquisa() {
					return pesquisa;
				},
				set pesquisa($$value) {
					pesquisa = $$value;
					$$settled = false;
				},
				$$slots: {
					campos: ($$renderer) => {
						$$renderer.push(`<div class="field"><label for="serie-turma">Série</label> <input id="serie-turma" type="number" min="1" max="10"${attr("value", novaSerie)} placeholder="Ex: 9" required=""/> <small class="dica-campo">Número de 1 a 10.</small></div> <div class="field"><label for="letra-turma">Turma</label> <input id="letra-turma" type="text" maxlength="1" style="text-transform: uppercase;"${attr("value", novaLetra)} placeholder="Ex: A" required=""/> <small class="dica-campo">Letra de A a Z.</small></div> <div class="field"><label for="turno-turma">Turno</label> `);
						$$renderer.select({
							id: "turno-turma",
							value: novoTurno,
							required: true
						}, ($$renderer) => {
							$$renderer.option({
								value: "",
								disabled: true,
								selected: true
							}, ($$renderer) => {
								$$renderer.push(`Selecione o turno`);
							});
							$$renderer.push(`<!--[-->`);
							const each_array = ensure_array_like(TURNOS);
							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let t = each_array[$$index];
								$$renderer.option({ value: t }, ($$renderer) => {
									$$renderer.push(`${escape_html(t.charAt(0).toUpperCase() + t.slice(1))}`);
								});
							}
							$$renderer.push(`<!--]-->`);
						});
						$$renderer.push(`</div> <div class="field"><label for="grau-turma">Grau</label> `);
						$$renderer.select({
							id: "grau-turma",
							value: novoGrau,
							required: true
						}, ($$renderer) => {
							$$renderer.option({
								value: "",
								disabled: true,
								selected: true
							}, ($$renderer) => {
								$$renderer.push(`Selecione o grau`);
							});
							$$renderer.push(`<!--[-->`);
							const each_array_1 = ensure_array_like(GRAUS);
							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let g = each_array_1[$$index_1];
								$$renderer.option({ value: g }, ($$renderer) => {
									$$renderer.push(`${escape_html(g.charAt(0).toUpperCase() + g.slice(1))}`);
								});
							}
							$$renderer.push(`<!--]-->`);
						});
						$$renderer.push(`</div> <div class="field"><label for="ano-letivo">Ano Letivo</label> <input id="ano-letivo" type="number"${attr("value", novoAnoLetivo)} placeholder="Ex: 2026" required=""/></div>`);
					},
					"filtros-extra": ($$renderer) => {
						$$renderer.select({
							class: "select-ordenacao",
							value: filtroAno
						}, ($$renderer) => {
							$$renderer.option({ value: "todos" }, ($$renderer) => {
								$$renderer.push(`Todos os anos`);
							});
							$$renderer.push(`<!--[-->`);
							const each_array_2 = ensure_array_like(anosDisponiveis);
							for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
								let ano = each_array_2[$$index_2];
								$$renderer.option({ value: String(ano) }, ($$renderer) => {
									$$renderer.push(`${escape_html(ano)}`);
								});
							}
							$$renderer.push(`<!--]-->`);
						});
						$$renderer.push(` `);
						$$renderer.select({
							class: "select-ordenacao",
							value: filtroSerie
						}, ($$renderer) => {
							$$renderer.option({ value: "todos" }, ($$renderer) => {
								$$renderer.push(`Todas as séries`);
							});
							$$renderer.push(`<!--[-->`);
							const each_array_3 = ensure_array_like(seriesDisponiveis);
							for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
								let serie = each_array_3[$$index_3];
								$$renderer.option({ value: String(serie) }, ($$renderer) => {
									$$renderer.push(`${escape_html(serie)}º`);
								});
							}
							$$renderer.push(`<!--]-->`);
						});
					},
					"tabela-header": ($$renderer) => {
						$$renderer.push(`<div class="table-header"><div class="th flex-2"><span class="material-symbols-outlined" style="font-size:16px; margin-right:4px; vertical-align:middle">groups</span> Nome</div> <div class="th flex-1">Turno</div> <div class="th flex-1">Grau</div> <div class="th flex-1">Ano Letivo</div> <div class="th flex-1">Ações</div></div>`);
					},
					"tabela-body": ($$renderer) => {
						{
							$$renderer.push(`<!--[-->`);
							const each_array_4 = ensure_array_like(turmasFiltradas);
							for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
								let t = each_array_4[index];
								$$renderer.push(`<div${attr_class(`table-row ${index % 2 === 0 ? "even" : "odd"}`)}><div class="td flex-2"><span class="text-truncate">${escape_html(t.nome)}</span></div> <div class="td flex-1"><span class="text-truncate">${escape_html(t.turno)}</span></div> <div class="td flex-1"><span class="text-truncate">${escape_html(t.grau)}</span></div> <div class="td flex-1"><span class="badge-numero">${escape_html(t.ano_letivo)}</span></div> <div class="td flex-1 action-cell"><button class="btn-action edit" title="Editar"><span class="material-symbols-outlined">edit</span></button></div></div>`);
							}
							$$renderer.push(`<!--]-->`);
						}
					}
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
