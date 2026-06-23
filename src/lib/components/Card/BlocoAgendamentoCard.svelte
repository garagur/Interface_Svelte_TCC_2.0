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
</script>

<div class="ag-bloco-inner {proprio ? 'proprio' : 'outro'}">
    <span class="ag-hora">
        {ag.data_hora_inicio?.slice(11, 16)} - {ag.data_hora_fim?.slice(11, 16)}
    </span>

    {#if ag.sala_nome}
        <div class="ag-info">
            <span class="material-symbols-outlined ag-icon">meeting_room</span>
            <span class="ag-label">{ag.sala_nome}</span>
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
        border-radius: 6px;
        padding: 4px 6px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        width: 100%;
        box-sizing: border-box;
        min-width: 0;
    }

    .ag-bloco-inner.proprio {
        background-color: #dcfce7;
        border-left: 3px solid #16a34a;
    }

    .ag-bloco-inner.outro {
        background-color: #f1f5f9;
        border-left: 3px solid #929292;
    }

    .ag-hora {
        font-size: 0.8rem;
        font-weight: 700;
        color: #1e293b;
    }

    .ag-info {
        display: flex;
        align-items: center;
        gap: 3px;
    }

    .ag-icon {
        font-size: 0.85rem;
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
        gap: 2px;
        margin-top: 2px;
    }

    .btn-ag {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
    }

    .btn-ag .material-symbols-outlined {
        font-size: 1rem;
    }

    .btn-ag.delete {
        color: #ef4444;
    }

    .btn-ag.delete:hover {
        color: #b91c1c;
    }

    .btn-ag.info {
        color: #64748b;
    }

    .btn-ag.info:hover {
        color: #003da0;
    }
</style>
