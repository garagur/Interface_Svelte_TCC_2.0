import "../../../../chunks/internal.js";
import { C as escape_html, S as attr, i as ensure_array_like, t as attr_class } from "../../../../chunks/server.js";
import { t as goto } from "../../../../chunks/client.js";
import "../../../../chunks/navigation.js";
import { t as CadastroCard } from "../../../../chunks/CadastroCard.js";
import { t as apiFetch } from "../../../../chunks/api.js";
import "../../../../chunks/List_User_Service.js";
import { n as SALA_ROUTES, t as carregarSalas } from "../../../../chunks/List_Sala_Service.js";
//#region src/lib/services/SalaServices/Create_Sala_Service.js
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
* @param {{ nome: string, obs?: string, status: boolean, responsavel_id?: number | null, foto?: File | null }} novaSala
* @param {string} token
* @returns {Promise<any>}
*/
async function cadastrarSala(novaSala, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!novaSala?.nome) throw new Error("Dados da sala incompletos.");
	const { foto } = novaSala;
	if (foto) {
		if (!FOTO_TIPOS$1.includes(foto.type)) throw new Error("Use uma imagem nos formatos jpg, png ou webp.");
		if (foto.size > FOTO_MAX_BYTES$1) throw new Error("A imagem pode ter no máximo 2 MB.");
	}
	const formData = new FormData();
	formData.append("nome", novaSala.nome);
	if (novaSala.obs) formData.append("obs", novaSala.obs);
	formData.append("status", novaSala.status ? "1" : "0");
	if (novaSala.responsavel_id) formData.append("responsavel_id", String(novaSala.responsavel_id));
	if (foto) formData.append("foto", foto);
	const resp = await apiFetch(SALA_ROUTES.cadastrar, {
		method: "POST",
		headers: { "Accept": "application/json" },
		body: formData
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
* @param {{ nome: string, obs?: string, status: boolean, responsavel_id?: number | null, foto?: File | null, removerFoto?: boolean }} dadosSala
* @param {string} token
* @returns {Promise<any>}
*/
async function atualizarSalas(id, dadosSala, token) {
	if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");
	if (!dadosSala?.nome) throw new Error("Dados da sala incompletos.");
	const { foto, removerFoto } = dadosSala;
	if (foto) {
		if (!FOTO_TIPOS.includes(foto.type)) throw new Error("Use uma imagem nos formatos jpg, png ou webp.");
		if (foto.size > FOTO_MAX_BYTES) throw new Error("A imagem pode ter no máximo 2 MB.");
	}
	const formData = new FormData();
	formData.append("_method", "PUT");
	formData.append("nome", dadosSala.nome);
	if (dadosSala.obs) formData.append("obs", dadosSala.obs);
	formData.append("status", dadosSala.status ? "1" : "0");
	if (dadosSala.responsavel_id) formData.append("responsavel_id", String(dadosSala.responsavel_id));
	if (foto) formData.append("foto", foto);
	else if (removerFoto) formData.append("remover_foto", "1");
	const resp = await apiFetch(SALA_ROUTES.atualizar(id), {
		method: "POST",
		headers: { "Accept": "application/json" },
		body: formData
	});
	if (!resp) return;
	const dados = await parseJson(resp);
	if (!resp.ok) {
		if (dados?.errors) throw new Error(Object.values(dados.errors).flat().join(" "));
		throw new Error(dados?.message || dados?.error || "Erro ao atualizar sala.");
	}
	return dados?.data || dados || {};
}
//#endregion
//#region src/routes/admin/cadastro-sala/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let fotoExibida, salasFiltradas;
		let token = "";
		let fotoArquivo = null;
		let fotoPreview = "";
		let removerFoto = false;
		function limparPreview() {
			if (fotoPreview) URL.revokeObjectURL(fotoPreview);
			fotoPreview = "";
		}
		let novaSala = {
			nome: "",
			obs: "",
			status: true,
			responsavel_id: null,
			fotoUrl: null
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
			if (!novaSala.nome) {
				erro = "Preencha o nome da sala.";
				return;
			}
			carregando = true;
			try {
				const dadosEnviar = {
					nome: novaSala.nome,
					obs: novaSala.obs,
					status: novaSala.status,
					responsavel_id: novaSala.responsavel_id,
					foto: fotoArquivo,
					removerFoto
				};
				if (editando && salaEditandoId) {
					await atualizarSalas(salaEditandoId, dadosEnviar, token);
					sucesso = "Sala atualizada com sucesso.";
				} else {
					await cadastrarSala(dadosEnviar, token);
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
				responsavel_id: null,
				fotoUrl: null
			};
			editando = false;
			salaEditandoId = null;
			limparPreview();
			fotoArquivo = null;
			removerFoto = false;
		}
		function mudarOrdenacao(novoValor) {
			ordenacao = novoValor;
		}
		$: fotoExibida = fotoPreview || (removerFoto ? "" : novaSala.fotoUrl || "");
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
					foto: ($$renderer) => {
						$$renderer.push(`<div class="foto-area"><div class="foto-preview">`);
						if (fotoExibida) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<img${attr("src", fotoExibida)} alt="Foto da sala"/>`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`<span class="material-symbols-outlined">meeting_room</span>`);
						}
						$$renderer.push(`<!--]--></div> <input class="input-foto-oculto" type="file" accept="image/jpeg,image/png,image/webp"/> <div class="foto-acoes"><button type="button" class="btn-foto-sec"${attr("disabled", carregando, true)}><span class="material-symbols-outlined">photo_camera</span> ${escape_html(fotoExibida ? "Trocar foto" : "Adicionar foto")}</button> `);
						if (fotoExibida) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<button type="button" class="btn-foto-sec"${attr("disabled", carregando, true)}><span class="material-symbols-outlined">delete</span> Remover foto</button>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></div></div>`);
					},
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
								$$renderer.push(`<div${attr_class(`table-row ${index % 2 === 0 ? "even" : "odd"}`)}><div class="td flex-2"><span class="text-truncate">${escape_html(s.nome)}</span></div> <div class="td flex-2"><span class="text-truncate">${escape_html(s.obs)}</span></div> <div class="td flex-2"><span class="text-truncate">${escape_html(s.responsavel?.nome || s.responsavel?.name || "—")}</span></div> <div class="td flex-1"><span${attr_class(`badge-status ${s.status ? "ativo" : "inativo"}`)}>${escape_html(s.status ? "Ativo" : "Inativo")}</span></div> <div class="td flex-1 action-cell"><button type="button" class="btn-action info" title="Informações" aria-label="Informações da sala"><span class="material-symbols-outlined">info</span></button> <button class="btn-action edit" title="Editar"><span class="material-symbols-outlined">edit</span></button></div></div>`);
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
