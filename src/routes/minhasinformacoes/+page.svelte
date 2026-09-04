<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import MinhasInformacoesCard from "$lib/components/meusagendamentos/MinhasInformacoesCard.svelte";
    import { carregarHorariosProfessor } from "$lib/services/HorarioServices/List_Horario_Service.js";
    import { carregarAgendamentosSalas } from "$lib/services/AgendamentoServices/AgendamentoSala/List_Agendamento_Sala_Service.js";
    import { deletarAgendamentoSala } from "$lib/services/AgendamentoServices/AgendamentoSala/Deleted_Agendamento_Sala_Service.js";
    import { carregarAgendamentosEquipamentos } from "$lib/services/AgendamentoServices/AgendamentoEquipamento/List_Agendamento_Equipamento_Service.js";
    import { deletarAgendamentoEquipamento } from "$lib/services/AgendamentoServices/AgendamentoEquipamento/Deleted_Agendamento_equipamento.js";
    import { buscarUsuario } from "$lib/services/UserServices/Buscar_Usuario_Service.js";

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

            agendamentosSala = todasSalas.filter(
                (ag) => String(ag.user_id) === String(professor_id),
            );
            agendamentosEquipamento = todosEquipamentos.filter(
                (ag) => String(ag.user_id) === String(professor_id),
            );
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
        const todos = [...agendamentosSala, ...agendamentosEquipamento];

        estatisticas = {
            totalSala: agendamentosSala.length,
            totalEquipamento: agendamentosEquipamento.length,
            salaMaisAgendada: itemMaisFrequente(
                agendamentosSala,
                "sala_nome",
                "sala_id",
            ),
            equipamentoMaisAgendado: itemMaisFrequente(
                agendamentosEquipamento,
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
            if (ag.tipo === "equipamento") {
                agendamentosEquipamento = agendamentosEquipamento.filter(
                    (a) => a.id !== ag.id,
                );
            } else {
                agendamentosSala = agendamentosSala.filter(
                    (a) => a.id !== ag.id,
                );
            }
            montarEstatisticas();
        } catch (e) {
            erro = e?.message || "Erro ao deletar agendamento.";
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
/>
