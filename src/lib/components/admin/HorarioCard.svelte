<script>
    import GradeSemanal from "$lib/components/SemanalGrade/GradeSemanal.svelte";
    import BlocoCard from "$lib/components/Card/BlocoHorarioCard.svelte";
    export let turmas = [];
    export let salas = [];
    export let professores = [];
    export let blocos = [];
    export let turma_id = null;
    export let novoBloco;
    export let dias = [];
    export let carregando = false;
    export let carregandoLista = false;
    export let erro = "";
    export let sucesso = "";
    export let onAdicionar;
    export let onRemover;
    export let onSair;
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
        <div class="card turma-select-card">
            <label for="turma">Turma</label>
            <select id="turma" bind:value={turma_id}>
                <option value={null}>Selecione uma turma</option>
                {#each turmas as t}
                    <option value={t.id}>{t.nome} — {t.ano_letivo}</option>
                {/each}
            </select>
        </div>

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
                            <option value={dia}>{dia}</option>
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
                    <select id="professor" bind:value={novoBloco.professor_id}>
                        <option value={null}>Selecione um professor</option>
                        {#each professores as p}
                            <option value={p.id}>{p.nome}</option>
                        {/each}
                    </select>
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

        {#if turma_id}
            <div class="card grade-card">
                <h3>
                    <span class="material-symbols-outlined">calendar_month</span
                    >
                    Grade Semanal
                </h3>

                <GradeSemanal
                    {dias}
                    {blocos}
                    {carregandoLista}
                    filtrarPor={{ campo: "turma_id", valor: turma_id }}
                >
                    <svelte:fragment let:bloco>
                        <BlocoCard {bloco} {onRemover} />
                    </svelte:fragment>
                </GradeSemanal>
            </div>
        {/if}
    </main>
</div>
