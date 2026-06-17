import "../../../../chunks/environment.js";
import { B as escape_html, a as ensure_array_like, l as stringify, n as attr_class, z as attr } from "../../../../chunks/dev.js";
import { t as goto } from "../../../../chunks/client.js";
import "../../../../chunks/navigation.js";
/* empty css                                */
import { t as CadastroCard } from "../../../../chunks/CadastroCard.js";
import { t as API_URL } from "../../../../chunks/constants.js";
//#region src/config/routes/Equipamento_Endpoints.js
var EQUIPAMENTO_ROUTES = {
	listar: `${API_URL}/equipamentos`,
	buscar: (id) => `${API_URL}/equipamentos/${id}`,
	cadastrar: `${API_URL}/equipamentos`,
	atualizar: (id) => `${API_URL}/equipamentos/${id}`
};
//#endregion
//#region src/lib/services/EquipamentoServices/Create_Equipamento_Service.js
async function parseJson$2(response) {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
/**
* @param {{ nome: string, N_patrimonio: string, obs: string, status: boolean }} novoEquipamento
* @param {string} token
* @returns {Promise<any>}
*/
async function cadastrarEquipamento(novoEquipamento, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!novoEquipamento?.nome || !novoEquipamento?.N_patrimonio || novoEquipamento?.obs === "") throw new Error("Dados do equipamento incompletos.");
	const resp = await fetch(EQUIPAMENTO_ROUTES.cadastrar, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": `Bearer ${token}`
		},
		body: JSON.stringify({
			nome: novoEquipamento.nome,
			N_patrimonio: novoEquipamento.N_patrimonio,
			obs: novoEquipamento.obs,
			status: novoEquipamento.status
		})
	});
	const dados = await parseJson$2(resp);
	if (!resp.ok) {
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao cadastrar equipamento.");
	}
	return dados?.data || dados || {};
}
//#endregion
//#region src/lib/services/EquipamentoServices/List_Equipamento_Service.js
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
* @param {string} token
* @returns {Promise<any[]>}
*/
async function carregarEquipamentos(token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	const resp = await fetch(EQUIPAMENTO_ROUTES.listar, {
		method: "GET",
		headers: {
			"Accept": "application/json",
			"Authorization": `Bearer ${token}`
		}
	});
	const dados = await parseJson$1(resp);
	if (!resp.ok) throw new Error(dados?.message || dados?.error || "Erro ao carregar equipamentos.");
	return (Array.isArray(dados) ? dados : dados?.data || []).map((s) => ({
		id: s.id,
		nome: s.nome || "",
		N_patrimonio: s.N_patrimonio || "",
		obs: s.obs || "",
		status: s.status ?? true
	}));
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
* @param {{ nome: string, N_patrimonio: string, obs: string, status: boolean }} dadosEquipamento
* @param {string} token
* @returns {Promise<any>}
*/
async function atualizarEquipamentos(id, dadosEquipamento, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!dadosEquipamento?.nome || !dadosEquipamento?.N_patrimonio) throw new Error("Dados do equipamento incompletos.");
	const resp = await fetch(EQUIPAMENTO_ROUTES.atualizar(id), {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": `Bearer ${token}`
		},
		body: JSON.stringify({
			nome: dadosEquipamento.nome,
			N_patrimonio: dadosEquipamento.N_patrimonio,
			obs: dadosEquipamento.obs,
			status: dadosEquipamento.status
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
//#region src/routes/admin/cadastro-equipamento/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let token = "";
		let novoEquipamento = {
			nome: "",
			N_patrimonio: null,
			obs: "",
			status: true
		};
		let equipamentos = [];
		let carregando = false;
		let carregandoLista = false;
		let erro = "";
		let sucesso = "";
		let editando = false;
		let equipamentoEditandoId = null;
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
				status: true
			};
			editando = false;
			equipamentoEditandoId = null;
		}
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
			totalRegistros: equipamentos.length,
			carregandoLista,
			estadoVazioTexto: "Nenhum equipamento cadastrado ainda.",
			carregandoTexto: "Carregando equipamentos...",
			temToggle: true,
			$$slots: {
				campos: ($$renderer) => {
					$$renderer.push(`<div class="field"><label for="nome-equipamento">Nome do Equipamento</label> <input id="nome-equipamento" type="text"${attr("value", novoEquipamento.nome)} placeholder="Ex: Notebook Dell" required=""/></div> <div class="field"><label for="numero-equipamento">Número</label> <input id="numero-equipamento" type="text"${attr("value", novoEquipamento.N_patrimonio)} placeholder="Ex: PAT-101" required=""/></div> <div class="field"><label for="obs-equipamento">Observação</label> <input id="obs-equipamento" type="text"${attr("value", novoEquipamento.obs)} placeholder="Ex: funciona apenas em 220V" required=""/></div>`);
				},
				toggle: ($$renderer) => {
					$$renderer.push(`<label for="status-equipamento">Status</label> <div class="toggle-wrapper"><label class="toggle-switch"><input id="status-equipamento" type="checkbox"${attr("checked", novoEquipamento.status, true)}/> <span class="toggle-track"><span class="toggle-thumb"></span></span></label> <span class="toggle-label">${escape_html(novoEquipamento.status ? "Ativo" : "Inativo")}</span></div>`);
				},
				"tabela-header": ($$renderer) => {
					$$renderer.push(`<div class="table-header"><div class="th flex-2">Nome</div> <div class="th flex-1">Número</div> <div class="th flex-2">Observação</div> <div class="th flex-1">Status</div> <div class="th flex-1">Ações</div></div>`);
				},
				"tabela-body": ($$renderer) => {
					{
						$$renderer.push(`<!--[-->`);
						const each_array = ensure_array_like(equipamentos);
						for (let index = 0, $$length = each_array.length; index < $$length; index++) {
							let s = each_array[index];
							$$renderer.push(`<div${attr_class(`table-row ${stringify(index % 2 === 0 ? "even" : "odd")}`)}><div class="td flex-2"><span class="material-symbols-outlined icon-tiny">computer</span> <span class="text-truncate">${escape_html(s.nome)}</span></div> <div class="td flex-1"><span class="badge-numero">${escape_html(s.N_patrimonio)}</span></div> <div class="td flex-2"><span class="text-truncate">${escape_html(s.obs)}</span></div> <div class="td flex-1"><span${attr_class(`badge-status ${stringify(s.status ? "ativo" : "inativo")}`)}>${escape_html(s.status ? "Ativo" : "Inativo")}</span></div> <div class="td flex-1 action-cell"><button class="btn-action edit" title="Editar"><span class="material-symbols-outlined">edit</span></button></div></div>`);
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
