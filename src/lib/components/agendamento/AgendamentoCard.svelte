<script>
    //AgendamentoCard
    import GradeSemanal from "$lib/components/Grades/GradeSemanal.svelte";
    import BlocoCard from "$lib/components/Card/BlocoHorarioCard.svelte";
    import CalendarioAgendamentos from "$lib/components/Grades/GradeMensal.svelte";
    import AgendamentoBloco from "$lib/components/Card/BlocoAgendamentoCard.svelte";
    import ConfirmarDelecaoModal from "$lib/components/Card/ConfirmarDelecaoModal.svelte";
    import ConfirmarRecorrenciaModal from "$lib/components/Card/ConfirmarRecorrenciaModal.svelte";
    import ListaAgendamentosCard from "$lib/components/Card/ListaAgendamentosCard.svelte";
    import { deletarAgendamentoSala } from "$lib/services/AgendamentoServices/AgendamentoSala/Deleted_Agendamento_Sala_Service.js";
    import { deletarAgendamentoEquipamento } from "$lib/services/AgendamentoServices/AgendamentoEquipamento/Deleted_Agendamento_equipamento.js";

    import { onMount } from "svelte";
    export let modo = "sala";
    export let salas = [];
    export let sala_id = null;
    export let agendamentos = [];
    export let blocosFixos = [];
    export let carregandoLista = false;
    export let carregandoBlocos = false;
    export let carregando = false;
    export let erro = "";
    export let sucesso = "";
    export let tipo = "avulso";
    export let diasSemana = [];
    export let dataAgendamento = "";
    export let horaInicio = "";
    export let horaFim = "";
    export let obs = "";
    export let hojeStr = "";
    export let onSubmit;
    export let onLimpar;
    export let onSair;

    export let ocorrenciasPendentes = null;
    export let enviando = false;
    export let progresso = { atual: 0, total: 0 };
    export let resultadoFinal = null;
    export let onConfirmarRecorrencia;
    export let onCancelarRecorrencia;

    let token = "";
    let cargo = null;
    let usuarioId = null;
    const dias = [
        "segunda",
        "terca",
        "quarta",
        "quinta",
        "sexta",
        "sabado",
        "domingo",
    ];

    const diasSemanaOpcoes = [
        { key: "dom", label: "Dom" },
        { key: "seg", label: "Seg" },
        { key: "ter", label: "Ter" },
        { key: "qua", label: "Qua" },
        { key: "qui", label: "Qui" },
        { key: "sex", label: "Sex" },
        { key: "sab", label: "Sab" },
    ];

    let agendamentoParaDeletar = null;
    let cancelandoId = null; // ex: "sala-12" ou "equipamento-7" — null quando nada está em andamento
    let visao = "calendario";

    function trocarVisao(novaVisao) {
        visao = novaVisao;
    }

    $: agendamentosVisiveis = agendamentos.filter(
        (a) => a.status !== "inativo",
    );

    function abrirModalDeletar(ag) {
        if (cancelandoId) return; // já tem um cancelamento em andamento, ignora
        agendamentoParaDeletar = ag;
    }

    function fecharModalDeletar() {
        if (cancelandoId) return; // não deixa fechar no meio da requisição
        agendamentoParaDeletar = null;
    }

    async function confirmarDeletar(ag) {
        cancelandoId = `${ag.tipo}-${ag.id}`;
        erro = "";
        try {
            if (ag.tipo === "sala") {
                await deletarAgendamentoSala(
                    ag.id,
                    token,
                    ag.justificativa || "",
                );
            } else if (ag.tipo === "equipamento") {
                await deletarAgendamentoEquipamento(
                    ag.id,
                    token,
                    ag.justificativa || "",
                );
            }
            agendamentos = agendamentos.filter(
                (a) => a.id !== ag.id || a.tipo !== ag.tipo,
            );
            agendamentoParaDeletar = null;
        } catch (e) {
            erro = e?.message || "Erro ao deletar agendamento.";
        } finally {
            cancelandoId = null;
        }
    }

    function toggleDia(dia) {
        if (diasSemana.includes(dia)) {
            diasSemana = diasSemana.filter((d) => d !== dia);
        } else {
            diasSemana = [...diasSemana, dia];
        }
    }

    function selecionarTipo(novoTipo) {
        tipo = novoTipo;
        if (novoTipo === "avulso") {
            diasSemana = [];
        }
    }

    onMount(() => {
        token = localStorage.getItem("token") || "";
        usuarioId = localStorage.getItem("user_id");
        cargo = localStorage.getItem("cargo");
    });
</script>

<div class="escopo-agendamento">
    <ConfirmarDelecaoModal
        agendamento={agendamentoParaDeletar}
        onConfirmar={confirmarDeletar}
        onCancelar={fecharModalDeletar}
        processando={!!cancelandoId}
    />

    <ConfirmarRecorrenciaModal
        ocorrencias={ocorrenciasPendentes}
        {enviando}
        {progresso}
        {resultadoFinal}
        {horaInicio}
        {horaFim}
        onConfirmar={onConfirmarRecorrencia}
        onCancelar={onCancelarRecorrencia}
    />

    <div class="scaffold">
        <header class="app-bar">
            <div class="title-section">
                <h1>Portal de Agendamento</h1>
                <span>Novo Agendamento</span>
            </div>
            <button class="btn-icon" on:click={onSair} title="Voltar">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
        </header>

        <main class="body-content">
            <div class="toggle-container"></div>

            <slot name="botoes-topo" />
            <div class="card sala-select-card">
                <select id="sala-select" bind:value={sala_id}>
                    <option value={null}
                        >Selecione {modo === "sala"
                            ? "uma sala"
                            : "um equipamento"}</option
                    >
                    {#each salas as s}
                        <option value={s.id}>{s.nome}</option>
                    {/each}
                </select>
                <button
                    type="button"
                    class="toggle-btn {modo === 'sala' ? 'active' : ''}"
                    on:click={() => {
                        modo = "sala";
                        sala_id = null;
                        if (onLimpar) onLimpar();
                    }}
                >
                    <span class="material-symbols-outlined">meeting_room</span>
                    Salas
                </button>
                <button
                    type="button"
                    class="toggle-btn {modo === 'equipamento' ? 'active' : ''}"
                    on:click={() => {
                        modo = "equipamento";
                        sala_id = null;
                        if (onLimpar) onLimpar();
                    }}
                >
                    <span class="material-symbols-outlined">devices</span>
                    Equipamentos
                </button>
            </div>
            {#if sala_id && modo === "sala"}
                <div class="card grade-card">
                    <div class="grade-header-title">
                        <div class="title-left">
                            <span
                                class="material-symbols-outlined text-primary"
                            >
                                event_repeat
                            </span>
                            <h3>Aulas Fixas — Grade Semanal</h3>
                        </div>
                    </div>

                    <GradeSemanal
                        {dias}
                        blocos={blocosFixos}
                        carregandoLista={carregandoBlocos}
                        filtrarPor={{ campo: "sala_id", valor: sala_id }}
                    >
                        <svelte:fragment let:bloco>
                            <BlocoCard {bloco} mostrarTurma={true} />
                        </svelte:fragment>
                    </GradeSemanal>
                </div>
            {/if}

            <div class="conteudo-principal">
                <div class="card calendario-card">
                    <div class="grade-header-title">
                        <div class="title-left">
                            <span class="material-symbols-outlined text-primary"
                                >calendar_month</span
                            >
                            <h3>Agendamentos — próximos 60 dias</h3>
                        </div>

                        <div
                            class="toggle-visao"
                            role="group"
                            aria-label="Modo de visualização"
                        >
                            <button
                                type="button"
                                class:ativo={visao === "calendario"}
                                on:click={() => trocarVisao("calendario")}
                                title="Calendário"
                            >
                                <span class="material-symbols-outlined"
                                    >calendar_view_month</span
                                >
                            </button>
                            <button
                                type="button"
                                class:ativo={visao === "lista"}
                                on:click={() => trocarVisao("lista")}
                                title="Lista"
                            >
                                <span class="material-symbols-outlined"
                                    >view_list</span
                                >
                            </button>
                        </div>

                        <span class="badge">
                            {agendamentosVisiveis.length}
                            {agendamentosVisiveis.length === 1
                                ? "registro"
                                : "registros"}
                        </span>
                    </div>
                    {#if !sala_id}
                        <p class="estado-vazio">
                            Selecione uma sala para ver os agendamentos.
                        </p>
                    {:else if visao === "calendario"}
                        <CalendarioAgendamentos
                            agendamentos={agendamentosVisiveis}
                            {hojeStr}
                            {carregandoLista}
                        >
                            <svelte:fragment let:ag>
                                <AgendamentoBloco
                                    {ag}
                                    {usuarioId}
                                    {cargo}
                                    onDeletar={abrirModalDeletar}
                                />
                            </svelte:fragment>
                        </CalendarioAgendamentos>
                    {:else}
                        <ListaAgendamentosCard
                            agendamentos={agendamentosVisiveis}
                            carregando={carregandoLista}
                            {usuarioId}
                            {cargo}
                            onDeletar={abrirModalDeletar}
                            embutido
                            recursoUnico
                        />
                    {/if}
                </div>

                <div class="card form-card">
                    <div class="card-header">
                        <span class="material-symbols-outlined icon-large">
                            calendar_add_on
                        </span>
                    </div>

                    <div class="tabs-recorrencia">
                        <button
                            type="button"
                            class="tab-btn {tipo === 'avulso' ? 'ativo' : ''}"
                            on:click={() => selecionarTipo("avulso")}
                        >
                            Avulso
                        </button>
                        <button
                            type="button"
                            class="tab-btn {tipo === 'semanal' ? 'ativo' : ''}"
                            on:click={() => selecionarTipo("semanal")}
                        >
                            Semanal
                        </button>
                        <button
                            type="button"
                            class="tab-btn {tipo === 'quinzenal'
                                ? 'ativo'
                                : ''}"
                            on:click={() => selecionarTipo("quinzenal")}
                        >
                            Quinzenal
                        </button>
                    </div>

                    <form on:submit|preventDefault={onSubmit}>
                        <div class="form-fields">
                            <div class="field">
                                <label for="data-agendamento">
                                    {tipo === "avulso"
                                        ? "Data"
                                        : "Data de início"}
                                </label>
                                <input
                                    id="data-agendamento"
                                    type="date"
                                    bind:value={dataAgendamento}
                                    min={hojeStr}
                                    required
                                />
                            </div>
                            <div class="field">
                                <label for="hora-inicio">Hora de Início</label>
                                <input
                                    id="hora-inicio"
                                    type="time"
                                    bind:value={horaInicio}
                                    required
                                />
                            </div>
                            <div class="field">
                                <label for="hora-fim">Hora de Fim</label>
                                <input
                                    id="hora-fim"
                                    type="time"
                                    bind:value={horaFim}
                                    required
                                />
                            </div>
                            <div class="field">
                                <label for="obs">Observação</label>
                                <input
                                    id="obs"
                                    type="text"
                                    bind:value={obs}
                                    placeholder="Ex: Aula de reposição"
                                />
                            </div>
                        </div>

                        {#if tipo !== "avulso"}
                            <div class="field dias-semana-field">
                                <div class="dias-semana-label">
                                    Dias da semana
                                </div>
                                <div
                                    class="dias-semana"
                                    role="group"
                                    aria-label="Dias da semana"
                                >
                                    {#each diasSemanaOpcoes as d}
                                        <button
                                            type="button"
                                            class="dia-btn {diasSemana.includes(
                                                d.key,
                                            )
                                                ? 'ativo'
                                                : ''}"
                                            on:click={() => toggleDia(d.key)}
                                        >
                                            {d.label}
                                        </button>
                                    {/each}
                                </div>
                            </div>

                            <p class="aviso-recorrencia">
                                <span class="material-symbols-outlined"
                                    >info</span
                                >
                                {tipo === "semanal"
                                    ? "Cobre 7 dias a partir da data escolhida."
                                    : "Cobre 14 dias a partir da data escolhida."}
                                Início só a partir de amanhã.
                            </p>
                        {/if}

                        {#if erro}<p class="msg-erro">{erro}</p>{/if}
                        {#if sucesso}<p class="msg-sucesso">{sucesso}</p>{/if}

                        <div class="bottom-action">
                            <button
                                type="button"
                                class="btn-secondary"
                                on:click={onLimpar}
                            >
                                <span class="material-symbols-outlined"
                                    >restart_alt</span
                                >
                                Limpar
                            </button>
                            <button
                                type="submit"
                                class="btn-primary"
                                disabled={carregando || !sala_id}
                            >
                                <span class="material-symbols-outlined"
                                    >save</span
                                >
                                {carregando
                                    ? "Salvando..."
                                    : tipo === "avulso"
                                      ? "Confirmar"
                                      : "Revisar Agendamentos"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    </div>
</div>
