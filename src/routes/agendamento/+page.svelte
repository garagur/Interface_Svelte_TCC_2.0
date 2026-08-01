<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import AgendamentoCard from "$lib/components/agendamento/AgendamentoCard.svelte";
    import { carregarSalas } from "$lib/services/SalaServices/List_Sala_Service.js";
    import { cadastrarAgendamento } from "$lib/services/AgendamentoServices/AgendamentoSala/Create_Agendamento_Sala_Service.js";
    import { carregarAgendamentosSalas } from "$lib/services/AgendamentoServices/AgendamentoSala/List_Agendamento_Sala_Service.js";
    import { carregarHorariosSala } from "$lib/services/HorarioServices/List_Horario_Service.js";
    import { validarRecorrencia } from "$lib/services/RecorrenciaService/Validar_Recorrencia.js";
    import { gerarDatasRecorrentes } from "$lib/services/RecorrenciaService/Gerar_Datas_Recorrentes.js";
    import { executarLoteAgendamentos } from "$lib/services/RecorrenciaService/Executar_Lote_Agendamentos.js";

    let token = "";

    // ── Sala selecionada ──
    let sala_id = null;
    let salas = [];

    // ── Form state ──
    /** @type {'avulso' | 'semanal' | 'quinzenal'} */
    let tipo = "avulso"; // 'avulso' | 'semanal' | 'quinzenal'
    let diasSemana = [];
    let dataAgendamento = hoje();
    let horaInicio = "08:00";
    let horaFim = "10:00";
    let obs = "";

    // ── Agendamentos do calendário ──
    let agendamentos = [];
    let carregandoLista = false;

    // ── Aulas fixas (grade semanal) ──
    let blocosFixos = [];
    let carregandoBlocos = false;

    // ── UI state ──
    let carregando = false;
    let erro = "";
    let sucesso = "";

    // ── Recorrência: confirmação em lote ──
    let ocorrenciasPendentes = null;
    let enviando = false;
    let progresso = { atual: 0, total: 0 };
    let resultadoFinal = null;

    onMount(async () => {
        token = localStorage.getItem("token") || "";
        if (!token) {
            goto("/login");
            return;
        }
        await carregarListaSalas();
    });

    $: if (sala_id) {
        carregarAgendamentos(sala_id);
        carregarBlocosFixos(sala_id);
    } else {
        agendamentos = [];
        blocosFixos = [];
    }

    async function carregarListaSalas() {
        try {
            const todas = await carregarSalas(token);
            salas = todas.filter((s) => s.status !== false);
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

    async function carregarBlocosFixos(id) {
        carregandoBlocos = true;
        try {
            blocosFixos = await carregarHorariosSala(token, id);
        } catch (e) {
            erro = e?.message || "Erro ao carregar aulas fixas.";
        } finally {
            carregandoBlocos = false;
        }
    }

    async function salvarAgendamento() {
        erro = "";
        sucesso = "";
        resultadoFinal = null;

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

        if (tipo === "avulso") {
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
            return;
        }

        // ── Semanal / Quinzenal ──
        const erroValidacao = validarRecorrencia({
            tipo,
            diasSemana,
            dataInicio: dataAgendamento,
            horaInicio,
            horaFim,
        });
        if (erroValidacao) {
            erro = erroValidacao;
            return;
        }

        const datasGeradas = gerarDatasRecorrentes({
            diasSemana,
            dataInicio: dataAgendamento,
            horaInicio,
            horaFim,
            recorrencia: /** @type {'semanal'|'quinzenal'} */ (tipo),
        });

        if (datasGeradas.length === 0) {
            erro =
                "Nenhuma data corresponde aos dias da semana selecionados nesse período.";
            return;
        }

        ocorrenciasPendentes = datasGeradas.map((d) => ({
            data: d.data,
            payload: {
                sala_id,
                data_hora_inicio: d.data_hora_inicio,
                data_hora_fim: d.data_hora_fim,
                obs,
            },
        }));
    }

    async function confirmarRecorrencia() {
        if (!ocorrenciasPendentes) return;

        enviando = true;
        progresso = { atual: 0, total: ocorrenciasPendentes.length };

        resultadoFinal = await executarLoteAgendamentos(
            ocorrenciasPendentes,
            cadastrarAgendamento,
            token,
            (p) => (progresso = p),
        );

        enviando = false;
        ocorrenciasPendentes = null;
        resetForm();
        await carregarAgendamentos(sala_id);
    }

    function cancelarRecorrencia() {
        ocorrenciasPendentes = null;
    }

    function resetForm() {
        tipo = "avulso";
        diasSemana = [];
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
    {blocosFixos}
    {carregandoLista}
    {carregandoBlocos}
    {carregando}
    {erro}
    {sucesso}
    bind:tipo
    bind:diasSemana
    bind:dataAgendamento
    bind:horaInicio
    bind:horaFim
    bind:obs
    hojeStr={hoje()}
    onSubmit={salvarAgendamento}
    onLimpar={resetForm}
    onSair={() => goto("/main")}
    {ocorrenciasPendentes}
    {enviando}
    {progresso}
    {resultadoFinal}
    onConfirmarRecorrencia={confirmarRecorrencia}
    onCancelarRecorrencia={cancelarRecorrencia}
/>
