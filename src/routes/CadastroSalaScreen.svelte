<script>
    import { onMount } from "svelte";
    import { cadastrarSala } from "../services/SalaServices/CreateSalaService.js";
    import { carregarSalas } from "../services/SalaServices/SalaListServices.js";

    export let onSair;
    export let token = "";

    let novaSala = { nome: "", numero: null, obs: "", status: true };
    let salas = [];
    let carregando = false;
    let carregandoLista = false;
    let erro = "";
    let sucesso = "";
    let editando = false;
    let salaEditandoId = null;

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
            salas = await carregarSalas(token);
        } catch (e) {
            erro = e?.message || "Não foi possível carregar as salas.";
        } finally {
            carregandoLista = false;
        }
    }

    async function salvarSala() {
        erro = "";
        sucesso = "";

        if (!novaSala.nome || !novaSala.numero || novaSala.obs === "") {
            erro = "Preencha todos os campos do formulário.";
            return;
        }

        carregando = true;
        try {
            await cadastrarSala(novaSala, token);
            sucesso = "Sala cadastrada com sucesso.";
            resetForm();
            await carregarLista();
        } catch (e) {
            erro = e?.message || "Erro ao salvar sala.";
        } finally {
            carregando = false;
        }
    }

    function editarSala(sala) {
        novaSala = { ...sala };
        salaEditandoId = sala.id;
        editando = true;
        sucesso = "";
        erro = "";
    }

    function resetForm() {
        novaSala = { nome: "", numero: "", obs: "", status: true };
        editando = false;
        salaEditandoId = null;
    }
</script>

<div class="scaffold">
    <header class="app-bar">
        <div class="title-section">
            <h1>Portal de Agendamento</h1>
            <span>Cadastro de Salas</span>
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
        <!-- ESQUERDA: Formulário -->
        <div class="card form-card">
            <div class="card-header">
                <span class="material-symbols-outlined icon-large">
                    {editando ? "meeting_room" : "add_home"}
                </span>
            </div>

            <form on:submit|preventDefault={salvarSala}>
                <div class="field">
                    <label for="nome-sala">Nome da Sala</label>
                    <input
                        id="nome-sala"
                        type="text"
                        bind:value={novaSala.nome}
                        placeholder="Ex: Sala de Reunião A"
                        required
                    />
                </div>

                <div class="field">
                    <label for="numero-sala">Número</label>
                    <input
                        id="numero-sala"
                        type="number"
                        bind:value={novaSala.numero}
                        placeholder="Ex: 101"
                        required
                    />
                </div>

                <div class="field">
                    <label for="obs-sala">Observação</label>
                    <input
                        id="obs-sala"
                        type="text"
                        bind:value={novaSala.obs}
                        placeholder="Ex: Capacidade para 10 pessoas"
                        required
                    />
                </div>

                <div class="field field-toggle">
                    <label for="status-sala">Status</label>
                    <div class="toggle-wrapper">
                        <label class="toggle-switch">
                            <input
                                id="status-sala"
                                type="checkbox"
                                bind:checked={novaSala.status}
                            />
                            <span class="toggle-track">
                                <span class="toggle-thumb"></span>
                            </span>
                        </label>
                        <span class="toggle-label"
                            >{novaSala.status ? "Ativo" : "Inativo"}</span
                        >
                    </div>
                </div>

                {#if erro}
                    <p class="msg-erro">{erro}</p>
                {/if}
                {#if sucesso}
                    <p class="msg-sucesso">{sucesso}</p>
                {/if}

                <div class="bottom-action">
                    {#if editando}
                        <button
                            type="button"
                            class="btn-secondary"
                            on:click={resetForm}
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

        <!-- DIREITA: Tabela -->
        <div class="card table-card">
            <div class="table-header-title">
                <div class="title-left">
                    <span class="material-symbols-outlined text-blue"
                        >door_front</span
                    >
                    <h3>Salas Cadastradas</h3>
                </div>
                <div class="badge">{salas.length} registros</div>
            </div>

            <div class="table-wrapper">
                <div class="table-header">
                    <div class="th flex-2">Nome</div>
                    <div class="th flex-1">Número</div>
                    <div class="th flex-2">Observação</div>
                    <div class="th flex-1">Status</div>
                    <div class="th flex-1">Ações</div>
                </div>

                <div class="table-body">
                    {#if carregandoLista}
                        <div class="estado-vazio">Carregando salas...</div>
                    {:else if salas.length === 0}
                        <div class="estado-vazio">
                            Nenhuma sala cadastrada ainda.
                        </div>
                    {:else}
                        {#each salas as s, index}
                            <div
                                class="table-row {index % 2 === 0
                                    ? 'even'
                                    : 'odd'}"
                            >
                                <div class="td flex-2">
                                    <span
                                        class="material-symbols-outlined icon-tiny"
                                        >meeting_room</span
                                    >
                                    <span class="text-truncate">{s.nome}</span>
                                </div>
                                <div class="td flex-1">
                                    <span class="badge-numero">{s.numero}</span>
                                </div>
                                <div class="td flex-2">
                                    <span class="text-truncate">{s.obs}</span>
                                </div>
                                <div class="td flex-1">
                                    <span
                                        class="badge-status {s.status
                                            ? 'ativo'
                                            : 'inativo'}"
                                    >
                                        {s.status ? "Ativo" : "Inativo"}
                                    </span>
                                </div>
                                <div class="td flex-1 action-cell">
                                    <button
                                        class="btn-action edit"
                                        on:click={() => editarSala(s)}
                                        title="Editar"
                                    >
                                        <span class="material-symbols-outlined"
                                            >edit</span
                                        >
                                    </button>
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

    .estado-vazio {
        padding: 2rem;
        text-align: center;
        color: #94a3b8;
        font-size: 0.9rem;
    }

    .badge-numero {
        background: #dbeafe;
        padding: 4px 8px;
        border-radius: 6px;
        font-weight: bold;
        color: #1d4ed8;
        font-size: 11px;
    }

    .badge-status {
        padding: 4px 8px;
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

    .btn-primary:disabled {
        background: #7dd3fc;
        cursor: not-allowed;
    }

    .field-toggle {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }

    .toggle-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 42px;
        height: 24px;
    }

    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .toggle-track {
        position: absolute;
        inset: 0;
        background: #cbd5e1;
        border-radius: 24px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .toggle-switch input:checked ~ .toggle-track {
        background: #2196f3;
    }

    .toggle-thumb {
        position: absolute;
        width: 18px;
        height: 18px;
        left: 3px;
        top: 3px;
        background: white;
        border-radius: 50%;
        transition: transform 0.2s;
    }

    .toggle-switch input:checked ~ .toggle-track .toggle-thumb {
        transform: translateX(18px);
    }

    .toggle-label {
        font-size: 0.85rem;
        color: #64748b;
        font-weight: 600;
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
    }

    * {
        box-sizing: border-box;
    }

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
        flex-direction: row;
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
        width: 100%;
        max-width: 1400px;
        margin: 0 auto;
        overflow: hidden;
    }

    .card {
        background: #ffffff;
        border-radius: 24px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    }

    .form-card {
        width: 350px;
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
        margin-bottom: 4px;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
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

    .bottom-action {
        margin-top: 1rem;
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

    .table-header-title {
        padding: 24px 24px 16px;
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
        transition: background 0.2s;
        border-bottom: 1px solid #f1f5f9;
    }

    .table-row:last-child {
        border-bottom: none;
    }

    .table-row:hover {
        background-color: #f1f8ff;
    }

    .table-row.even {
        background-color: var(--white);
    }

    .table-row.odd {
        background-color: var(--blue-50);
    }

    .td {
        padding: 12px 6px;
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

    .action-cell {
        display: flex;
        flex-direction: row !important;
        gap: 12px;
        align-items: center;
        justify-content: center;
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

    .btn-action.edit {
        color: var(--warning);
        background-color: #fef3c7;
    }

    .btn-action.edit:hover {
        background-color: #fde68a;
    }

    @media (max-width: 900px) {
        .body-content {
            flex-direction: column;
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
