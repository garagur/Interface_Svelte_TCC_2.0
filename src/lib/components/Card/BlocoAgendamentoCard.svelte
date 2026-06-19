<script>
    export let ag;
    /** @type {((ag: any) => void) | null} */
    export let onDetalhes = null;
    export let usuarioId = null;

    $: proprio = usuarioId != null && ag.user_id == usuarioId;
</script>

<div class="ag-bloco-inner {proprio ? 'proprio' : 'outro'}">
    <span class="ag-hora">
        {ag.data_hora_inicio?.slice(11, 16)} - {ag.data_hora_fim?.slice(11, 16)}
    </span>
    {#if ag.sala_nome}
        <span class="ag-tipo-label">{ag.sala_nome}</span>
    {/if}
    {#if ag.usuario_nome}
        <span class="ag-tipo-label">{ag.usuario_nome}</span>
    {/if}
    {#if ag.obs}
        <span class="ag-tipo-label">{ag.obs}</span>
    {/if}
    {#if onDetalhes}
        <button
            class="btn-info-ag"
            on:click={() => onDetalhes(ag)}
            title="Ver detalhes"
        >
            <span class="material-symbols-outlined">info</span>
        </button>
    {/if}
</div>

<style>
    .ag-bloco-inner {
        border-radius: 4px;
        padding: 2px 4px;
    }

    .ag-bloco-inner.proprio {
        background-color: #dbeafe;
        border-left: 3px solid #3b82f6;
    }

    .ag-bloco-inner.outro {
        background-color: #f1f5f9;
        border-left: 3px solid #94a3b8;
    }

    .ag-hora {
        font-size: 0.9em;
        font-weight: bold;
        margin-right: 4px;
    }

    .ag-tipo-label {
        display: inline-block;
        background-color: transparent;
        color: #333;
        font-size: 0.8em;
        margin-top: 2px;
    }

    .btn-info-ag {
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px;
        margin-left: 4px;
    }

    .btn-info-ag:hover {
        color: #3b82f6;
    }
</style>
