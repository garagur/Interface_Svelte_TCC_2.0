import "../../../../chunks/internal.js";
import { C as escape_html, S as attr, i as ensure_array_like, t as attr_class } from "../../../../chunks/server.js";
import { t as goto } from "../../../../chunks/client.js";
import "../../../../chunks/navigation.js";
import { t as CadastroCard } from "../../../../chunks/CadastroCard.js";
import { t as apiFetch } from "../../../../chunks/api.js";
import { n as EQUIPAMENTO_ROUTES, t as carregarEquipamentos } from "../../../../chunks/List_Equipamento_Service.js";
import "../../../../chunks/List_User_Service.js";
//#region src/lib/services/EquipamentoServices/Create_Equipamento_Service.js
var FOTO_TIPOS$1 = [
	"image/jpeg",
	"image/png",
	"image/webp"
];
var FOTO_MAX_BYTES$1 = 2 * 1024 * 1024;
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
* @param {{ nome: string, N_patrimonio: string, obs?: string, status: boolean, responsavel_id?: number | null, foto?: File | null }} novoEquipamento
* @param {string} token
* @returns {Promise<any>}
*/
async function cadastrarEquipamento(novoEquipamento, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!novoEquipamento?.nome || !novoEquipamento?.N_patrimonio) throw new Error("Dados do equipamento incompletos.");
	const { foto } = novoEquipamento;
	if (foto) {
		if (!FOTO_TIPOS$1.includes(foto.type)) throw new Error("Use uma imagem nos formatos jpg, png ou webp.");
		if (foto.size > FOTO_MAX_BYTES$1) throw new Error("A imagem pode ter no máximo 2 MB.");
	}
	const formData = new FormData();
	formData.append("nome", novoEquipamento.nome);
	formData.append("N_patrimonio", novoEquipamento.N_patrimonio);
	if (novoEquipamento.obs) formData.append("obs", novoEquipamento.obs);
	formData.append("status", novoEquipamento.status ? "1" : "0");
	if (novoEquipamento.responsavel_id) formData.append("responsavel_id", String(novoEquipamento.responsavel_id));
	if (foto) formData.append("foto", foto);
	const resp = await apiFetch(EQUIPAMENTO_ROUTES.cadastrar, {
		method: "POST",
		headers: { "Accept": "application/json" },
		body: formData
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
var FOTO_TIPOS = [
	"image/jpeg",
	"image/png",
	"image/webp"
];
var FOTO_MAX_BYTES = 2 * 1024 * 1024;
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
* @param {{ nome: string, N_patrimonio: string, obs?: string, status: boolean, responsavel_id?: number | null, foto?: File | null, removerFoto?: boolean }} dadosEquipamento
* @param {string} token
* @returns {Promise<any>}
*/
async function atualizarEquipamentos(id, dadosEquipamento, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!dadosEquipamento?.nome || !dadosEquipamento?.N_patrimonio) throw new Error("Dados do equipamento incompletos.");
	const { foto, removerFoto } = dadosEquipamento;
	if (foto) {
		if (!FOTO_TIPOS.includes(foto.type)) throw new Error("Use uma imagem nos formatos jpg, png ou webp.");
		if (foto.size > FOTO_MAX_BYTES) throw new Error("A imagem pode ter no máximo 2 MB.");
	}
	const formData = new FormData();
	formData.append("_method", "PUT");
	formData.append("nome", dadosEquipamento.nome);
	formData.append("N_patrimonio", dadosEquipamento.N_patrimonio);
	if (dadosEquipamento.obs) formData.append("obs", dadosEquipamento.obs);
	formData.append("status", dadosEquipamento.status ? "1" : "0");
	if (dadosEquipamento.responsavel_id) formData.append("responsavel_id", String(dadosEquipamento.responsavel_id));
	if (foto) formData.append("foto", foto);
	else if (removerFoto) formData.append("remover_foto", "1");
	const resp = await apiFetch(EQUIPAMENTO_ROUTES.atualizar(id), {
		method: "POST",
		headers: { "Accept": "application/json" },
		body: formData
	});
	if (!resp) return;
	const dados = await parseJson(resp);
	if (!resp.ok) {
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao atualizar equipamento.");
	}
	return dados?.data || dados || {};
}
//#endregion
//#region src/routes/admin/cadastro-equipamento/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let fotoExibida, equipamentosFiltrados;
		let fotoArquivo = null;
		let fotoPreview = "";
		let removerFoto = false;
		let token = "";
		let novoEquipamento = {
			nome: "",
			N_patrimonio: "",
			obs: "",
			status: true,
			responsavel_id: null,
			fotoUrl: null
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
			if (!novoEquipamento.nome.trim() || !novoEquipamento.N_patrimonio) {
				erro = "Preencha nome e número de patrimônio.";
				return;
			}
			carregando = true;
			try {
				const dadosEnviar = {
					nome: novoEquipamento.nome,
					N_patrimonio: novoEquipamento.N_patrimonio,
					obs: novoEquipamento.obs,
					status: novoEquipamento.status,
					responsavel_id: novoEquipamento.responsavel_id,
					foto: fotoArquivo,
					removerFoto
				};
				if (editando && equipamentoEditandoId) {
					await atualizarEquipamentos(equipamentoEditandoId, dadosEnviar, token);
					sucesso = "Equipamento atualizado com sucesso.";
				} else {
					await cadastrarEquipamento(dadosEnviar, token);
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
				responsavel_id: null,
				fotoUrl: null
			};
			editando = false;
			equipamentoEditandoId = null;
			limparPreview();
			fotoArquivo = null;
			removerFoto = false;
		}
		function mudarOrdenacao(novoValor) {
			ordenacao = novoValor;
		}
		function limparPreview() {
			if (fotoPreview) URL.revokeObjectURL(fotoPreview);
			fotoPreview = "";
		}
		$: fotoExibida = fotoPreview || (removerFoto ? "" : novoEquipamento.fotoUrl || "");
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
					foto: ($$renderer) => {
						$$renderer.push(`<div class="foto-area"><div class="foto-preview">`);
						if (fotoExibida) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<img${attr("src", fotoExibida)} alt="Foto do equipamento"/>`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`<span class="material-symbols-outlined">computer</span>`);
						}
						$$renderer.push(`<!--]--></div> <input class="input-foto-oculto" type="file" accept="image/jpeg,image/png,image/webp"/> <div class="foto-acoes"><button type="button" class="btn-foto-sec"${attr("disabled", carregando, true)}><span class="material-symbols-outlined">photo_camera</span> ${escape_html(fotoExibida ? "Trocar foto" : "Adicionar foto")}</button> `);
						if (fotoExibida) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<button type="button" class="btn-foto-sec"${attr("disabled", carregando, true)}><span class="material-symbols-outlined">delete</span> Remover foto</button>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></div></div>`);
					},
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
								$$renderer.push(`<div${attr_class(`table-row ${index % 2 === 0 ? "even" : "odd"}`)}><div class="td flex-2"><span class="text-truncate">${escape_html(s.nome)}</span></div> <div class="td flex-1"><span class="badge-numero">${escape_html(s.N_patrimonio)}</span></div> <div class="td flex-2"><span class="text-truncate">${escape_html(s.obs)}</span></div> <div class="td flex-2"><span class="text-truncate">${escape_html(s.responsavel?.nome || s.responsavel?.name || "—")}</span></div> <div class="td flex-1"><span${attr_class(`badge-status ${s.status ? "ativo" : "inativo"}`)}>${escape_html(s.status ? "Ativo" : "Inativo")}</span></div> <div class="td flex-1 action-cell"><button type="button" class="btn-action info" title="Informações" aria-label="Informações do equipamento"><span class="material-symbols-outlined">info</span></button> <button class="btn-action edit" title="Editar"><span class="material-symbols-outlined">edit</span></button></div></div>`);
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
