<script>
    export let titulo = "";
    export let subtitulo = "";
    export let onSair;

    // form
    export let onSubmit;
    export let onLimpar;
    export let carregando = false;
    export let erro = "";
    export let sucesso = "";

    // tabela
    export let totalRegistros = 0;
    export let carregandoLista = false;
    export let estadoVazioTexto = "Nenhum item encontrado.";
    export let carregandoTexto = "Carregando...";

    // filtros
    export let filtroTipo = "todos";
    export let filtroBusca = "";
</script>

<div class="scaffold">
    <header class="app-bar">
        <div class="title-section">
            <h1>{titulo}</h1>
            <span>{subtitulo}</span>
        </div>
        <div class="actions-section">
            <button class="btn-icon" on:click={onSair} title="Voltar">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
        </div>
    </header>

    <main class="body-content">
        <!-- ESQUERDA: Formulário -->
        <div class="card form-card">
            <div class="card-header">
                <span class="material-symbols-outlined icon-large"
                    >calendar_add_on</span
                >
            </div>

            <form on:submit|preventDefault={onSubmit}>
                <slot name="campos" />

                <slot name="itens-selecionados" />

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
                        disabled={carregando}
                    >
                        <span class="material-symbols-outlined">save</span>
                        {carregando ? "Salvando..." : "Confirmar"}
                    </button>
                </div>
            </form>
        </div>

        <!-- DIREITA: Tabela -->
        <div class="card table-card">
            <div class="table-header-title">
                <div class="title-left">
                    <span class="material-symbols-outlined text-blue"
                        >inventory_2</span
                    >
                    <h3>Itens Disponíveis</h3>
                </div>
                <div class="badge">{totalRegistros} registros</div>
            </div>

            <!-- Filtros -->
            <div class="filter-bar">
                <input
                    class="search-input"
                    type="text"
                    placeholder="Buscar..."
                    bind:value={filtroBusca}
                />
                <div class="filter-btns">
                    <button
                        type="button"
                        class="filter-btn {filtroTipo === 'todos'
                            ? 'active'
                            : ''}"
                        on:click={() => (filtroTipo = "todos")}>Todos</button
                    >
                    <button
                        type="button"
                        class="filter-btn {filtroTipo === 'sala'
                            ? 'active'
                            : ''}"
                        on:click={() => (filtroTipo = "sala")}>Salas</button
                    >
                    <button
                        type="button"
                        class="filter-btn {filtroTipo === 'equipamento'
                            ? 'active'
                            : ''}"
                        on:click={() => (filtroTipo = "equipamento")}
                        >Equipamentos</button
                    >
                </div>
            </div>

            <div class="table-wrapper">
                <slot name="tabela-header" />

                <div class="table-body">
                    {#if carregandoLista}
                        <div class="estado-vazio">{carregandoTexto}</div>
                    {:else if totalRegistros === 0}
                        <div class="estado-vazio">{estadoVazioTexto}</div>
                    {:else}
                        <slot name="tabela-body" />
                    {/if}
                </div>
            </div>
        </div>
    </main>
</div>
