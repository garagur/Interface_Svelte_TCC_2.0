<script>
    // Página de agendamento
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import AgendamentoCard from "$lib/components/agendamento/AgendamentoCard.svelte";

    // ── Imports de Salas ──
    import { carregarSalas } from "$lib/services/SalaServices/List_Sala_Service.js";
    import { cadastrarAgendamento as cadastrarAgendamentoSala } from "$lib/services/AgendamentoServices/AgendamentoSala/Create_Agendamento_Sala_Service.js";
    import { carregarAgendamentosSalas } from "$lib/services/AgendamentoServices/AgendamentoSala/List_Agendamento_Sala_Service.js";
    import { carregarHorariosSala } from "$lib/services/HorarioServices/List_Horario_Service.js";

    // ── Imports de Equipamentos ──
    // IMPORTANTE: Ajuste o caminho do carregarEquipamentos conforme seu projeto
    import { carregarEquipamentos } from "$lib/services/EquipamentoServices/List_Equipamento_Service.js";
    import { cadastrarAgendamento as cadastrarAgendamentoEquipamento } from "$lib/services/AgendamentoServices/AgendamentoEquipamento/Create_Agendamento_Equipamento_Service.js";
    import { carregarAgendamentosEquipamentos } from "$lib/services/AgendamentoServices/AgendamentoEquipamento/List_Agendamento_Equipamento_Service.js";

    // ── Imports de Recorrência ──
    import { validarRecorrencia } from "$lib/services/RecorrenciaService/Validar_Recorrencia.js";
    import { gerarDatasRecorrentes } from "$lib/services/RecorrenciaService/Gerar_Datas_Recorrentes.js";
    import { executarLoteAgendamentos } from "$lib/services/RecorrenciaService/Executar_Lote_Agendamentos.js";

    let token = "";

    // ── Controle de Seleção (Modo) ──
    let modo = "sala"; // Pode ser 'sala' ou 'equipamento'

    // Listas originais carregadas da API
    let salas = [];
    let equipamentos = [];

    // Variáveis dinâmicas que alimentam o card
    let itensDisponiveis = [];
    let itemSelecionadoId = null;

    // ── Form state ──
    /** @type {'avulso' | 'semanal' | 'quinzenal'} */
    let tipo = "avulso";
    let diasSemana = [];
    let dataAgendamento = hoje();
    let horaInicio = "08:00";
    let horaFim = "10:00";
    let obs = "";

    // ── Agendamentos e Grade ──
    let agendamentos = [];
    let carregandoLista = false;
    let blocosFixos = [];
    let carregandoBlocos = false;

    // ── UI state ──
    let carregando = false;
    let erro = "";
    let sucesso = "";

    // ── Recorrência ──
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
        await carregarListasIniciais();
    });

    // Atualiza a lista exibida no Select sempre que o modo mudar
    $: if (modo === "sala") {
        itensDisponiveis = salas;
    } else {
        itensDisponiveis = equipamentos;
    }

    // Dispara as buscas quando um item do select for escolhido ou quando o modo trocar e resetar o ID
    $: if (itemSelecionadoId) {
        carregarAgendamentos(itemSelecionadoId);
        if (modo === "sala") {
            carregarBlocosFixos(itemSelecionadoId);
        } else {
            blocosFixos = []; // Equipamentos geralmente não possuem grade fixa
        }
    } else {
        agendamentos = [];
        blocosFixos = [];
    }

    async function carregarListasIniciais() {
        try {
            // Carrega salas e equipamentos simultaneamente (se não houver carregarEquipamentos ainda, comente as linhas)
            const [resSalas, resEquip] = await Promise.all([
                carregarSalas(token).catch(() => []),
                carregarEquipamentos(token).catch(() => []),
            ]);
            salas = resSalas.filter((s) => s.status !== false);
            equipamentos = resEquip.filter((e) => e.status !== false);
        } catch (e) {
            erro = "Erro ao carregar dados iniciais.";
        }
    }
    async function carregarAgendamentos(id) {
        carregandoLista = true;
        erro = "";
        try {
            if (modo === "sala") {
                agendamentos = (await carregarAgendamentosSalas(token, id))
                    .filter((agendamento) => agendamento.status !== "inativo")
                    .map((agendamento) => ({ ...agendamento, tipo: "sala" }));
            } else {
                // O endpoint de equipamentos retorna todos. Precisamos filtrar pelo selecionado no front:
                const todos = await carregarAgendamentosEquipamentos(token);
                agendamentos = todos
                    .filter(
                        (agendamento) =>
                            agendamento.equipamento_id === id &&
                            agendamento.status !== "inativo",
                    )
                    .map((agendamento) => ({
                        ...agendamento,
                        tipo: "equipamento",
                    }));
            }
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

        if (!itemSelecionadoId) {
            erro = `Selecione um${modo === "sala" ? "a sala" : " equipamento"}.`;
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

        // Define a chave correta para o objeto JSON de acordo com o modo escolhido
        const payloadBase = {
            data_hora_inicio: `${dataAgendamento}T${horaInicio}`,
            data_hora_fim: `${dataAgendamento}T${horaFim}`,
            obs,
        };

        if (modo === "sala") {
            payloadBase.sala_id = itemSelecionadoId;
        } else {
            payloadBase.equipamento_id = itemSelecionadoId;
        }

        // Define o serviço dinâmico a ser chamado
        const serviceCadastrar =
            modo === "sala"
                ? cadastrarAgendamentoSala
                : cadastrarAgendamentoEquipamento;

        if (tipo === "avulso") {
            carregando = true;
            try {
                await serviceCadastrar(payloadBase, token);
                sucesso = "Agendamento realizado com sucesso.";
                resetForm();
                await carregarAgendamentos(itemSelecionadoId);
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
                ...payloadBase,
                data_hora_inicio: d.data_hora_inicio,
                data_hora_fim: d.data_hora_fim,
            },
        }));
    }

    async function confirmarRecorrencia() {
        if (!ocorrenciasPendentes) return;

        enviando = true;
        progresso = { atual: 0, total: ocorrenciasPendentes.length };

        const serviceCadastrar =
            modo === "sala"
                ? cadastrarAgendamentoSala
                : cadastrarAgendamentoEquipamento;

        resultadoFinal = await executarLoteAgendamentos(
            ocorrenciasPendentes,
            serviceCadastrar, // Passa o serviço correspondente
            token,
            (p) => (progresso = p),
        );

        enviando = false;
        ocorrenciasPendentes = null;
        resetForm();
        await carregarAgendamentos(itemSelecionadoId);
    }

    function cancelarRecorrencia() {
        ocorrenciasPendentes = null;
        resultadoFinal = null;
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
    bind:modo
    salas={itensDisponiveis}
    bind:sala_id={itemSelecionadoId}
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
