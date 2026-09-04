import "../../../../chunks/internal.js";
import { S as escape_html, i as ensure_array_like, t as attr_class, x as attr } from "../../../../chunks/server.js";
import { t as goto } from "../../../../chunks/client.js";
import "../../../../chunks/navigation.js";
import { t as CadastroCard } from "../../../../chunks/CadastroCard.js";
import { t as apiFetch } from "../../../../chunks/api.js";
import "../../../../chunks/List_User_Service.js";
import { n as SALA_ROUTES, t as carregarSalas } from "../../../../chunks/List_Sala_Service.js";
//#region src/lib/services/SalaServices/Create_Sala_Service.js
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
* @param {{ nome: string, obs: string, status: boolean, responsavel_id?: number | null }} novaSala
* @param {string} token
* @returns {Promise<any>}
*/
async function cadastrarSala(novaSala, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!novaSala?.nome || novaSala?.obs === "") throw new Error("Dados da sala incompletos.");
	const resp = await apiFetch(SALA_ROUTES.cadastrar, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			nome: novaSala.nome,
			obs: novaSala.obs,
			status: novaSala.status,
			responsavel_id: novaSala.responsavel_id || null
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
//#region src/lib/services/SalaServices/Update_Sala_Service.js
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
* @param {{ nome: string, obs: string, status: boolean, responsavel_id?: number | null }} dadosSala
* @param {string} token
* @returns {Promise<any>}
*/
async function atualizarSalas(id, dadosSala, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!dadosSala?.nome) throw new Error("Dados da sala incompletos.");
	const resp = await apiFetch(SALA_ROUTES.atualizar(id), {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			nome: dadosSala.nome,
			obs: dadosSala.obs,
			status: dadosSala.status,
			responsavel_id: dadosSala.responsavel_id || null
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
//#region src/routes/admin/cadastro-sala/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let salasFiltradas;
		let token = "";
		let novaSala = {
			nome: "",
			obs: "",
			status: true,
			responsavel_id: null
		};
		let salas = [];
		let usuarios = [];
		let carregando = false;
		let carregandoLista = false;
		let erro = "";
		let sucesso = "";
		let editando = false;
		let salaEditandoId = null;
		let pesquisa = "";
		let ordenacao = "asc";
		async function carregarLista() {
			carregandoLista = true;
			erro = "";
			try {
				salas = await carregarSalas(token);
			} catch (e) {
				erro = e?.message || "Não foi possível carregar as salas.";
			} finally {
				carregandoLista = false;
			}
		}
		async function salvarSala() {
			erro = "";
			sucesso = "";
			if (!novaSala.nome || !novaSala.obs) {
				erro = "Preencha todos os campos do formulário.";
				return;
			}
			carregando = true;
			try {
				if (editando && salaEditandoId) {
					await atualizarSalas(salaEditandoId, novaSala, token);
					sucesso = "Sala atualizada com sucesso.";
				} else {
					await cadastrarSala(novaSala, token);
					sucesso = "Sala cadastrada com sucesso.";
				}
				resetForm();
				await carregarLista();
			} catch (e) {
				erro = e?.message || "Erro ao salvar sala.";
			} finally {
				carregando = false;
			}
		}
		function resetForm() {
			novaSala = {
				nome: "",
				obs: "",
				status: true,
				responsavel_id: null
			};
			editando = false;
			salaEditandoId = null;
		}
		function mudarOrdenacao(novoValor) {
			ordenacao = novoValor;
		}
		$: salasFiltradas = salas.filter((s) => {
			if (!pesquisa.trim()) return true;
			const termo = pesquisa.toLowerCase();
			const nomeResp = s.responsavel?.nome || s.responsavel?.name || "";
			return s.nome?.toLowerCase().includes(termo) || s.obs?.toLowerCase().includes(termo) || nomeResp.toLowerCase().includes(termo);
		}).filter((s) => {
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
				subtitulo: "Cadastro de Salas",
				onSair: () => goto("/main"),
				onSubmit: salvarSala,
				onCancelar: resetForm,
				editando,
				carregando,
				erro,
				sucesso,
				iconeForm: editando ? "meeting_room" : "add_home",
				tituloTabela: "Salas Cadastradas",
				iconeTabela: "door_front",
				totalRegistros: salasFiltradas.length,
				carregandoLista,
				estadoVazioTexto: "Nenhuma sala encontrada.",
				carregandoTexto: "Carregando salas...",
				temToggle: true,
				mostrarPesquisa: true,
				placeholderPesquisa: "Pesquisar por nome, observação ou responsável...",
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
						$$renderer.push(`<div class="field"><label for="nome-sala">Nome da Sala</label> <input id="nome-sala" type="text"${attr("value", novaSala.nome)} placeholder="Ex: Sala de Reunião A" required=""/></div> <div class="field"><label for="obs-sala">Observação</label> <input id="obs-sala" type="text"${attr("value", novaSala.obs)} placeholder="Ex: Capacidade para 10 pessoas" required=""/></div> <div class="field"><label for="responsavel-sala">Responsável</label> `);
						$$renderer.select({
							id: "responsavel-sala",
							value: novaSala.responsavel_id
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
						$$renderer.push(`<label for="status-sala">Status</label> <div class="toggle-wrapper"><label class="toggle-switch"><input id="status-sala" type="checkbox"${attr("checked", novaSala.status, true)}/> <span class="toggle-track"><span class="toggle-thumb"></span></span></label> <span class="toggle-label">${escape_html(novaSala.status ? "Ativo" : "Inativo")}</span></div>`);
					},
					"filtros-extra": ($$renderer) => {
						$$renderer.push(`<div class="filtro-status"><button type="button"${attr_class(`chip ativo`)}>Todos</button> <button type="button"${attr_class(`chip `)}>Ativos</button> <button type="button"${attr_class(`chip `)}>Inativos</button></div>`);
					},
					"tabela-header": ($$renderer) => {
						$$renderer.push(`<div class="table-header"><div class="th flex-2"><span class="material-symbols-outlined" style="font-size:16px; margin-right:4px; vertical-align:middle">meeting_room</span> Nome</div> <div class="th flex-2">Observação</div> <div class="th flex-2">Responsável</div> <div class="th flex-1">Status</div> <div class="th flex-1">Ações</div></div>`);
					},
					"tabela-body": ($$renderer) => {
						{
							$$renderer.push(`<!--[-->`);
							const each_array_1 = ensure_array_like(salasFiltradas);
							for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
								let s = each_array_1[index];
								$$renderer.push(`<div${attr_class(`table-row ${index % 2 === 0 ? "even" : "odd"}`)}><div class="td flex-2"><span class="text-truncate">${escape_html(s.nome)}</span></div> <div class="td flex-2"><span class="text-truncate">${escape_html(s.obs)}</span></div> <div class="td flex-2"><span class="text-truncate">${escape_html(s.responsavel?.nome || s.responsavel?.name || "—")}</span></div> <div class="td flex-1"><span${attr_class(`badge-status ${s.status ? "ativo" : "inativo"}`)}>${escape_html(s.status ? "Ativo" : "Inativo")}</span></div> <div class="td flex-1 action-cell"><button class="btn-action edit" title="Editar"><span class="material-symbols-outlined">edit</span></button></div></div>`);
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
