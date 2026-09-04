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
* @param {{ nome: string, ano_letivo: number}} novaTurma
* @param {string} token
* @returns {Promise<any>}
*/
async function cadastrarTurma(novaTurma, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!novaTurma?.nome || !novaTurma?.ano_letivo) throw new Error("Dados da turma incompletos.");
	const resp = await apiFetch(TURMA_ROUTES.cadastrar, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			nome: novaTurma.nome,
			ano_letivo: novaTurma.ano_letivo
		})
	});
	if (!resp) return;
	const dados = await parseJson$1(resp);
	if (!resp.ok) {
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao cadastrar sala.");
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
* @param {{ nome: string, ano_letivo: number }} dadosTurma
* @param {string} token
* @returns {Promise<any>}
*/
async function atualizarTurma(id, dadosTurma, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!dadosTurma?.nome || !dadosTurma?.ano_letivo) throw new Error("Dados da turma incompletos.");
	const resp = await apiFetch(TURMA_ROUTES.atualizar(id), {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			nome: dadosTurma.nome,
			ano_letivo: dadosTurma.ano_letivo
		})
	});
	if (!resp) return;
	const dados = await parseJson(resp);
	if (!resp.ok) {
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao atualizar.");
	}
	return dados?.data || dados || {};
}
//#endregion
//#region src/routes/admin/cadastro-turma/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let anosDisponiveis, seriesDisponiveis, turmasFiltradas;
		let token = "";
		let novaTurma = {
			nome: "",
			ano_letivo: null
		};
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
			if (!novaTurma.nome || !novaTurma.ano_letivo) {
				erro = "Preencha todos os campos do formulário.";
				return;
			}
			if (!/^\d/.test(novaTurma.nome.trim())) {
				erro = "O nome da turma deve começar com um número (ex: 1A, 9º Ano A).";
				return;
			}
			carregando = true;
			try {
				if (editando && turmaEditandoId) {
					await atualizarTurma(turmaEditandoId, novaTurma, token);
					sucesso = "Turma atualizada com sucesso.";
				} else {
					await cadastrarTurma(novaTurma, token);
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
			novaTurma = {
				nome: "",
				ano_letivo: null
			};
			editando = false;
			turmaEditandoId = null;
		}
		function mudarOrdenacao(novoValor) {
			ordenacao = novoValor;
		}
		function extrairSerie(nome) {
			const match = (nome || "").match(/^\d+/);
			return match ? match[0] : null;
		}
		$: anosDisponiveis = [...new Set(turmas.map((t) => t.ano_letivo).filter(Boolean))].sort((a, b) => b - a);
		$: seriesDisponiveis = [...new Set(turmas.map((t) => extrairSerie(t.nome)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
		$: turmasFiltradas = turmas.filter((t) => {
			if (!pesquisa.trim()) return true;
			const termo = pesquisa.toLowerCase();
			return t.nome?.toLowerCase().includes(termo) || String(t.ano_letivo ?? "").includes(termo);
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
				placeholderPesquisa: "Pesquisar por nome ou ano...",
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
						$$renderer.push(`<div class="field"><label for="nome-turma">Nome da Turma</label> <input id="nome-turma" type="text"${attr("value", novaTurma.nome)} placeholder="Ex: 9º Ano A" required=""/> <small class="dica-campo">Deve começar com um número (ex: 1A, 9º Ano A).</small></div> <div class="field"><label for="ano-letivo">Ano Letivo</label> <input id="ano-letivo" type="number"${attr("value", novaTurma.ano_letivo)} placeholder="Ex: 2026" required=""/></div>`);
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
							const each_array = ensure_array_like(anosDisponiveis);
							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let ano = each_array[$$index];
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
							const each_array_1 = ensure_array_like(seriesDisponiveis);
							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let serie = each_array_1[$$index_1];
								$$renderer.option({ value: serie }, ($$renderer) => {
									$$renderer.push(`${escape_html(serie)}º`);
								});
							}
							$$renderer.push(`<!--]-->`);
						});
					},
					"tabela-header": ($$renderer) => {
						$$renderer.push(`<div class="table-header"><div class="th flex-2"><span class="material-symbols-outlined" style="font-size:16px; margin-right:4px; vertical-align:middle">groups</span> Nome</div> <div class="th flex-1">Ano Letivo</div> <div class="th flex-1">Ações</div></div>`);
					},
					"tabela-body": ($$renderer) => {
						{
							$$renderer.push(`<!--[-->`);
							const each_array_2 = ensure_array_like(turmasFiltradas);
							for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
								let t = each_array_2[index];
								$$renderer.push(`<div${attr_class(`table-row ${index % 2 === 0 ? "even" : "odd"}`)}><div class="td flex-2"><span class="text-truncate">${escape_html(t.nome)}</span></div> <div class="td flex-1"><span class="badge-numero">${escape_html(t.ano_letivo)}</span></div> <div class="td flex-1 action-cell"><button class="btn-action edit" title="Editar"><span class="material-symbols-outlined">edit</span></button></div></div>`);
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
