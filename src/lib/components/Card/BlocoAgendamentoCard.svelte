<script>
    export let ag;
    /** @type {((ag: any) => void) | null} */
    export let onDetalhes = null;
    /** @type {((ag: any) => void) | null} */
    export let onDeletar = null;
    export let usuarioId = null;
    export let cargo = null;

    $: proprio = usuarioId != null && ag.user_id == usuarioId;
    $: podeDeletar = cargo === "admin" || proprio;

    $: ehEquipamento = ag.tipo === "equipamento";
    $: recursoNome = ehEquipamento
        ? ag.equipamento_nome || ag.equipamento_id
        : ag.sala_nome || ag.sala_id;
    $: recursoIcone = ehEquipamento ? "devices" : "meeting_room";
</script>

<div class="ag-bloco-inner {proprio ? 'proprio' : 'outro'}">
    <span class="ag-hora">
        {ag.data_hora_inicio?.slice(11, 16)} - {ag.data_hora_fim?.slice(11, 16)}
    </span>

    {#if recursoNome}
        <div class="ag-info">
            <span class="material-symbols-outlined ag-icon">{recursoIcone}</span
            >
            <span class="ag-label">{recursoNome}</span>
        </div>
    {/if}

    {#if ag.usuario_nome}
        <div class="ag-info">
            <span class="material-symbols-outlined ag-icon">person</span>
            <span class="ag-label">{ag.usuario_nome}</span>
        </div>
    {/if}

    <div class="ag-acoes">
        {#if onDeletar && podeDeletar}
            <button
                class="btn-ag delete"
                on:click={() => onDeletar(ag)}
                title="Deletar"
            >
                <span class="material-symbols-outlined">delete</span>
            </button>
        {/if}
        {#if onDetalhes}
            <button
                class="btn-ag info"
                on:click={() => onDetalhes(ag)}
                title="Ver detalhes"
            >
                <span class="material-symbols-outlined">info</span>
            </button>
        {/if}
    </div>
</div>

<style>
    .ag-bloco-inner {
        --neu-bg: #e6e9ef;
        --neu-shadow-dark: rgba(163, 177, 198, 0.55);
        --neu-shadow-light: rgba(255, 255, 255, 0.85);

        background: var(--neu-bg);
        border-radius: 12px;
        padding: 0.6rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        width: 100%;
        box-sizing: border-box;
        min-width: 0;
        font-family: "Inter", Arial, sans-serif;

        box-shadow:
            3px 3px 6px var(--neu-shadow-dark),
            -3px -3px 6px var(--neu-shadow-light);
        transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
    }

    /* Diferenciação por indicação de cor lateral com tom neutro neumórfico */
    .ag-bloco-inner.proprio {
        border-left: 4px solid #16a34a;
    }

    .ag-bloco-inner.outro {
        border-left: 4px solid #94a3b8;
    }

    .ag-hora {
        font-size: 0.8rem;
        font-weight: 700;
        color: #1e293b;
    }

    .ag-info {
        display: flex;
        align-items: center;
        gap: 0.3rem;
    }

    .ag-icon {
        font-size: 0.9rem;
        color: #64748b;
    }

    .ag-label {
        font-size: 0.78rem;
        font-weight: 600;
        color: #334155;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .ag-acoes {
        display: flex;
        justify-content: flex-end;
        gap: 0.4rem;
        margin-top: 0.2rem;
    }

    .btn-ag {
        background: var(--neu-bg);
        border: none;
        cursor: pointer;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        box-shadow:
            2px 2px 4px var(--neu-shadow-dark),
            -2px -2px 4px var(--neu-shadow-light);
        transition:
            box-shadow 0.15s ease,
            color 0.15s ease;
    }

    .btn-ag .material-symbols-outlined {
        font-size: 0.95rem;
    }

    /* Botão Delete */
    .btn-ag.delete {
        color: #ef4444;
    }

    .btn-ag.delete:hover {
        color: #b91c1c;
    }

    /* Botão Info */
    .btn-ag.info {
        color: #64748b;
    }

    .btn-ag.info:hover {
        color: #2563eb;
    }
    .btn-ag:active {
        box-shadow:
            inset 1px 1px 3px var(--neu-shadow-dark),
            inset -1px -1px 3px var(--neu-shadow-light);
    }
</style>
