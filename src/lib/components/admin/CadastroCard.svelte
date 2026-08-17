<script>
    export let titulo = "";
    export let subtitulo = "";
    export let onSair;

    // form
    export let campos = [];
    export let temToggle = false;
    export let toggleValue = true;
    export let onSubmit;
    export let onCancelar = null;
    export let editando = false;
    export let carregando = false;
    export let erro = "";
    export let sucesso = "";
    export let iconeForm = "add_circle";

    // tabela
    export let tituloTabela = "";
    export let iconeTabela = "list";
    export let totalRegistros = 0;
    export let carregandoLista = false;
    export let estadoVazioTexto = "Nenhum registro encontrado.";
    export let carregandoTexto = "Carregando...";

    // busca e ordenação (novo)
    export let mostrarPesquisa = false;
    export let pesquisa = "";
    export let placeholderPesquisa = "Pesquisar...";
    export let ordenacao = "asc";
    export let onOrdenarChange = (value) => {};
    export let labelOrdenacaoAsc = "Nome (A-Z)";
    export let labelOrdenacaoDesc = "Nome (Z-A)";
</script>

<div class="scaffold">
    <header class="app-bar">
        <div class="title-section">
            <h1>{titulo}</h1>
            <span>{subtitulo}</span>
        </div>
        <div class="actions-section">
            <button
                class="btn-icon"
                on:click={onSair}
                title="Voltar para a Home"
            >
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
        </div>
    </header>

    <main class="body-content">
        <div class="card form-card">
            <div class="card-header">
                <span class="material-symbols-outlined icon-large"
                    >{iconeForm}</span
                >
            </div>

            <form on:submit|preventDefault={onSubmit}>
                <slot name="campos" />

                {#if temToggle}
                    <div class="field field-toggle">
                        <slot name="toggle" />
                    </div>
                {/if}

                {#if erro}<p class="msg-erro">{erro}</p>{/if}
                {#if sucesso}<p class="msg-sucesso">{sucesso}</p>{/if}

                <div class="bottom-action">
                    {#if editando && onCancelar}
                        <button
                            type="button"
                            class="btn-secondary"
                            on:click={onCancelar}
                        >
                            <span class="material-symbols-outlined">close</span>
                            Cancelar
                        </button>
                    {/if}
                    <button
                        type="submit"
                        class="btn-primary"
                        disabled={carregando}
                    >
                        <span class="material-symbols-outlined">save</span>
                        {carregando
                            ? "Salvando..."
                            : editando
                              ? "Atualizar"
                              : "Salvar"}
                    </button>
                </div>
            </form>
        </div>

        <div class="card table-card">
            <div class="table-header-title">
                <div class="title-left">
                    <span class="material-symbols-outlined text-blue"
                        >{iconeTabela}</span
                    >
                    <h3>{tituloTabela}</h3>
                </div>
                <div class="badge">{totalRegistros} registros</div>
            </div>

            {#if mostrarPesquisa}
                <div class="table-toolbar">
                    <div class="campo-pesquisa">
                        <span class="material-symbols-outlined">search</span>
                        <input
                            type="text"
                            placeholder={placeholderPesquisa}
                            bind:value={pesquisa}
                        />
                    </div>

                    {#if onOrdenarChange}
                        <select
                            class="select-ordenacao"
                            value={ordenacao}
                            on:change={(event) => {
                                const select = event.currentTarget;
                                if (select instanceof HTMLSelectElement) {
                                    onOrdenarChange(select.value);
                                }
                            }}
                        >
                            <option value="asc">{labelOrdenacaoAsc}</option>
                            <option value="desc">{labelOrdenacaoDesc}</option>
                        </select>
                    {/if}

                    <slot name="filtros-extra" />
                </div>
            {/if}

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

<style>
    @import "$lib/styles/admin-cadastro.css";
</style>
