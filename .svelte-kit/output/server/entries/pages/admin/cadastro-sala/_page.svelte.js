import "../../../../chunks/environment.js";
import { B as escape_html, a as ensure_array_like, l as stringify, n as attr_class, z as attr } from "../../../../chunks/dev.js";
import { t as goto } from "../../../../chunks/client.js";
import "../../../../chunks/navigation.js";
import { t as CadastroCard } from "../../../../chunks/CadastroCard.js";
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
* @param {{ nome: string, numero: number, obs: string, status: boolean }} novaSala
* @param {string} token
* @returns {Promise<any>}
*/
async function cadastrarSala(novaSala, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!novaSala?.nome || !novaSala?.numero || novaSala?.obs === "") throw new Error("Dados da sala incompletos.");
	const resp = await fetch(SALA_ROUTES.cadastrar, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": `Bearer ${token}`
		},
		body: JSON.stringify({
			nome: novaSala.nome,
			numero: novaSala.numero,
			obs: novaSala.obs,
			status: novaSala.status
		})
	});
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
* @param {{ nome: string, numero: number, obs: string, status: boolean }} dadosSala
* @param {string} token
* @returns {Promise<any>}
*/
async function atualizarSalas(id, dadosSala, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!dadosSala?.nome || !dadosSala?.numero) throw new Error("Dados da sala incompletos.");
	const resp = await fetch(SALA_ROUTES.atualizar(id), {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": `Bearer ${token}`
		},
		body: JSON.stringify({
			nome: dadosSala.nome,
			numero: dadosSala.numero,
			obs: dadosSala.obs,
			status: dadosSala.status
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
//#region src/routes/admin/cadastro-sala/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let token = "";
		let novaSala = {
			nome: "",
			numero: null,
			obs: "",
			status: true
		};
		let salas = [];
		let carregando = false;
		let carregandoLista = false;
		let erro = "";
		let sucesso = "";
		let editando = false;
		let salaEditandoId = null;
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
			if (!novaSala.nome || !novaSala.numero || !novaSala.obs) {
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
				numero: "",
				obs: "",
				status: true
			};
			editando = false;
			salaEditandoId = null;
		}
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
			totalRegistros: salas.length,
			carregandoLista,
			estadoVazioTexto: "Nenhuma sala cadastrada ainda.",
			carregandoTexto: "Carregando salas...",
			temToggle: true,
			$$slots: {
				campos: ($$renderer) => {
					$$renderer.push(`<div class="field"><label for="nome-sala">Nome da Sala</label> <input id="nome-sala" type="text"${attr("value", novaSala.nome)} placeholder="Ex: Sala de Reunião A" required=""/></div> <div class="field"><label for="numero-sala">Número</label> <input id="numero-sala" type="number"${attr("value", novaSala.numero)} placeholder="Ex: 101" required=""/></div> <div class="field"><label for="obs-sala">Observação</label> <input id="obs-sala" type="text"${attr("value", novaSala.obs)} placeholder="Ex: Capacidade para 10 pessoas" required=""/></div>`);
				},
				toggle: ($$renderer) => {
					$$renderer.push(`<label for="status-sala">Status</label> <div class="toggle-wrapper"><label class="toggle-switch"><input id="status-sala" type="checkbox"${attr("checked", novaSala.status, true)}/> <span class="toggle-track"><span class="toggle-thumb"></span></span></label> <span class="toggle-label">${escape_html(novaSala.status ? "Ativo" : "Inativo")}</span></div>`);
				},
				"tabela-header": ($$renderer) => {
					$$renderer.push(`<div class="table-header"><div class="th flex-2">Nome</div> <div class="th flex-1">Número</div> <div class="th flex-2">Observação</div> <div class="th flex-1">Status</div> <div class="th flex-1">Ações</div></div>`);
				},
				"tabela-body": ($$renderer) => {
					{
						$$renderer.push(`<!--[-->`);
						const each_array = ensure_array_like(salas);
						for (let index = 0, $$length = each_array.length; index < $$length; index++) {
							let s = each_array[index];
							$$renderer.push(`<div${attr_class(`table-row ${stringify(index % 2 === 0 ? "even" : "odd")}`)}><div class="td flex-2"><span class="material-symbols-outlined icon-tiny">meeting_room</span> <span class="text-truncate">${escape_html(s.nome)}</span></div> <div class="td flex-1"><span class="badge-numero">${escape_html(s.numero)}</span></div> <div class="td flex-2"><span class="text-truncate">${escape_html(s.obs)}</span></div> <div class="td flex-1"><span${attr_class(`badge-status ${stringify(s.status ? "ativo" : "inativo")}`)}>${escape_html(s.status ? "Ativo" : "Inativo")}</span></div> <div class="td flex-1 action-cell"><button class="btn-action edit" title="Editar"><span class="material-symbols-outlined">edit</span></button></div></div>`);
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
