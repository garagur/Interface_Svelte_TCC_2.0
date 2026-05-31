<script>
    import { onMount } from "svelte";
    import { carregarSalas } from "../services/SalaServices/SalaListService.js";
    import { carregarEquipamentos } from "../services/EquipamentoServices/EquipamentoListService.js";

    export let onSair;
    export let token = "";
    export let matricula = "";

    // ── Form state ──
    let dataAgendamento = hoje();
    let horaInicio = "08:00";
    let horaFim = "10:00";
    let obs = "";

    // ── Data ──
    let salas = [];
    let equipamentos = [];
    let carregandoLista = false;

    // ── Itens selecionados ──
    let itensSelecionados = []; // { id, nome, tipo }

    // ── Filtros da tabela ──
    let filtroTipo = "todos";
    let filtroBusca = "";

    // ── UI state ──
    let carregando = false;
    let erro = "";
    let sucesso = "";

    onMount(async () => {
        if (!token) {
            erro = "Token não encontrado. Faça login novamente.";
            return;
        }
        await carregarLista();
    });

    async function carregarLista() {
        carregandoLista = true;
        erro = "";
        try {
            const [s, e] = await Promise.all([
                carregarSalas(token),
                carregarEquipamentos(token),
            ]);
            salas = s;
            equipamentos = e;
        } catch (e) {
            erro = e?.message || "Não foi possível carregar os itens.";
        } finally {
            carregandoLista = false;
        }
    }

    // ── Tabela disponível (salas + equipamentos mesclados) ──
    $: todosItens = [
        ...salas.map((s) => ({ ...s, tipo: "sala" })),
        ...equipamentos.map((e) => ({ ...e, tipo: "equipamento" })),
    ];

    $: itensFiltrados = todosItens.filter((item) => {
        const matchTipo = filtroTipo === "todos" || item.tipo === filtroTipo;
        const matchBusca = item.nome
            .toLowerCase()
            .includes(filtroBusca.toLowerCase());
        return matchTipo && matchBusca;
    });

    function filtraBusca(q) {
        return q.toLowerCase();
    }

    function jaSelecionado(id, tipo) {
        return itensSelecionados.some((i) => i.id === id && i.tipo === tipo);
    }

    function adicionarItem(item) {
        if (!item.status) return;
        if (jaSelecionado(item.id, item.tipo)) return;
        itensSelecionados = [...itensSelecionados, item];
    }

    function removerItem(id, tipo) {
        itensSelecionados = itensSelecionados.filter(
            (i) => !(i.id === id && i.tipo === tipo),
        );
    }

    function hoje() {
        return new Date().toISOString().slice(0, 10);
    }

    async function salvarAgendamento() {
        erro = "";
        sucesso = "";

        if (!dataAgendamento || !horaInicio || !horaFim) {
            erro = "Preencha a data e os horários.";
            return;
        }
        if (itensSelecionados.length === 0) {
            erro = "Selecione pelo menos um item para agendar.";
            return;
        }
        if (horaInicio >= horaFim) {
            erro = "A hora de início deve ser anterior à hora de fim.";
            return;
        }

        carregando = true;
        try {
            const payload = {
                matricula,
                data: dataAgendamento,
                hora_inicio: horaInicio,
                hora_fim: horaFim,
                obs,
                itens: itensSelecionados.map((i) => ({
                    id: i.id,
                    tipo: i.tipo,
                })),
            };
            // TODO: await criarAgendamento(payload, token);
            console.log("Payload agendamento:", payload);
            sucesso = "Agendamento realizado com sucesso.";
            resetForm();
        } catch (e) {
            erro = e?.message || "Erro ao realizar agendamento.";
        } finally {
            carregando = false;
        }
    }

    function resetForm() {
        dataAgendamento = hoje();
        horaInicio = "08:00";
        horaFim = "10:00";
        obs = "";
        itensSelecionados = [];
    }
</script>

<div class="scaffold">
    <!-- ── App Bar ── -->
    <header class="app-bar">
        <div class="title-section">
            <h1>Portal de Agendamento</h1>
            <span>Novo Agendamento</span>
        </div>
        <div class="actions-section">
            <button class="btn-icon" on:click={onSair} title="Voltar">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
        </div>
    </header>

    <main class="body-content">
        <!-- ── ESQUERDA: Formulário ── -->
        <div class="card form-card">
            <div class="card-header">
                <span class="material-symbols-outlined icon-large">
                    calendar_add_on
                </span>
            </div>

            <form on:submit|preventDefault={salvarAgendamento}>
                <div class="field">
                    <label for="data-agendamento">Data</label>
                    <input
                        id="data-agendamento"
                        type="date"
                        bind:value={dataAgendamento}
                        min={hoje()}
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
                    <label for="obs-agendamento">Observação</label>
                    <input
                        id="obs-agendamento"
                        type="text"
                        bind:value={obs}
                        placeholder="Ex: Aula de reposição"
                    />
                </div>

                <!-- Resumo dos itens selecionados -->
                <div class="selected-section">
                    <span class="selected-label">
                        <span class="material-symbols-outlined icon-tiny">
                            checklist
                        </span>
                        Itens selecionados
                        <span class="badge-count"
                            >{itensSelecionados.length}</span
                        >
                    </span>

                    {#if itensSelecionados.length === 0}
                        <p class="selected-empty">
                            Nenhum item adicionado ainda.
                        </p>
                    {:else}
                        <ul class="selected-list">
                            {#each itensSelecionados as item (item.id + item.tipo)}
                                <li class="selected-item">
                                    <span
                                        class="material-symbols-outlined icon-tiny tipo-icon"
                                    >
                                        {item.tipo === "sala"
                                            ? "meeting_room"
                                            : "devices"}
                                    </span>
                                    <span class="selected-nome"
                                        >{item.nome}</span
                                    >
                                    <button
                                        type="button"
                                        class="btn-remove"
                                        on:click={() =>
                                            removerItem(item.id, item.tipo)}
                                        title="Remover"
                                    >
                                        <span class="material-symbols-outlined"
                                            >close</span
                                        >
                                    </button>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>

                {#if erro}
                    <p class="msg-erro">{erro}</p>
                {/if}
                {#if sucesso}
                    <p class="msg-sucesso">{sucesso}</p>
                {/if}

                <div class="bottom-action">
                    <button
                        type="button"
                        class="btn-secondary"
                        on:click={resetForm}
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

        <!-- ── DIREITA: Tabela de itens disponíveis ── -->
        <div class="card table-card">
            <div class="table-header-title">
                <div class="title-left">
                    <span class="material-symbols-outlined text-blue">
                        inventory_2
                    </span>
                    <h3>Itens Disponíveis</h3>
                </div>
                <div class="badge">{todosItens.length} registros</div>
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
                <div class="table-header">
                    <div class="th flex-2">Nome</div>
                    <div class="th flex-1">Tipo</div>
                    <div class="th flex-1">Status</div>
                    <div class="th flex-1">Ação</div>
                </div>

                <div class="table-body">
                    {#if carregandoLista}
                        <div class="estado-vazio">Carregando itens...</div>
                    {:else if itensFiltrados.length === 0}
                        <div class="estado-vazio">Nenhum item encontrado.</div>
                    {:else}
                        {#each itensFiltrados as item, index (item.id + item.tipo)}
                            {@const selecionado = jaSelecionado(
                                item.id,
                                item.tipo,
                            )}
                            {@const indisponivel = !item.status}
                            <div
                                class="table-row
                                    {index % 2 === 0 ? 'even' : 'odd'}
                                    {selecionado ? 'row-selected' : ''}
                                    {indisponivel ? 'row-disabled' : ''}"
                            >
                                <div class="td flex-2">
                                    <span
                                        class="material-symbols-outlined icon-tiny"
                                    >
                                        {item.tipo === "sala"
                                            ? "meeting_room"
                                            : "devices"}
                                    </span>
                                    <span class="text-truncate"
                                        >{item.nome}</span
                                    >
                                </div>
                                <div class="td flex-1">
                                    <span class="badge-tipo {item.tipo}">
                                        {item.tipo === "sala"
                                            ? "Sala"
                                            : "Equipamento"}
                                    </span>
                                </div>
                                <div class="td flex-1">
                                    <span
                                        class="badge-status {item.status
                                            ? 'ativo'
                                            : 'inativo'}"
                                    >
                                        {item.status ? "Ativo" : "Inativo"}
                                    </span>
                                </div>
                                <div class="td flex-1 action-cell">
                                    {#if selecionado}
                                        <button
                                            type="button"
                                            class="btn-action remove"
                                            on:click={() =>
                                                removerItem(item.id, item.tipo)}
                                            title="Remover"
                                        >
                                            <span
                                                class="material-symbols-outlined"
                                                >remove</span
                                            >
                                        </button>
                                    {:else}
                                        <button
                                            type="button"
                                            class="btn-action add"
                                            on:click={() => adicionarItem(item)}
                                            disabled={indisponivel}
                                            title={indisponivel
                                                ? "Indisponível"
                                                : "Adicionar"}
                                        >
                                            <span
                                                class="material-symbols-outlined"
                                                >add</span
                                            >
                                        </button>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>
    </main>
</div>

<style>
    /* ── Reset / base ── */
    * {
        box-sizing: border-box;
    }
    :global(body),
    :global(html) {
        margin: 0;
        padding: 0;
        height: 100%;
    }
    :root {
        --blue-primary: #2196f3;
        --blue-dark: #1976d2;
        --blue-light: #bbdefb;
        --blue-50: #e3f2fd;
        --white: #ffffff;
        --text-dark: #424242;
        --bg-input: #f8fafc;
        --border-input: #cbd5e1;
        --danger: #ef4444;
        --warning: #f59e0b;
        --success: #22c55e;
    }

    /* ── Layout ── */
    .scaffold {
        display: flex;
        flex-direction: column;
        height: 100vh;
        font-family: "Inter", Arial, sans-serif;
        overflow: hidden;
    }

    .app-bar {
        background-color: var(--white);
        padding: 12px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        z-index: 10;
    }

    .title-section {
        display: flex;
        flex-direction: column;
    }
    .title-section h1 {
        margin: 0;
        font-size: 18px;
        color: var(--blue-primary);
    }
    .title-section span {
        font-size: 11px;
        color: #64748b;
        margin-top: 2px;
    }

    .btn-icon {
        background: none;
        border: none;
        color: var(--blue-primary);
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: background 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .btn-icon:hover {
        background: #cdcdcd;
    }

    .body-content {
        flex: 1;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        padding: 24px;
        gap: 24px;
        max-width: 1400px;
        width: 100%;
        margin: 0 auto;
        overflow: hidden;
    }

    /* ── Cards ── */
    .card {
        background: #ffffff;
        border-radius: 24px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    }

    .form-card {
        width: 360px;
        flex-shrink: 0;
        padding: 2rem;
        overflow-y: auto;
        max-height: 100%;
    }

    .table-card {
        flex: 1;
        display: flex;
        flex-direction: column;
        height: 100%;
        padding-bottom: 24px;
        overflow: hidden;
    }

    .card-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 1rem;
    }

    .icon-large {
        font-size: 32px;
        color: var(--blue-primary);
    }

    /* ── Form ── */
    form {
        display: flex;
        flex-direction: column;
        gap: 1.1rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    label {
        font-weight: 600;
        font-size: 0.85rem;
        color: #64748b;
    }

    input {
        padding: 0.65rem;
        background: var(--bg-input);
        border: 1px solid var(--border-input);
        color: #1e293b;
        border-radius: 8px;
        font-size: 0.9rem;
        transition: border-color 0.2s;
        width: 100%;
    }
    input:focus {
        border-color: var(--blue-primary);
        outline: none;
        background: #fff;
    }

    /* ── Itens selecionados (resumo no form) ── */
    .selected-section {
        background: var(--blue-50);
        border: 1px solid var(--blue-light);
        border-radius: 12px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .selected-label {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--blue-dark);
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .badge-count {
        background: var(--blue-primary);
        color: #fff;
        border-radius: 20px;
        font-size: 10px;
        padding: 1px 7px;
        font-weight: 700;
        margin-left: 2px;
    }

    .selected-empty {
        font-size: 0.8rem;
        color: #94a3b8;
        font-style: italic;
        margin: 0;
    }

    .selected-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .selected-item {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #fff;
        border-radius: 8px;
        padding: 5px 8px;
        font-size: 0.8rem;
        color: var(--text-dark);
        animation: pop 0.15s ease;
    }

    @keyframes pop {
        from {
            transform: scale(0.9);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    .selected-nome {
        flex: 1;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .tipo-icon {
        color: var(--blue-primary);
    }

    .btn-remove {
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px;
        border-radius: 4px;
        color: #94a3b8;
        display: flex;
        align-items: center;
        transition: color 0.15s;
    }
    .btn-remove:hover {
        color: var(--danger);
    }
    .btn-remove .material-symbols-outlined {
        font-size: 16px;
    }

    /* ── Bottom action ── */
    .bottom-action {
        margin-top: 0.5rem;
        display: flex;
        gap: 8px;
        justify-content: center;
    }

    .btn-primary {
        flex: 1;
        background-color: var(--blue-primary);
        color: var(--white);
        border: none;
        border-radius: 12px;
        padding: 14px;
        font-size: 15px;
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }
    .btn-primary:hover {
        background-color: var(--blue-dark);
    }
    .btn-primary:disabled {
        background: #7dd3fc;
        cursor: not-allowed;
    }

    .btn-secondary {
        flex: 1;
        background-color: #f1f5f9;
        color: #64748b;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 14px;
        font-size: 15px;
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }
    .btn-secondary:hover {
        background-color: #e2e8f0;
    }

    /* ── Feedback ── */
    .msg-erro {
        color: #dc2626;
        font-size: 0.85rem;
        text-align: center;
        margin: 0;
    }
    .msg-sucesso {
        color: #16a34a;
        font-size: 0.85rem;
        text-align: center;
        margin: 0;
    }

    /* ── Table card header ── */
    .table-header-title {
        padding: 24px 24px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .title-left {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .text-blue {
        color: var(--blue-primary);
    }
    .table-header-title h3 {
        margin: 0;
        font-size: 18px;
        color: var(--blue-primary);
    }

    .badge {
        background-color: var(--blue-50);
        border: 1px solid var(--blue-light);
        color: var(--blue-dark);
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: bold;
    }

    /* ── Filter bar ── */
    .filter-bar {
        padding: 0 24px 14px;
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
    }

    .search-input {
        flex: 1;
        min-width: 140px;
        padding: 7px 12px;
        border: 1px solid var(--border-input);
        border-radius: 8px;
        font-size: 13px;
        background: var(--bg-input);
        color: #1e293b;
        transition: border-color 0.2s;
        outline: none;
    }
    .search-input:focus {
        border-color: var(--blue-primary);
    }

    .filter-btns {
        display: flex;
        gap: 6px;
    }

    .filter-btn {
        padding: 6px 14px;
        border-radius: 8px;
        border: 1.5px solid var(--border-input);
        background: var(--bg-input);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        color: #64748b;
        transition: all 0.15s;
    }
    .filter-btn:hover {
        border-color: var(--blue-primary);
        color: var(--blue-primary);
    }
    .filter-btn.active {
        background: var(--blue-primary);
        color: #fff;
        border-color: var(--blue-primary);
    }

    /* ── Table ── */
    .table-wrapper {
        margin: 0 24px;
        display: flex;
        flex-direction: column;
        border: 1px solid var(--blue-light);
        border-radius: 12px;
        flex: 1;
        overflow: hidden;
    }

    .table-header {
        background-color: var(--blue-primary);
        color: var(--white);
        display: flex;
        flex-shrink: 0;
    }

    .table-header .th {
        padding: 12px 8px;
        font-size: 12px;
        font-weight: bold;
        text-align: center;
    }

    .table-body {
        flex: 1;
        overflow-y: auto;
        background: white;
    }

    .table-row {
        display: flex;
        transition: background 0.15s;
        border-bottom: 1px solid #f1f5f9;
    }
    .table-row:last-child {
        border-bottom: none;
    }
    .table-row:hover {
        background-color: #f1f8ff !important;
    }
    .table-row.even {
        background-color: var(--white);
    }
    .table-row.odd {
        background-color: var(--blue-50);
    }
    .table-row.row-selected {
        background-color: #dbeafe !important;
    }
    .table-row.row-disabled {
        opacity: 0.5;
    }

    .td {
        padding: 11px 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: var(--text-dark);
    }

    .flex-2 {
        flex: 2;
        width: 0;
    }
    .flex-1 {
        flex: 1;
        width: 0;
    }

    .text-truncate {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-top: 2px;
        text-align: center;
    }

    .icon-tiny {
        font-size: 14px;
        color: #42a5f5;
    }

    /* ── Badges ── */
    .badge-status {
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: bold;
        font-size: 11px;
    }
    .badge-status.ativo {
        background: #dcfce7;
        color: #15803d;
    }
    .badge-status.inativo {
        background: #fee2e2;
        color: #b91c1c;
    }

    .badge-tipo {
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: bold;
        font-size: 11px;
    }
    .badge-tipo.sala {
        background: #dbeafe;
        color: #1d4ed8;
    }
    .badge-tipo.equipamento {
        background: #fef3c7;
        color: #b45309;
    }

    /* ── Action buttons na tabela ── */
    .action-cell {
        flex-direction: row !important;
        gap: 8px;
    }

    .btn-action {
        background: none;
        border: none;
        cursor: pointer;
        padding: 6px;
        border-radius: 8px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .btn-action.add {
        color: #16a34a;
        background-color: #dcfce7;
    }
    .btn-action.add:hover {
        background-color: #bbf7d0;
    }
    .btn-action.remove {
        color: #b91c1c;
        background-color: #fee2e2;
    }
    .btn-action.remove:hover {
        background-color: #fecaca;
    }
    .btn-action:disabled {
        opacity: 0.35;
        cursor: not-allowed;
    }

    .estado-vazio {
        padding: 2rem;
        text-align: center;
        color: #94a3b8;
        font-size: 0.9rem;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
        .body-content {
            flex-direction: column;
            overflow: auto;
        }
        .form-card {
            width: 100%;
            max-width: none;
        }
        .table-card {
            overflow: visible;
            height: auto;
        }
        .table-body {
            overflow-y: visible;
        }
    }
</style>
