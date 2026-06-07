<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import AgendamentoCard from "$lib/components/agendamento/AgendamentoCard.svelte";
    import { carregarSalas } from "$lib/services/SalaServices/List_Sala_Service.js";
    import { cadastrarAgendamento } from "$lib/services/AgendamentoServices/AgendamentoSala/Create_Agendamento_Sala_Service.js";
    import { carregarAgendamentosSalas } from "$lib/services/AgendamentoServices/AgendamentoSala/List_Agendamento_Sala_Service.js";

    let token = "";

    // ── Sala selecionada ──
    let sala_id = null;
    let salas = [];

    // ── Form state ──
    let dataAgendamento = hoje();
    let horaInicio = "08:00";
    let horaFim = "10:00";
    let obs = "";

    // ── Agendamentos do calendário ──
    let agendamentos = [];
    let carregandoLista = false;

    // ── UI state ──
    let carregando = false;
    let erro = "";
    let sucesso = "";

    onMount(async () => {
        token = localStorage.getItem("token") || "";
        if (!token) {
            goto("/login");
            return;
        }
        await carregarListaSalas();
    });

    // Reage à mudança de sala
    $: if (sala_id) {
        carregarAgendamentos(sala_id);
    } else {
        agendamentos = [];
    }

    async function carregarListaSalas() {
        try {
            salas = await carregarSalas(token);
        } catch (e) {
            erro = e?.message || "Erro ao carregar salas.";
        }
    }

    async function carregarAgendamentos(id) {
        carregandoLista = true;
        erro = "";
        try {
            agendamentos = await carregarAgendamentosSalas(token, id);
        } catch (e) {
            erro = e?.message || "Erro ao carregar agendamentos.";
        } finally {
            carregandoLista = false;
        }
    }

    async function salvarAgendamento() {
        erro = "";
        sucesso = "";

        if (!sala_id) {
            erro = "Selecione uma sala.";
            return;
        }
        if (!dataAgendamento || !horaInicio || !horaFim) {
            erro = "Preencha a data e os horários.";
            return;
        }
        if (horaInicio >= horaFim) {
            erro = "A hora de início deve ser anterior à hora de fim.";
            return;
        }

        carregando = true;
        try {
            await cadastrarAgendamento(
                {
                    sala_id,
                    data_hora_inicio: `${dataAgendamento}T${horaInicio}`,
                    data_hora_fim: `${dataAgendamento}T${horaFim}`,
                    obs,
                },
                token,
            );
            sucesso = "Agendamento realizado com sucesso.";
            resetForm();
            await carregarAgendamentos(sala_id);
        } catch (e) {
            erro = e?.message || "Erro ao realizar agendamento.";
        } finally {
            carregando = false;
        }
    }

    function resetForm() {
        dataAgendamento = hoje();
        horaInicio = "08:00";
        horaFim = "10:00";
        obs = "";
    }

    function hoje() {
        return new Date().toISOString().slice(0, 10);
    }
</script>

<AgendamentoCard
    {salas}
    bind:sala_id
    {agendamentos}
    {carregandoLista}
    {carregando}
    {erro}
    {sucesso}
    bind:dataAgendamento
    bind:horaInicio
    bind:horaFim
    bind:obs
    hojeStr={hoje()}
    onSubmit={salvarAgendamento}
    onLimpar={resetForm}
    onSair={() => goto("/main")}
/>
