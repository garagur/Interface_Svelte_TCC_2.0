import "../../../../chunks/environment.js";
import { B as escape_html, a as ensure_array_like, l as stringify, n as attr_class, z as attr } from "../../../../chunks/dev.js";
import { t as goto } from "../../../../chunks/client.js";
import "../../../../chunks/navigation.js";
import { t as CadastroCard } from "../../../../chunks/CadastroCard.js";
import { n as USER_ROUTES } from "../../../../chunks/User_Endpoints.js";
import { t as carregarUsuarios } from "../../../../chunks/List_User_Service.js";
//#region src/lib/services/UserServices/Create_User_Service.js
/**
* @param {Response} response
* @returns {Promise<any|null>}
*/
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
* @param {{ nome: string, email: string, cargo: string, matricula: string }} novoUsuario
* @param {string} token
* @returns {Promise<any>}
*/
async function cadastrarUsuario(novoUsuario, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!novoUsuario?.nome || !novoUsuario?.email || !novoUsuario?.cargo || !novoUsuario?.matricula) throw new Error("Dados do usuário incompletos.");
	const resp = await fetch(USER_ROUTES.cadastro, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": `Bearer ${token}`
		},
		body: JSON.stringify({
			name: novoUsuario.nome,
			matricula: novoUsuario.matricula,
			cargo: novoUsuario.cargo,
			email: novoUsuario.email
		})
	});
	const dados = await parseJson$1(resp);
	if (!resp.ok) {
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao cadastrar.");
	}
	return dados?.data || dados || {};
}
//#endregion
//#region src/lib/services/UserServices/Update_User_Service.js
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
* @param {{ nome: string, email: string, cargo: string, matricula: string }} dadosUsuario
* @param {string} token
* @returns {Promise<any>}
*/
async function atualizarUsuario(id, dadosUsuario, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!dadosUsuario?.nome || !dadosUsuario?.email || !dadosUsuario?.cargo || !dadosUsuario?.matricula) throw new Error("Dados do usuário incompletos.");
	const resp = await fetch(USER_ROUTES.atualizar(id), {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": `Bearer ${token}`
		},
		body: JSON.stringify({
			name: dadosUsuario.nome,
			matricula: dadosUsuario.matricula,
			cargo: dadosUsuario.cargo,
			email: dadosUsuario.email
		})
	});
	const dados = await parseJson(resp);
	if (!resp.ok) {
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao atualizar.");
	}
	return dados?.data || dados || {};
}
//#endregion
//#region src/routes/admin/cadastro-usuario/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let token = "";
		let novoUsuario = {
			nome: "",
			email: "",
			cargo: "",
			matricula: ""
		};
		let usuarios = [];
		let carregando = false;
		let carregandoLista = false;
		let erro = "";
		let sucesso = "";
		let editando = false;
		let usuarioEditandoId = null;
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
				matricula: ""
			};
			editando = false;
			usuarioEditandoId = null;
		}
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
			totalRegistros: usuarios.length,
			carregandoLista,
			estadoVazioTexto: "Nenhum usuário cadastrado ainda.",
			carregandoTexto: "Carregando usuários...",
			temToggle: false,
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
				"tabela-header": ($$renderer) => {
					$$renderer.push(`<div class="table-header"><div class="th flex-2">Nome</div> <div class="th flex-2">E-mail</div> <div class="th flex-1">Cargo</div> <div class="th flex-1">Matrícula</div> <div class="th flex-1">Ações</div></div>`);
				},
				"tabela-body": ($$renderer) => {
					{
						$$renderer.push(`<!--[-->`);
						const each_array = ensure_array_like(usuarios);
						for (let index = 0, $$length = each_array.length; index < $$length; index++) {
							let u = each_array[index];
							$$renderer.push(`<div${attr_class(`table-row ${stringify(index % 2 === 0 ? "even" : "odd")}`)}><div class="td flex-2"><span class="material-symbols-outlined icon-tiny">person</span> <span class="text-truncate">${escape_html(u.nome)}</span></div> <div class="td flex-2"><span class="material-symbols-outlined icon-tiny">mail</span> <span class="text-truncate">${escape_html(u.email)}</span></div> <div class="td flex-1"><span class="badge-cargo">${escape_html(u.cargo)}</span></div> <div class="td flex-1"><span class="badge-matricula">${escape_html(u.matricula)}</span></div> <div class="td flex-1 action-cell"><button class="btn-action edit" title="Editar"><span class="material-symbols-outlined">edit</span></button> <button class="btn-action delete" title="Excluir"><span class="material-symbols-outlined">delete</span></button></div></div>`);
						}
						$$renderer.push(`<!--]-->`);
					}
				}
			}
		});
	});
}
//#endregion
export { _page as default };
