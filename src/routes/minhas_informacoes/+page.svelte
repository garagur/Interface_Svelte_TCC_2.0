<script>
    //+page de minhas informações, que mostra os dados do usuário logado, sua grade de aulas e seus agendamentos
    import { onMount, tick } from "svelte";
    import { goto } from "$app/navigation";
    import MinhasInformacoesCard from "$lib/components/minhas_informacoes/MinhasInformacoesCard.svelte";
    import { carregarHorariosProfessor } from "$lib/services/HorarioServices/List_Horario_Service.js";
    import { carregarAgendamentosSalas } from "$lib/services/AgendamentoServices/AgendamentoSala/List_Agendamento_Sala_Service.js";
    import { deletarAgendamentoSala } from "$lib/services/AgendamentoServices/AgendamentoSala/Deleted_Agendamento_Sala_Service.js";
    import { carregarAgendamentosEquipamentos } from "$lib/services/AgendamentoServices/AgendamentoEquipamento/List_Agendamento_Equipamento_Service.js";
    import { deletarAgendamentoEquipamento } from "$lib/services/AgendamentoServices/AgendamentoEquipamento/Deleted_Agendamento_equipamento.js";
    import { buscarUsuario } from "$lib/services/UserServices/Buscar_Usuario_Service.js";
    import { atualizarUsuario } from "$lib/services/UserServices/Update_User_Service.js";
    let token = "";
    let professor_id = "";

    let usuario = null;
    let carregandoUsuario = false;

    let blocos = [];
    let agendamentosSala = [];
    let agendamentosEquipamento = [];

    let carregandoBlocos = false;
    let carregandoAgendamentos = false;
    let carregandoEstatisticas = false;
    let erro = "";

    let estatisticas = {
        totalSala: 0,
        totalEquipamento: 0,
        salaMaisAgendada: null,
        equipamentoMaisAgendado: null,
        heatmap: [],
    };

    onMount(async () => {
        token = localStorage.getItem("token") || "";
        professor_id = localStorage.getItem("user_id") || "";

        if (!token) {
            goto("/login");
            return;
        }

        await Promise.all([
            carregarPerfil(),
            carregarGrade(),
            carregarMeusAgendamentos(),
        ]);

        montarEstatisticas();
        await tick();

        const hash = window.location.hash.slice(1);
        if (hash) {
            requestAnimationFrame(() => {
                document.getElementById(hash)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            });
        }
    });

    async function carregarPerfil() {
        carregandoUsuario = true;
        try {
            usuario = await buscarUsuario(token, professor_id);
        } catch (e) {
            erro = e?.message || "Erro ao carregar dados do usuário.";
        } finally {
            carregandoUsuario = false;
        }
    }
    async function salvarPerfil({ nome, email, foto, removerFoto }) {
        const resposta = await atualizarUsuario(
            Number(professor_id),
            { nome, email, foto, removerFoto },
            token,
        );
        if (!resposta) return; // sessão expirada: o apiFetch já redirecionou

        const atualizado =
            resposta?.user ||
            resposta?.data?.user ||
            resposta?.data ||
            resposta;
        if (!atualizado) throw new Error("Resposta inesperada do servidor.");

        usuario = {
            ...usuario,
            nome: atualizado.name || atualizado.nome || usuario?.nome || "",
            email: atualizado.email || usuario?.email || "",
            foto_url:
                atualizado.foto_url ??
                atualizado.avatar_url ??
                atualizado.foto ??
                null,
        };

        // mantém o usuário guardado no localStorage em dia (ex.: cabeçalho)
        try {
            const salvo = JSON.parse(localStorage.getItem("user") || "null");
            if (salvo) {
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        ...salvo,
                        name: atualizado.name || atualizado.nome || salvo.name,
                        email: atualizado.email,
                        foto_url:
                            atualizado.foto_url ??
                            atualizado.avatar_url ??
                            atualizado.foto ??
                            null,
                    }),
                );
            }
        } catch {
            // localStorage inválido: ignora
        }
    }
    async function carregarGrade() {
        carregandoBlocos = true;
        try {
            blocos = await carregarHorariosProfessor(token, professor_id);
        } catch (e) {
            erro = e?.message || "Erro ao carregar grade de aulas.";
        } finally {
            carregandoBlocos = false;
        }
    }

    async function carregarMeusAgendamentos() {
        carregandoAgendamentos = true;
        carregandoEstatisticas = true;
        try {
            const [todasSalas, todosEquipamentos] = await Promise.all([
                carregarAgendamentosSalas(token, null),
                carregarAgendamentosEquipamentos(token),
            ]);

            agendamentosSala = todasSalas
                .filter((ag) => String(ag.user_id) === String(professor_id))
                .map((ag) => ({ ...ag, tipo: "sala" }));
            agendamentosEquipamento = todosEquipamentos
                .filter((ag) => String(ag.user_id) === String(professor_id))
                .map((ag) => ({ ...ag, tipo: "equipamento" }));
        } catch (e) {
            erro = e?.message || "Erro ao carregar agendamentos.";
        } finally {
            carregandoAgendamentos = false;
        }
    }

    function itemMaisFrequente(lista, campoNome, campoId) {
        const contagem = new Map();
        for (const item of lista) {
            const chave = item[campoNome] || item[campoId] || "Não informado";
            contagem.set(chave, (contagem.get(chave) || 0) + 1);
        }
        let maisFrequente = null;
        let maiorQtd = 0;
        for (const [chave, qtd] of contagem) {
            if (qtd > maiorQtd) {
                maiorQtd = qtd;
                maisFrequente = chave;
            }
        }
        return maisFrequente;
    }

    function montarHeatmap(todos) {
        const contagemPorDia = new Map();
        for (const ag of todos) {
            if (!ag.data_hora_inicio) continue;
            const chave = new Date(ag.data_hora_inicio)
                .toISOString()
                .slice(0, 10);
            contagemPorDia.set(chave, (contagemPorDia.get(chave) || 0) + 1);
        }
        return Array.from(contagemPorDia.entries()).map(
            ([data, quantidade]) => ({
                data,
                quantidade,
            }),
        );
    }

    function montarEstatisticas() {
        // Estatísticas consideram só agendamentos ativos (não cancelados),
        // senão um cancelamento não mudaria os números até dar F5.
        const salasAtivas = agendamentosSala.filter(
            (a) => a.status !== "inativo",
        );
        const equipamentosAtivos = agendamentosEquipamento.filter(
            (a) => a.status !== "inativo",
        );
        const todos = [...salasAtivas, ...equipamentosAtivos];

        estatisticas = {
            totalSala: salasAtivas.length,
            totalEquipamento: equipamentosAtivos.length,
            salaMaisAgendada: itemMaisFrequente(
                salasAtivas,
                "sala_nome",
                "sala_id",
            ),
            equipamentoMaisAgendado: itemMaisFrequente(
                equipamentosAtivos,
                "equipamento_nome",
                "equipamento_id",
            ),
            heatmap: montarHeatmap(todos),
        };
        carregandoEstatisticas = false;
    }

    async function deletar(ag) {
        try {
            if (ag.tipo === "equipamento") {
                await deletarAgendamentoEquipamento(
                    ag.id,
                    token,
                    ag.justificativa || "",
                );
            } else {
                await deletarAgendamentoSala(
                    ag.id,
                    token,
                    ag.justificativa || "",
                );
            }

            // Atualiza o status do item em vez de removê-lo da lista,
            // já que "Meus Agendamentos" também exibe cancelados.
            if (ag.tipo === "equipamento") {
                agendamentosEquipamento = agendamentosEquipamento.map((a) =>
                    a.id === ag.id
                        ? {
                              ...a,
                              status: "inativo",
                              justificativa: ag.justificativa || "",
                          }
                        : a,
                );
            } else {
                agendamentosSala = agendamentosSala.map((a) =>
                    a.id === ag.id
                        ? {
                              ...a,
                              status: "inativo",
                              justificativa: ag.justificativa || "",
                          }
                        : a,
                );
            }

            montarEstatisticas();
        } catch (e) {
            erro = e?.message || "Erro ao deletar agendamento.";
            throw e; // repropaga para o MinhasInformacoesCard saber que falhou
        }
    }
</script>

<MinhasInformacoesCard
    {usuario}
    {carregandoUsuario}
    {estatisticas}
    {carregandoEstatisticas}
    {blocos}
    agendamentos={[...agendamentosSala, ...agendamentosEquipamento]}
    {carregandoBlocos}
    {carregandoAgendamentos}
    {erro}
    onSair={() => goto("/main")}
    onDeletar={deletar}
    onSalvarPerfil={salvarPerfil}
/>
