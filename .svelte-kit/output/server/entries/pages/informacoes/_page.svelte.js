import "../../../chunks/internal.js";
import { d as unsubscribe_stores } from "../../../chunks/server.js";
import { t as goto } from "../../../chunks/client.js";
import "../../../chunks/navigation.js";
import "../../../chunks/CabecalhoGlobal.js";
import { t as carregarEquipamentos } from "../../../chunks/List_Equipamento_Service.js";
import { t as carregarUsuarios } from "../../../chunks/List_User_Service.js";
import { n as carregarHorariosProfessor, r as carregarHorariosSala } from "../../../chunks/List_Horario_Service.js";
import { t as carregarSalas } from "../../../chunks/List_Sala_Service.js";
import { a as deletarAgendamentoSala, n as carregarAgendamentosSalas, r as deletarAgendamentoEquipamento, t as carregarAgendamentosEquipamentos } from "../../../chunks/List_Agendamento_Equipamento_Service.js";
import { t as InformacoesCard } from "../../../chunks/InformacoesCard.js";
import { t as buscarUsuario } from "../../../chunks/Buscar_Usuario_Service.js";
//#region src/routes/informacoes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let agendamentos;
		const ROTULOS_CARGO = {
			admin: "Administrador",
			servidor: "Servidor",
			educador: "Educador"
		};
		let token = "";
		let tipo = "sala";
		let itensDisponiveis = [];
		let carregandoItens = false;
		let salasCache = [];
		let equipamentosCache = [];
		let idSelecionado = null;
		let usuarioBruto = null;
		let item = null;
		let carregandoItem = false;
		let blocos = [];
		let carregandoBlocos = false;
		let mostrarGrade = false;
		let tituloGrade = "Grade de Aulas";
		let mostrarTurmaGrade = true;
		let agendamentosSalaItem = [];
		let agendamentosEquipamentoItem = [];
		let carregandoAgendamentos = false;
		let estatisticas = {
			resumo: [],
			destaques: [],
			heatmap: []
		};
		let carregandoEstatisticas = false;
		let erro = "";
		async function carregarListaItens(tipoAlvo) {
			carregandoItens = true;
			try {
				if (tipoAlvo === "sala") {
					salasCache = await carregarSalas(token);
					itensDisponiveis = salasCache.map((s) => ({
						id: s.id,
						nome: s.nome
					}));
				} else if (tipoAlvo === "equipamento") {
					equipamentosCache = await carregarEquipamentos(token);
					itensDisponiveis = equipamentosCache.map((e) => ({
						id: e.id,
						nome: e.nome
					}));
				} else itensDisponiveis = (await carregarUsuarios(token)).map((u) => ({
					id: u.id,
					nome: u.nome
				}));
			} catch (e) {
				erro = e?.message || "Erro ao carregar a lista.";
			} finally {
				carregandoItens = false;
			}
		}
		async function selecionarTipo(novoTipo) {
			if (novoTipo === tipo) return;
			tipo = novoTipo;
			idSelecionado = null;
			item = null;
			usuarioBruto = null;
			blocos = [];
			mostrarGrade = false;
			agendamentosSalaItem = [];
			agendamentosEquipamentoItem = [];
			estatisticas = {
				resumo: [],
				destaques: [],
				heatmap: []
			};
			await carregarListaItens(tipo);
		}
		async function selecionarItem(novoId) {
			if (!novoId) return;
			idSelecionado = novoId;
			await carregarDetalhesItem();
		}
		async function carregarDetalhesItem() {
			carregandoItem = true;
			try {
				if (tipo === "usuario") {
					usuarioBruto = await buscarUsuario(token, idSelecionado);
					item = usuarioBruto && {
						id: usuarioBruto.id,
						nome: usuarioBruto.nome,
						fotoUrl: usuarioBruto.foto_url,
						formaFoto: "circular",
						status: usuarioBruto.status,
						campos: [
							{
								icone: "mail",
								label: "E-mail",
								valor: usuarioBruto.email || "—"
							},
							{
								icone: "badge",
								label: "Matrícula",
								valor: usuarioBruto.matricula || "—"
							},
							{
								icone: "work",
								label: "Cargo",
								valor: ROTULOS_CARGO[usuarioBruto.cargo] || usuarioBruto.cargo || "—"
							}
						]
					};
				} else if (tipo === "sala") {
					const sala = salasCache.find((s) => String(s.id) === String(idSelecionado));
					usuarioBruto = null;
					item = sala && {
						id: sala.id,
						nome: sala.nome,
						fotoUrl: sala.fotoUrl,
						formaFoto: "quadrada",
						status: sala.status,
						campos: [{
							icone: "person",
							label: "Responsável",
							valor: sala.responsavel_nome || "—"
						}, {
							icone: "sticky_note_2",
							label: "Observações",
							valor: sala.obs || "—"
						}]
					};
				} else {
					const equipamento = equipamentosCache.find((e) => String(e.id) === String(idSelecionado));
					usuarioBruto = null;
					item = equipamento && {
						id: equipamento.id,
						nome: equipamento.nome,
						fotoUrl: equipamento.fotoUrl,
						formaFoto: "quadrada",
						status: equipamento.status,
						campos: [
							{
								icone: "tag",
								label: "Nº Patrimônio",
								valor: equipamento.N_patrimonio || "—"
							},
							{
								icone: "person",
								label: "Responsável",
								valor: equipamento.responsavel_nome || "—"
							},
							{
								icone: "sticky_note_2",
								label: "Observações",
								valor: equipamento.obs || "—"
							}
						]
					};
				}
				await carregarGradeEAgendamentos();
			} catch (e) {
				erro = e?.message || "Erro ao carregar dados do item.";
			} finally {
				carregandoItem = false;
			}
		}
		async function carregarGradeEAgendamentos() {
			carregandoBlocos = true;
			carregandoAgendamentos = true;
			carregandoEstatisticas = true;
			try {
				if (tipo === "usuario") {
					if (usuarioBruto?.cargo === "educador") {
						blocos = await carregarHorariosProfessor(token, idSelecionado);
						mostrarGrade = true;
						tituloGrade = "Grade de Aulas";
						mostrarTurmaGrade = true;
					} else {
						blocos = [];
						mostrarGrade = false;
					}
					const [todasSalas, todosEquipamentos] = await Promise.all([carregarAgendamentosSalas(token, null), carregarAgendamentosEquipamentos(token)]);
					agendamentosSalaItem = todasSalas.filter((a) => String(a.user_id) === String(idSelecionado));
					agendamentosEquipamentoItem = todosEquipamentos.filter((a) => String(a.user_id) === String(idSelecionado));
				} else if (tipo === "sala") {
					blocos = await carregarHorariosSala(token, idSelecionado);
					mostrarGrade = true;
					tituloGrade = "Grade de Aulas da Sala";
					mostrarTurmaGrade = true;
					agendamentosSalaItem = await carregarAgendamentosSalas(token, idSelecionado);
					agendamentosEquipamentoItem = [];
				} else {
					blocos = [];
					mostrarGrade = false;
					agendamentosEquipamentoItem = (await carregarAgendamentosEquipamentos(token)).filter((a) => String(a.equipamento_id) === String(idSelecionado));
					agendamentosSalaItem = [];
				}
				montarEstatisticas();
			} catch (e) {
				erro = e?.message || "Erro ao carregar grade e agendamentos.";
			} finally {
				carregandoBlocos = false;
				carregandoAgendamentos = false;
			}
		}
		function itemMaisFrequente(lista, campoNome, campoId) {
			const contagem = /* @__PURE__ */ new Map();
			for (const it of lista) {
				const chave = it[campoNome] || it[campoId] || "Não informado";
				contagem.set(chave, (contagem.get(chave) || 0) + 1);
			}
			let maisFrequente = null;
			let maiorQtd = 0;
			for (const [chave, qtd] of contagem) if (qtd > maiorQtd) {
				maiorQtd = qtd;
				maisFrequente = chave;
			}
			return maisFrequente;
		}
		function montarHeatmap(lista) {
			const contagemPorDia = /* @__PURE__ */ new Map();
			for (const ag of lista) {
				if (!ag.data_hora_inicio) continue;
				const chave = new Date(ag.data_hora_inicio).toISOString().slice(0, 10);
				contagemPorDia.set(chave, (contagemPorDia.get(chave) || 0) + 1);
			}
			return Array.from(contagemPorDia.entries()).map(([data, quantidade]) => ({
				data,
				quantidade
			}));
		}
		function montarEstatisticas() {
			if (tipo === "usuario") {
				const salasAtivas = agendamentosSalaItem.filter((a) => a.status !== "inativo");
				const equipamentosAtivos = agendamentosEquipamentoItem.filter((a) => a.status !== "inativo");
				const totalGeral = salasAtivas.length + equipamentosAtivos.length;
				estatisticas = {
					resumo: [
						{
							valor: salasAtivas.length,
							label: "Salas agendadas"
						},
						{
							valor: equipamentosAtivos.length,
							label: "Equipamentos agendados"
						},
						{
							valor: totalGeral,
							label: "Total geral"
						}
					],
					destaques: [{
						icone: "meeting_room",
						label: "Sala mais agendada",
						valor: itemMaisFrequente(salasAtivas, "sala_nome", "sala_id") || "—"
					}, {
						icone: "devices",
						label: "Equipamento mais agendado",
						valor: itemMaisFrequente(equipamentosAtivos, "equipamento_nome", "equipamento_id") || "—"
					}],
					heatmap: montarHeatmap([...salasAtivas, ...equipamentosAtivos])
				};
			} else if (tipo === "sala") {
				const ativos = agendamentosSalaItem.filter((a) => a.status !== "inativo");
				estatisticas = {
					resumo: [{
						valor: ativos.length,
						label: "Agendamentos ativos"
					}, {
						valor: agendamentosSalaItem.length,
						label: "Total histórico"
					}],
					destaques: [{
						icone: "person",
						label: "Usuário mais frequente",
						valor: itemMaisFrequente(ativos, "usuario_nome", "user_id") || "—"
					}],
					heatmap: montarHeatmap(ativos)
				};
			} else {
				const ativos = agendamentosEquipamentoItem.filter((a) => a.status !== "inativo");
				estatisticas = {
					resumo: [{
						valor: ativos.length,
						label: "Agendamentos ativos"
					}, {
						valor: agendamentosEquipamentoItem.length,
						label: "Total histórico"
					}],
					destaques: [{
						icone: "person",
						label: "Usuário mais frequente",
						valor: itemMaisFrequente(ativos, "usuario_nome", "user_id") || "—"
					}],
					heatmap: montarHeatmap(ativos)
				};
			}
			carregandoEstatisticas = false;
		}
		async function deletar(ag) {
			try {
				if (ag.tipo === "equipamento") {
					await deletarAgendamentoEquipamento(ag.id, token, ag.justificativa || "");
					agendamentosEquipamentoItem = agendamentosEquipamentoItem.map((a) => a.id === ag.id ? {
						...a,
						status: "inativo",
						justificativa: ag.justificativa || ""
					} : a);
				} else {
					await deletarAgendamentoSala(ag.id, token, ag.justificativa || "");
					agendamentosSalaItem = agendamentosSalaItem.map((a) => a.id === ag.id ? {
						...a,
						status: "inativo",
						justificativa: ag.justificativa || ""
					} : a);
				}
				montarEstatisticas();
			} catch (e) {
				erro = e?.message || "Erro ao deletar agendamento.";
				throw e;
			}
		}
		$: agendamentos = [...agendamentosSalaItem, ...agendamentosEquipamentoItem];
		InformacoesCard($$renderer, {
			tipo,
			onTipoChange: selecionarTipo,
			itensDisponiveis,
			carregandoItens,
			itemSelecionadoId: idSelecionado,
			onItemChange: selecionarItem,
			item,
			carregandoItem,
			estatisticas,
			carregandoEstatisticas,
			mostrarGrade,
			tituloGrade,
			blocos,
			carregandoBlocos,
			mostrarTurmaGrade,
			agendamentos,
			carregandoAgendamentos,
			erro,
			onSair: () => goto("/main"),
			onDeletar: deletar
		});
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
