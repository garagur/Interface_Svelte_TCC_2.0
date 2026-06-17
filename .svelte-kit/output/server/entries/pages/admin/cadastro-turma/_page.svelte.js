import "../../../../chunks/environment.js";
import { B as escape_html, a as ensure_array_like, l as stringify, n as attr_class, z as attr } from "../../../../chunks/dev.js";
import { t as goto } from "../../../../chunks/client.js";
import "../../../../chunks/navigation.js";
import { t as CadastroCard } from "../../../../chunks/CadastroCard.js";
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
	const resp = await fetch(TURMA_ROUTES.cadastrar, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": `Bearer ${token}`
		},
		body: JSON.stringify({
			nome: novaTurma.nome,
			ano_letivo: novaTurma.ano_letivo
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
	const resp = await fetch(TURMA_ROUTES.atualizar(id), {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": `Bearer ${token}`
		},
		body: JSON.stringify({
			nome: dadosTurma.nome,
			ano_letivo: dadosTurma.ano_letivo
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
//#region src/routes/admin/cadastro-turma/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
			totalRegistros: turmas.length,
			carregandoLista,
			estadoVazioTexto: "Nenhuma turma cadastrada ainda.",
			carregandoTexto: "Carregando turmas...",
			$$slots: {
				campos: ($$renderer) => {
					$$renderer.push(`<div class="field"><label for="nome-turma">Nome da Turma</label> <input id="nome-turma" type="text"${attr("value", novaTurma.nome)} placeholder="Ex: 9º Ano A" required=""/></div> <div class="field"><label for="ano-letivo">Ano Letivo</label> <input id="ano-letivo" type="number"${attr("value", novaTurma.ano_letivo)} placeholder="Ex: 2026" required=""/></div>`);
				},
				"tabela-header": ($$renderer) => {
					$$renderer.push(`<div class="table-header"><div class="th flex-2">Nome</div> <div class="th flex-1">Ano Letivo</div> <div class="th flex-1">Ações</div></div>`);
				},
				"tabela-body": ($$renderer) => {
					{
						$$renderer.push(`<!--[-->`);
						const each_array = ensure_array_like(turmas);
						for (let index = 0, $$length = each_array.length; index < $$length; index++) {
							let t = each_array[index];
							$$renderer.push(`<div${attr_class(`table-row ${stringify(index % 2 === 0 ? "even" : "odd")}`)}><div class="td flex-2"><span class="material-symbols-outlined icon-tiny">groups</span> <span class="text-truncate">${escape_html(t.nome)}</span></div> <div class="td flex-1"><span class="badge-numero">${escape_html(t.ano_letivo)}</span></div> <div class="td flex-1 action-cell"><button class="btn-action edit" title="Editar"><span class="material-symbols-outlined">edit</span></button></div></div>`);
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
