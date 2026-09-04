import "../../../../chunks/internal.js";
import { S as escape_html, i as ensure_array_like, t as attr_class, x as attr } from "../../../../chunks/server.js";
import { t as goto } from "../../../../chunks/client.js";
import "../../../../chunks/navigation.js";
import { t as CadastroCard } from "../../../../chunks/CadastroCard.js";
import { t as apiFetch } from "../../../../chunks/api.js";
import { n as EQUIPAMENTO_ROUTES, t as carregarEquipamentos } from "../../../../chunks/List_Equipamento_Service.js";
import "../../../../chunks/List_User_Service.js";
//#region src/lib/services/EquipamentoServices/Create_Equipamento_Service.js
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
* @param {{ nome: string, N_patrimonio: string, obs: string, status: boolean, responsavel_id?: number | null }} novoEquipamento
* @param {string} token
* @returns {Promise<any>}
*/
async function cadastrarEquipamento(novoEquipamento, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!novoEquipamento?.nome || !novoEquipamento?.N_patrimonio || novoEquipamento?.obs === "") throw new Error("Dados do equipamento incompletos.");
	const resp = await apiFetch(EQUIPAMENTO_ROUTES.cadastrar, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			nome: novoEquipamento.nome,
			N_patrimonio: novoEquipamento.N_patrimonio,
			obs: novoEquipamento.obs,
			status: novoEquipamento.status,
			responsavel_id: novoEquipamento.responsavel_id || null
		})
	});
	if (!resp) return;
	const dados = await parseJson$1(resp);
	if (!resp.ok) {
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao cadastrar equipamento.");
	}
	return dados?.data || dados || {};
}
//#endregion
//#region src/lib/services/EquipamentoServices/Update_Equipamento_Service.js
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
* @param {{ nome: string, N_patrimonio: string, obs: string, status: boolean, responsavel_id?: number | null }} dadosEquipamento
* @param {string} token
* @returns {Promise<any>}
*/
async function atualizarEquipamentos(id, dadosEquipamento, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!dadosEquipamento?.nome || !dadosEquipamento?.N_patrimonio) throw new Error("Dados do equipamento incompletos.");
	const resp = await apiFetch(EQUIPAMENTO_ROUTES.atualizar(id), {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			nome: dadosEquipamento.nome,
			N_patrimonio: dadosEquipamento.N_patrimonio,
			obs: dadosEquipamento.obs,
			status: dadosEquipamento.status,
			responsavel_id: dadosEquipamento.responsavel_id || null
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
//#region src/routes/admin/cadastro-equipamento/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let equipamentosFiltrados;
		let token = "";
		let novoEquipamento = {
			nome: "",
			N_patrimonio: "",
			obs: "",
			status: true,
			responsavel_id: null
		};
		let equipamentos = [];
		let usuarios = [];
		let carregando = false;
		let carregandoLista = false;
		let erro = "";
		let sucesso = "";
		let editando = false;
		let equipamentoEditandoId = null;
		let pesquisa = "";
		let ordenacao = "asc";
		async function carregarLista() {
			carregandoLista = true;
			erro = "";
			try {
				equipamentos = await carregarEquipamentos(token);
			} catch (e) {
				erro = e?.message || "Não foi possível carregar os equipamentos.";
			} finally {
				carregandoLista = false;
			}
		}
		async function salvarEquipamento() {
			erro = "";
			sucesso = "";
			if (!novoEquipamento.nome.trim() || !novoEquipamento.N_patrimonio || !novoEquipamento.obs.trim()) {
				erro = "Preencha todos os campos do formulário.";
				return;
			}
			carregando = true;
			try {
				if (editando && equipamentoEditandoId) {
					await atualizarEquipamentos(equipamentoEditandoId, novoEquipamento, token);
					sucesso = "Equipamento atualizado com sucesso.";
				} else {
					await cadastrarEquipamento(novoEquipamento, token);
					sucesso = "Equipamento cadastrado com sucesso.";
				}
				resetForm();
				await carregarLista();
			} catch (e) {
				erro = e?.message || "Erro ao salvar equipamento.";
			} finally {
				carregando = false;
			}
		}
		function resetForm() {
			novoEquipamento = {
				nome: "",
				N_patrimonio: "",
				obs: "",
				status: true,
				responsavel_id: null
			};
			editando = false;
			equipamentoEditandoId = null;
		}
		function mudarOrdenacao(novoValor) {
			ordenacao = novoValor;
		}
		$: equipamentosFiltrados = equipamentos.filter((eq) => {
			if (!pesquisa.trim()) return true;
			const termo = pesquisa.toLowerCase();
			const nomeResp = eq.responsavel?.nome || eq.responsavel?.name || "";
			return eq.nome?.toLowerCase().includes(termo) || eq.N_patrimonio?.toLowerCase().includes(termo) || eq.obs?.toLowerCase().includes(termo) || nomeResp.toLowerCase().includes(termo);
		}).filter((eq) => {
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
				subtitulo: "Cadastro de Equipamentos",
				onSair: () => goto("/main"),
				onSubmit: salvarEquipamento,
				onCancelar: resetForm,
				editando,
				carregando,
				erro,
				sucesso,
				iconeForm: editando ? "edit" : "add_circle",
				tituloTabela: "Equipamentos Cadastrados",
				iconeTabela: "computer",
				totalRegistros: equipamentosFiltrados.length,
				carregandoLista,
				estadoVazioTexto: "Nenhum equipamento encontrado.",
				carregandoTexto: "Carregando equipamentos...",
				temToggle: true,
				mostrarPesquisa: true,
				placeholderPesquisa: "Pesquisar por nome, patrimônio ou responsável...",
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
						$$renderer.push(`<div class="field"><label for="nome-equipamento">Nome do Equipamento</label> <input id="nome-equipamento" type="text"${attr("value", novoEquipamento.nome)} placeholder="Ex: Notebook Dell" required=""/></div> <div class="field"><label for="numero-equipamento">Número</label> <input id="numero-equipamento" type="text"${attr("value", novoEquipamento.N_patrimonio)} placeholder="Ex: PAT-101" required=""/></div> <div class="field"><label for="obs-equipamento">Observação</label> <input id="obs-equipamento" type="text"${attr("value", novoEquipamento.obs)} placeholder="Ex: funciona apenas em 220V" required=""/></div> <div class="field"><label for="responsavel-equipamento">Responsável</label> `);
						$$renderer.select({
							id: "responsavel-equipamento",
							value: novoEquipamento.responsavel_id
						}, ($$renderer) => {
							$$renderer.option({ value: null }, ($$renderer) => {
								$$renderer.push(`Nenhum responsável`);
							});
							$$renderer.push(`<!--[-->`);
							const each_array = ensure_array_like(usuarios);
							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let u = each_array[$$index];
								$$renderer.option({ value: u.id }, ($$renderer) => {
									$$renderer.push(`${escape_html(u.nome)}`);
								});
							}
							$$renderer.push(`<!--]-->`);
						});
						$$renderer.push(`</div>`);
					},
					toggle: ($$renderer) => {
						$$renderer.push(`<label for="status-equipamento">Status</label> <div class="toggle-wrapper"><label class="toggle-switch"><input id="status-equipamento" type="checkbox"${attr("checked", novoEquipamento.status, true)}/> <span class="toggle-track"><span class="toggle-thumb"></span></span></label> <span class="toggle-label">${escape_html(novoEquipamento.status ? "Ativo" : "Inativo")}</span></div>`);
					},
					"filtros-extra": ($$renderer) => {
						$$renderer.push(`<div class="filtro-status"><button type="button"${attr_class(`chip ativo`)}>Todos</button> <button type="button"${attr_class(`chip `)}>Ativos</button> <button type="button"${attr_class(`chip `)}>Inativos</button></div>`);
					},
					"tabela-header": ($$renderer) => {
						$$renderer.push(`<div class="table-header"><div class="th flex-2"><span class="material-symbols-outlined" style="font-size:16px; margin-right:4px; vertical-align:middle">computer</span> Nome</div> <div class="th flex-1">Número</div> <div class="th flex-2">Observação</div> <div class="th flex-2">Responsável</div> <div class="th flex-1">Status</div> <div class="th flex-1">Ações</div></div>`);
					},
					"tabela-body": ($$renderer) => {
						{
							$$renderer.push(`<!--[-->`);
							const each_array_1 = ensure_array_like(equipamentosFiltrados);
							for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
								let s = each_array_1[index];
								$$renderer.push(`<div${attr_class(`table-row ${index % 2 === 0 ? "even" : "odd"}`)}><div class="td flex-2"><span class="text-truncate">${escape_html(s.nome)}</span></div> <div class="td flex-1"><span class="badge-numero">${escape_html(s.N_patrimonio)}</span></div> <div class="td flex-2"><span class="text-truncate">${escape_html(s.obs)}</span></div> <div class="td flex-2"><span class="text-truncate">${escape_html(s.responsavel?.nome || s.responsavel?.name || "—")}</span></div> <div class="td flex-1"><span${attr_class(`badge-status ${s.status ? "ativo" : "inativo"}`)}>${escape_html(s.status ? "Ativo" : "Inativo")}</span></div> <div class="td flex-1 action-cell"><button class="btn-action edit" title="Editar"><span class="material-symbols-outlined">edit</span></button></div></div>`);
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
