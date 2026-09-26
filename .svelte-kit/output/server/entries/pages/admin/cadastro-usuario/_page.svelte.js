import "../../../../chunks/internal.js";
import { C as escape_html, S as attr, i as ensure_array_like, t as attr_class } from "../../../../chunks/server.js";
import { t as goto } from "../../../../chunks/client.js";
import "../../../../chunks/navigation.js";
import { t as CadastroCard } from "../../../../chunks/CadastroCard.js";
import { t as apiFetch } from "../../../../chunks/api.js";
import { t as USER_ROUTES } from "../../../../chunks/User_Endpoints.js";
import { t as carregarUsuarios } from "../../../../chunks/List_User_Service.js";
import { t as atualizarUsuario } from "../../../../chunks/Update_User_Service.js";
//#region src/lib/services/UserServices/Create_User_Service.js
/**
* @param {Response} response
* @returns {Promise<any|null>}
*/
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
* @param {{ nome: string, email: string, cargo: string, matricula: string, status: boolean }} novoUsuario
* @param {string} token
* @returns {Promise<any>}
*/
async function cadastrarUsuario(novoUsuario, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!novoUsuario?.nome || !novoUsuario?.email || !novoUsuario?.cargo || !novoUsuario?.matricula || typeof novoUsuario?.status !== "boolean") throw new Error("Dados do usuário incompletos.");
	const resp = await apiFetch(USER_ROUTES.cadastro, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			name: novoUsuario.nome,
			matricula: novoUsuario.matricula,
			cargo: novoUsuario.cargo,
			email: novoUsuario.email,
			status: novoUsuario.status
		})
	});
	if (!resp) return;
	const dados = await parseJson(resp);
	if (!resp.ok) {
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao cadastrar.");
	}
	return dados?.data || dados || {};
}
//#endregion
//#region src/routes/admin/cadastro-usuario/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let usuariosFiltrados;
		let token = "";
		let novoUsuario = {
			nome: "",
			email: "",
			cargo: "",
			matricula: "",
			status: true
		};
		let usuarios = [];
		let carregando = false;
		let atualizandoId = null;
		let carregandoLista = false;
		let erro = "";
		let sucesso = "";
		let editando = false;
		let usuarioEditandoId = null;
		let pesquisa = "";
		let ordenacao = "asc";
		async function carregarLista() {
			carregandoLista = true;
			erro = "";
			try {
				usuarios = await carregarUsuarios(token);
			} catch (e) {
				erro = e?.message || "Não foi possível carregar os usuários.";
			} finally {
				carregandoLista = false;
			}
		}
		async function salvarUsuario() {
			erro = "";
			sucesso = "";
			if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.cargo || !novoUsuario.matricula) {
				erro = "Preencha todos os campos do formulário.";
				return;
			}
			carregando = true;
			try {
				if (editando && usuarioEditandoId) {
					await atualizarUsuario(usuarioEditandoId, novoUsuario, token);
					sucesso = "Usuário atualizado com sucesso.";
				} else {
					await cadastrarUsuario(novoUsuario, token);
					sucesso = "Usuário cadastrado com sucesso.";
				}
				resetForm();
				await carregarLista();
			} catch (e) {
				erro = e?.message || "Erro ao salvar usuário.";
			} finally {
				carregando = false;
			}
		}
		function resetForm() {
			novoUsuario = {
				nome: "",
				email: "",
				cargo: "",
				matricula: "",
				status: true
			};
			editando = false;
			usuarioEditandoId = null;
		}
		function mudarOrdenacao(novoValor) {
			ordenacao = novoValor;
		}
		$: usuariosFiltrados = usuarios.filter((u) => {
			if (!pesquisa.trim()) return true;
			const termo = pesquisa.toLowerCase();
			return u.nome?.toLowerCase().includes(termo) || u.email?.toLowerCase().includes(termo) || u.matricula?.toLowerCase().includes(termo);
		}).filter((u) => {
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
				subtitulo: "Cadastro de Servidor / Usuário",
				onSair: () => goto("/main"),
				onSubmit: salvarUsuario,
				onCancelar: resetForm,
				editando,
				carregando,
				erro,
				sucesso,
				iconeForm: novoUsuario.matricula ? "manage_accounts" : "person_add",
				tituloTabela: "Usuários Cadastrados",
				iconeTabela: "group",
				totalRegistros: usuariosFiltrados.length,
				carregandoLista,
				estadoVazioTexto: "Nenhum usuário encontrado.",
				carregandoTexto: "Carregando usuários...",
				temToggle: true,
				mostrarPesquisa: true,
				placeholderPesquisa: "Pesquisar por nome, e-mail ou matrícula...",
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
						$$renderer.push(`<div class="field"><label for="nome-usuario">Nome Completo</label> <input id="nome-usuario" type="text"${attr("value", novoUsuario.nome)} placeholder="Ex: João da Silva" required=""/></div> <div class="field"><label for="email-usuario">E-mail</label> <input id="email-usuario" type="email"${attr("value", novoUsuario.email)} placeholder="joao@escola.com" required=""/></div> <div class="field"><label for="cargo-usuario">Cargo</label> `);
						$$renderer.select({
							id: "cargo-usuario",
							value: novoUsuario.cargo,
							required: true
						}, ($$renderer) => {
							$$renderer.option({
								value: "",
								disabled: true,
								selected: true
							}, ($$renderer) => {
								$$renderer.push(`Selecione um cargo...`);
							});
							$$renderer.option({ value: "admin" }, ($$renderer) => {
								$$renderer.push(`Admin`);
							});
							$$renderer.option({ value: "servidor" }, ($$renderer) => {
								$$renderer.push(`Servidor`);
							});
							$$renderer.option({ value: "educador" }, ($$renderer) => {
								$$renderer.push(`Educador`);
							});
						});
						$$renderer.push(`</div> <div class="field"><label for="matricula-usuario">Matrícula</label> <input id="matricula-usuario" type="text"${attr("value", novoUsuario.matricula)} placeholder="000000" required=""/></div>`);
					},
					toggle: ($$renderer) => {
						$$renderer.push(`<label for="status-usuario">Status</label> <div class="toggle-wrapper"><label class="toggle-switch"><input id="status-usuario" type="checkbox"${attr("checked", novoUsuario.status, true)}/> <span class="toggle-track"><span class="toggle-thumb"></span></span></label> <span class="toggle-label">${escape_html(novoUsuario.status ? "Habilitado" : "Desabilitado")}</span></div>`);
					},
					"filtros-extra": ($$renderer) => {
						$$renderer.push(`<div class="filtro-status"><button type="button"${attr_class(`chip ativo`)}>Todos</button> <button type="button"${attr_class(`chip `)}>Habilitados</button> <button type="button"${attr_class(`chip `)}>Desabilitados</button></div>`);
					},
					"tabela-header": ($$renderer) => {
						$$renderer.push(`<div class="table-header"><div class="th flex-2"><span class="material-symbols-outlined" style="font-size:16px; margin-right:4px; vertical-align:middle">person</span> Nome</div> <div class="th flex-2"><span class="material-symbols-outlined" style="font-size:16px; margin-right:4px; vertical-align:middle">mail</span> E-mail</div> <div class="th flex-1">Cargo</div> <div class="th flex-1">Matrícula</div> <div class="th flex-1">Status</div> <div class="th flex-1">Ações</div></div>`);
					},
					"tabela-body": ($$renderer) => {
						{
							$$renderer.push(`<!--[-->`);
							const each_array = ensure_array_like(usuariosFiltrados);
							for (let index = 0, $$length = each_array.length; index < $$length; index++) {
								let u = each_array[index];
								$$renderer.push(`<div${attr_class(`table-row ${index % 2 === 0 ? "even" : "odd"}`)}><div class="td flex-2"><span class="text-truncate">${escape_html(u.nome)}</span></div> <div class="td flex-2"><span class="text-truncate">${escape_html(u.email)}</span></div> <div class="td flex-1"><span class="badge-cargo">${escape_html(u.cargo)}</span></div> <div class="td flex-1"><span class="badge-matricula">${escape_html(u.matricula)}</span></div> <div class="td flex-1"><span${attr_class(`badge-status ${u.status ? "ativo" : "inativo"}`)}>${escape_html(u.status ? "Habilitado" : "Desabilitado")}</span></div> <div class="td flex-1 action-cell"><button type="button" class="btn-action info" title="Informações" aria-label="Informações do usuário"><span class="material-symbols-outlined">info</span></button> <button class="btn-action edit" title="Editar"${attr("disabled", false, true)}><span class="material-symbols-outlined">edit</span></button> <button${attr_class(`btn-action ${u.status ? "delete" : "edit"}`)}${attr("title", u.status ? "Desabilitar usuário" : "Habilitar usuário")}${attr("disabled", false, true)}>`);
								if (atualizandoId === u.id) {
									$$renderer.push("<!--[0-->");
									$$renderer.push(`<span class="material-symbols-outlined spin">progress_activity</span>`);
								} else {
									$$renderer.push("<!--[-1-->");
									$$renderer.push(`<span class="material-symbols-outlined">${escape_html(u.status ? "block" : "check_circle")}</span>`);
								}
								$$renderer.push(`<!--]--></button></div></div>`);
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
