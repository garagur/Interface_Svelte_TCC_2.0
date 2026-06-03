<script>
    export let titulo = "";
    export let matricula = "";
    export let onSair = () => {};
    export let onNovoAgendamento = () => {};
    export let totalRegistros = 0;
    export let carregando = false;
    export let erro = "";
</script>

<div class="scaffold">
    <header class="app-bar">
        <div class="title-section">
            <h1>{titulo}</h1>
            <span>Matrícula: {matricula}</span>
        </div>

        <nav class="nav-menu">
            <slot name="menu" />
        </nav>

        <div class="actions-section">
            <button class="btn-icon" on:click={onSair} title="Sair">
                <span class="material-symbols-outlined">logout</span>
            </button>
        </div>
    </header>

    <main class="body-content">
        <div class="table-header-title">
            <div class="title-left">
                <span class="material-symbols-outlined text-primary"
                    >list_alt</span
                >
                <h2>Agendamentos Recentes</h2>
            </div>
            <div class="badge">{totalRegistros} registros</div>
        </div>

        <div class="table-wrapper">
            <div class="table-header">
                <div class="th flex-2">Nome</div>
                <div class="th flex-2">Item</div>
                <div class="th flex-2">Início</div>
                <div class="th flex-2">Fim</div>
                <div class="th flex-1">Ações</div>
            </div>

            <div class="table-body">
                {#if carregando}
                    <div class="estado-vazio">Carregando...</div>
                {:else if erro}
                    <div class="estado-vazio">{erro}</div>
                {:else if totalRegistros === 0}
                    <div class="estado-vazio">
                        Nenhum agendamento encontrado.
                    </div>
                {:else}
                    <slot name="tabela-body" />
                {/if}
            </div>
        </div>

        <div class="bottom-action">
            <button class="btn-primary" on:click={onNovoAgendamento}>
                <span class="material-symbols-outlined">add_circle</span>
                Novo Agendamento
            </button>
        </div>
    </main>
</div>
