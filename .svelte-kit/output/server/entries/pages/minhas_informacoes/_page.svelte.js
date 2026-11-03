import "../../../chunks/internal.js";
import "../../../chunks/server.js";
import { t as goto } from "../../../chunks/client.js";
import "../../../chunks/navigation.js";
import "../../../chunks/List_Horario_Service.js";
import { t as atualizarUsuario } from "../../../chunks/Update_User_Service.js";
import { c as deletarAgendamentoSala, n as ConfirmarConflitoModal, o as deletarAgendamentoEquipamento, r as confirmarAgendamento, t as encontrarConflitosOciosos } from "../../../chunks/agendamentoConflito.js";
import { t as InformacoesCard } from "../../../chunks/InformacoesCard.js";
import "../../../chunks/Buscar_Usuario_Service.js";
//#region src/routes/minhas_informacoes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let itemPerfil;
		let token = "";
		let professor_id = "";
		let usuario = null;
		let carregandoUsuario = false;
		/** @type {"circular"} */
		let blocos = [];
		let agendamentosSala = [];
		let agendamentosEquipamento = [];
		let carregandoBlocos = false;
		let carregandoAgendamentos = false;
		let carregandoEstatisticas = false;
		let erro = "";
		let agendamentoEmConflito = null;
		let confirmandoConflito = false;
		let estatisticas = {
			resumo: [],
			destaques: [],
			heatmap: []
		};
		async function salvarPerfil({ nome, email, foto, removerFoto }) {
			const resposta = await atualizarUsuario(Number(professor_id), {
				nome,
				email,
				foto,
				removerFoto
			}, token);
			if (!resposta) return;
			const atualizado = resposta?.user || resposta?.data?.user || resposta?.data || resposta;
			if (!atualizado) throw new Error("Resposta inesperada do servidor.");
			usuario = {
				...usuario,
				nome: atualizado.name || atualizado.nome || usuario?.nome || "",
				email: atualizado.email || usuario?.email || "",
				foto_url: atualizado.foto_url ?? atualizado.avatar_url ?? atualizado.foto ?? null
			};
			try {
				const salvo = JSON.parse(localStorage.getItem("user") || "null");
				if (salvo) localStorage.setItem("user", JSON.stringify({
					...salvo,
					name: atualizado.name || atualizado.nome || salvo.name,
					email: atualizado.email,
					foto_url: atualizado.foto_url ?? atualizado.avatar_url ?? atualizado.foto ?? null
				}));
			} catch {}
		}
		function itemMaisFrequente(lista, campoNome, campoId) {
			const contagem = /* @__PURE__ */ new Map();
			for (const item of lista) {
				const chave = item[campoNome] || item[campoId] || "Não informado";
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
		function montarHeatmap(todos) {
			const contagemPorDia = /* @__PURE__ */ new Map();
			for (const ag of todos) {
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
			const salasAtivas = agendamentosSala.filter((a) => a.status !== "inativo");
			const equipamentosAtivos = agendamentosEquipamento.filter((a) => a.status !== "inativo");
			const todos = [...salasAtivas, ...equipamentosAtivos];
			estatisticas = {
				resumo: [
					{
						valor: salasAtivas.length,
						label: "Agendamentos de sala"
					},
					{
						valor: equipamentosAtivos.length,
						label: "Agendamentos de equipamento"
					},
					{
						valor: todos.length,
						label: "Total de agendamentos"
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
				heatmap: montarHeatmap(todos)
			};
			carregandoEstatisticas = false;
		}
		async function deletar(ag) {
			try {
				if (ag.tipo === "equipamento") await deletarAgendamentoEquipamento(ag.id, token, ag.justificativa || "");
				else await deletarAgendamentoSala(ag.id, token, ag.justificativa || "");
				if (ag.tipo === "equipamento") agendamentosEquipamento = agendamentosEquipamento.map((a) => a.id === ag.id ? {
					...a,
					status: "inativo",
					justificativa: ag.justificativa || ""
				} : a);
				else agendamentosSala = agendamentosSala.map((a) => a.id === ag.id ? {
					...a,
					status: "inativo",
					justificativa: ag.justificativa || ""
				} : a);
				montarEstatisticas();
			} catch (e) {
				erro = e?.message || "Erro ao deletar agendamento.";
				throw e;
			}
		}
		async function confirmar(ag) {
			const conflitos = encontrarConflitosOciosos(ag, ag.tipo === "equipamento" ? agendamentosEquipamento : agendamentosSala);
			if (conflitos.length > 0) {
				agendamentoEmConflito = {
					agendamento: ag,
					conflitos
				};
				return;
			}
			try {
				const status = (await confirmarAgendamento(ag))?.status || "ativo";
				if (ag.tipo === "equipamento") agendamentosEquipamento = agendamentosEquipamento.map((item) => item.id === ag.id ? {
					...item,
					status
				} : item);
				else agendamentosSala = agendamentosSala.map((item) => item.id === ag.id ? {
					...item,
					status
				} : item);
				montarEstatisticas();
			} catch (e) {
				erro = e?.message || "Erro ao confirmar o agendamento.";
				throw e;
			}
		}
		async function confirmarConflito({ agendamento, conflitos, justificativa }) {
			confirmandoConflito = true;
			try {
				await Promise.all(conflitos.map(async (conflito) => {
					if (conflito.tipo === "sala") await deletarAgendamentoSala(conflito.id, token, justificativa || "");
					else if (conflito.tipo === "equipamento") await deletarAgendamentoEquipamento(conflito.id, token, justificativa || "");
				}));
				const status = (await confirmarAgendamento(agendamento))?.status || "ativo";
				if (agendamento.tipo === "equipamento") agendamentosEquipamento = agendamentosEquipamento.map((item) => {
					if (conflitos.some((conflito) => conflito.id === item.id && conflito.tipo === item.tipo)) return {
						...item,
						status: "inativo",
						justificativa: justificativa || item.justificativa || ""
					};
					if (item.id === agendamento.id) return {
						...item,
						status
					};
					return item;
				});
				else agendamentosSala = agendamentosSala.map((item) => {
					if (conflitos.some((conflito) => conflito.id === item.id && conflito.tipo === item.tipo)) return {
						...item,
						status: "inativo",
						justificativa: justificativa || item.justificativa || ""
					};
					if (item.id === agendamento.id) return {
						...item,
						status
					};
					return item;
				});
				agendamentoEmConflito = null;
				montarEstatisticas();
			} catch (e) {
				erro = e?.message || "Erro ao confirmar o agendamento em conflito.";
				throw e;
			} finally {
				confirmandoConflito = false;
			}
		}
		$: itemPerfil = usuario && {
			id: usuario.id,
			nome: usuario.nome,
			email: usuario.email,
			fotoUrl: usuario.foto_url || "",
			formaFoto: "circular",
			status: Boolean(usuario.status ?? true),
			campos: [
				{
					chave: "email",
					icone: "mail",
					label: "E-mail",
					valor: usuario.email || "—"
				},
				{
					icone: "badge",
					label: "Matrícula",
					valor: usuario.matricula || "—"
				},
				{
					icone: "work",
					label: "Cargo",
					valor: usuario.cargo || "—"
				}
			]
		};
		ConfirmarConflitoModal($$renderer, {
			agendamento: agendamentoEmConflito?.agendamento ?? null,
			conflitos: agendamentoEmConflito?.conflitos ?? [],
			onConfirmar: confirmarConflito,
			onCancelar: () => agendamentoEmConflito = null,
			processando: confirmandoConflito
		});
		$$renderer.push(`<!----> `);
		InformacoesCard($$renderer, {
			subtitulo: "Minhas Informações",
			tituloDados: "Meu Perfil",
			tituloEstatisticas: "Minhas Estatísticas",
			tituloAgendamentos: "Meus Agendamentos",
			mostrarSeletor: false,
			item: itemPerfil,
			carregandoItem: carregandoUsuario,
			estatisticas,
			carregandoEstatisticas,
			mostrarGrade: true,
			tituloGrade: "Minha Grade de Aulas",
			blocos,
			agendamentos: [...agendamentosSala, ...agendamentosEquipamento],
			carregandoBlocos,
			carregandoAgendamentos,
			erro,
			usuarioId: professor_id,
			cargo: usuario?.cargo || "",
			onSair: () => goto("/main"),
			onDeletar: deletar,
			onConfirmar: confirmar,
			onSalvarPerfil: salvarPerfil
		});
		$$renderer.push(`<!---->`);
	});
}
//#endregion
export { _page as default };
