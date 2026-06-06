<script>
    export let turmas = [];
    export let salas = [];
    export let turma_id;
    export let novoBloco;
    export let dias = [];
    export let blocosOrdenados;
    export let carregando = false;
    export let carregandoLista = false;
    export let erro = "";
    export let sucesso = "";
    export let onAdicionar;
    export let onRemover;
    export let onSair;

    const diasLabels = {
        segunda: "Segunda",
        terca: "Terça",
        quarta: "Quarta",
        quinta: "Quinta",
        sexta: "Sexta",
        sabado: "Sábado",
        domingo: "Domingo",
    };

    const diasFimDeSemana = ["sabado", "domingo"];
</script>

<div class="scaffold">
    <header class="app-bar">
        <div class="title-section">
            <h1>Portal de Agendamento</h1>
            <span>Grade de Horários</span>
        </div>
        <button class="btn-icon" on:click={onSair} title="Voltar">
            <span class="material-symbols-outlined">arrow_back</span>
        </button>
    </header>

    <main class="horario-content">
        <!-- TOPO: seleção de turma -->
        <div class="card turma-select-card">
            <label for="turma">Turma</label>
            <select id="turma" bind:value={turma_id}>
                <option value={null}>Selecione uma turma</option>
                {#each turmas as t}
                    <option value={t.id}>{t.nome} — {t.ano_letivo}</option>
                {/each}
            </select>
        </div>

        <!-- FORMULÁRIO de novo bloco -->
        <div class="card form-bloco-card">
            <h3>
                <span class="material-symbols-outlined">add_circle</span>
                Novo Bloco
            </h3>

            <div class="form-bloco-fields">
                <div class="field">
                    <label for="dia">Dia da Semana</label>
                    <select id="dia" bind:value={novoBloco.dia_semana}>
                        {#each dias as dia}
                            <option value={dia}>{diasLabels[dia]}</option>
                        {/each}
                    </select>
                </div>

                <div class="field">
                    <label for="sala">Sala</label>
                    <select id="sala" bind:value={novoBloco.sala_id}>
                        <option value={null}>Selecione uma sala</option>
                        {#each salas as s}
                            <option value={s.id}>{s.nome}</option>
                        {/each}
                    </select>
                </div>

                <div class="field">
                    <label for="inicio">Início</label>
                    <input
                        id="inicio"
                        type="time"
                        bind:value={novoBloco.hora_inicio}
                    />
                </div>

                <div class="field">
                    <label for="fim">Fim</label>
                    <input
                        id="fim"
                        type="time"
                        bind:value={novoBloco.hora_fim}
                    />
                </div>

                <div class="field">
                    <label for="disciplina">Disciplina</label>
                    <input
                        id="disciplina"
                        type="text"
                        bind:value={novoBloco.disciplina}
                        placeholder="Ex: Matemática"
                    />
                </div>

                <div class="field">
                    <label for="professor">Professor</label>
                    <input
                        id="professor"
                        type="text"
                        bind:value={novoBloco.professor_id}
                        placeholder="Ex: João Silva"
                    />
                </div>
            </div>

            {#if erro}<p class="msg-erro">{erro}</p>{/if}
            {#if sucesso}<p class="msg-sucesso">{sucesso}</p>{/if}

            <button
                class="btn-primary"
                on:click={onAdicionar}
                disabled={carregando}
            >
                <span class="material-symbols-outlined">add</span>
                {carregando ? "Adicionando..." : "Adicionar"}
            </button>
        </div>

        <!-- GRADE SEMANAL -->
        <div class="card grade-card">
            <h3>
                <span class="material-symbols-outlined">calendar_month</span>
                Grade Semanal
            </h3>

            {#if carregandoLista}
                <p class="estado-vazio">Carregando horários...</p>
            {:else}
                <div class="grade-wrapper">
                    {#each dias as dia}
                        <div
                            class="dia-coluna {diasFimDeSemana.includes(dia)
                                ? 'fds'
                                : ''}"
                        >
                            <div class="dia-header">{diasLabels[dia]}</div>
                            <div class="dia-blocos">
                                {#each blocosOrdenados(dia) as bloco}
                                    <div class="bloco-card">
                                        <div class="bloco-horario">
                                            {bloco.hora_inicio} - {bloco.hora_fim}
                                        </div>
                                        <div class="bloco-disciplina">
                                            {bloco.disciplina}
                                        </div>
                                        <div class="bloco-professor">
                                            <span
                                                class="material-symbols-outlined icon-tiny"
                                                >person</span
                                            >
                                            {bloco.professor?.name ??
                                                bloco.professor_id}
                                        </div>
                                        <div class="bloco-actions">
                                            <button
                                                class="btn-action delete"
                                                on:click={() =>
                                                    onRemover(bloco.id)}
                                                title="Remover"
                                            >
                                                <span
                                                    class="material-symbols-outlined"
                                                    >delete</span
                                                >
                                            </button>
                                        </div>
                                    </div>
                                {:else}
                                    <div class="bloco-vazio">—</div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </main>
</div>
