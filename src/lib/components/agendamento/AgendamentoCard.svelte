<script>
    export let salas = [];
    export let sala_id = null;
    export let agendamentos = [];
    export let carregandoLista = false;
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

    // Gera os próximos 60 dias a partir de hoje
    function gerarDias60() {
        const dias = [];
        const base = new Date();
        base.setHours(0, 0, 0, 0);
        for (let i = 0; i < 60; i++) {
            const d = new Date(base);
            d.setDate(base.getDate() + i);
            dias.push(d);
        }
        return dias;
    }

    // Agrupa os dias em semanas (linhas do calendário)
    function gerarSemanas(dias) {
        const semanas = [];
        // Preenche dias vazios antes do primeiro dia
        const primeiro = dias[0].getDay(); // 0=Dom
        const prefixo = Array(primeiro).fill(null);
        const todos = [...prefixo, ...dias];
        for (let i = 0; i < todos.length; i += 7) {
            semanas.push(todos.slice(i, i + 7));
        }
        return semanas;
    }

    function agendamentosDoDia(data) {
        if (!data) return [];
        const str = data.toISOString().slice(0, 10);
        return agendamentos.filter(
            (a) => a.data_hora_inicio?.slice(0, 10) === str,
        );
    }

    function formatarHora(dtStr) {
        if (!dtStr) return "";
        return dtStr.slice(11, 16); // "HH:MM"
    }

    function ehHoje(data) {
        if (!data) return false;
        return data.toISOString().slice(0, 10) === hojeStr;
    }

    const cabecalho = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    $: dias60 = gerarDias60();
    $: semanas = gerarSemanas(dias60);
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
            <!-- Seleção de sala -->
            <div class="card sala-select-card">
                <label for="sala-select">Sala</label>
                <select id="sala-select" bind:value={sala_id}>
                    <option value={null}>Selecione uma sala</option>
                    {#each salas as s}
                        <option value={s.id}>{s.nome}</option>
                    {/each}
                </select>
            </div>

            <!-- Formulário + Calendário lado a lado -->
            <div class="conteudo-principal">
                <!-- Formulário -->
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

                <!-- Calendário -->
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
                    {:else if carregandoLista}
                        <p class="estado-vazio">Carregando agendamentos...</p>
                    {:else}
                        <div class="grade-wrapper">
                            <div class="grade-cabecalho">
                                {#each cabecalho as dia}
                                    <div class="cabecalho-dia">{dia}</div>
                                {/each}
                            </div>
                            <div class="grade-semanas">
                                {#each semanas as semana}
                                    <div class="semana-row">
                                        {#each semana as dia}
                                            <div
                                                class="dia-celula {dia &&
                                                ehHoje(dia)
                                                    ? 'dia-hoje'
                                                    : ''} {!dia
                                                    ? 'dia-vazio'
                                                    : ''}"
                                            >
                                                {#if dia}
                                                    <span
                                                        class="dia-numero {ehHoje(
                                                            dia,
                                                        )
                                                            ? 'numero-hoje'
                                                            : ''}"
                                                    >
                                                        {dia.getDate()}
                                                    </span>
                                                    {#each agendamentosDoDia(dia) as ag}
                                                        <div
                                                            class="ag-bloco sala"
                                                        >
                                                            <span
                                                                class="ag-hora"
                                                            >
                                                                {formatarHora(
                                                                    ag.data_hora_inicio,
                                                                )} - {formatarHora(
                                                                    ag.data_hora_fim,
                                                                )}
                                                            </span>
                                                            {#if ag.obs}
                                                                <span
                                                                    class="ag-tipo-label"
                                                                    >{ag.obs}</span
                                                                >
                                                            {/if}
                                                        </div>
                                                    {/each}
                                                {/if}
                                            </div>
                                        {/each}
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </main>
    </div>
</div>
