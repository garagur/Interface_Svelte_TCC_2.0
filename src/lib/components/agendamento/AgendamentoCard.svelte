<script>
    import GradeSemanal from "$lib/components/SemanalGrade/GradeSemanal.svelte";
    import BlocoCard from "$lib/components/Card/BlocoHorarioCard.svelte";
    import CalendarioAgendamentos from "$lib/components/MesGrade/GradeMensal.svelte"; // <-- IMPORTAÇÃO DO COMPONENTE

    export let salas = [];
    export let sala_id = null;
    export let agendamentos = [];
    export let blocosFixos = [];
    export let carregandoLista = false;
    export let carregandoBlocos = false;
    export let carregando = false;
    export let erro = "";
    export let sucesso = "";
    export let dataAgendamento = "";
    export let horaInicio = "";
    export let horaFim = "";
    export let obs = "";
    export let hojeStr = "";
    export let onSubmit;
    export let onLimpar;
    export let onSair;

    const dias = [
        "segunda",
        "terca",
        "quarta",
        "quinta",
        "sexta",
        "sabado",
        "domingo",
    ];

    // Lógicas de gerar dias e semanas foram removidas daqui pois o componente novo já cuida disso internamente!
</script>

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
                <div class="card form-card">
                    <div class="card-header">
                        <span class="material-symbols-outlined icon-large">
                            calendar_add_on
                        </span>
                    </div>

                    <form on:submit|preventDefault={onSubmit}>
                        <div class="field">
                            <label for="data-agendamento">Data</label>
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
                                {carregando ? "Salvando..." : "Confirmar"}
                            </button>
                        </div>
                    </form>
                </div>

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
                                {#if ag.obs}
                                    <span class="ag-tipo-label">{ag.obs}</span>
                                {/if}
                            </svelte:fragment>
                        </CalendarioAgendamentos>
                    {/if}
                </div>
            </div>
        </main>
    </div>
</div>
