<script>
    import GradeSemanal from "$lib/components/SemanalGrade/GradeSemanal.svelte";
    import BlocoCard from "$lib/components/Card/BlocoHorarioCard.svelte";
    import CalendarioAgendamentos from "$lib/components/MesGrade/GradeMensal.svelte";
    import AgendamentoBloco from "$lib/components/Card/BlocoAgendamentoCard.svelte";
    import ConfirmarDelecaoModal from "$lib/components/Card/ConfirmarDelecaoModal.svelte";
    import ConfirmarRecorrenciaModal from "$lib/components/Card/ConfirmarRecorrenciaModal.svelte";
    import { deletarAgendamentoSala } from "$lib/services/AgendamentoServices/AgendamentoSala/Deleted_Agendamento_Sala_Service.js";

    import { onMount } from "svelte";
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

    function abrirModalDeletar(ag) {
        agendamentoParaDeletar = ag;
    }

    function fecharModalDeletar() {
        agendamentoParaDeletar = null;
    }

    async function confirmarDeletar(ag) {
        fecharModalDeletar();
        try {
            if (ag.tipo === "sala") {
                await deletarAgendamentoSala(ag.id, token);
            }
            agendamentos = agendamentos.filter(
                (a) => a.id !== ag.id || a.tipo !== ag.tipo,
            );
        } catch (e) {
            erro = e?.message || "Erro ao deletar agendamento.";
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

<ConfirmarDelecaoModal
    agendamento={agendamentoParaDeletar}
    onConfirmar={confirmarDeletar}
    onCancelar={fecharModalDeletar}
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

<div class="escopo-agendamento">
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
            <div class="card sala-select-card">
                <label for="sala-select">Sala</label>
                <select id="sala-select" bind:value={sala_id}>
                    <option value={null}>Selecione uma sala</option>
                    {#each salas as s}
                        <option value={s.id}>{s.nome}</option>
                    {/each}
                </select>
            </div>

            {#if sala_id}
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
                            <span
                                class="material-symbols-outlined text-primary"
                            >
                                calendar_month
                            </span>
                            <h3>Agendamentos — próximos 60 dias</h3>
                        </div>
                        <span class="badge"
                            >{agendamentos.length} registros</span
                        >
                    </div>

                    {#if !sala_id}
                        <p class="estado-vazio">
                            Selecione uma sala para ver os agendamentos.
                        </p>
                    {:else}
                        <CalendarioAgendamentos
                            {agendamentos}
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
                                <label>Dias da semana</label>
                                <div class="dias-semana">
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
