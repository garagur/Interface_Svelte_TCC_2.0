<script>
    import AgendamentoDetalheModal from "$lib/components/Card/AgendamentoDetalheModal.svelte";

    export let ag;
    /** @type {((ag: any) => void) | null} */
    export let onDeletar = null;
    export let usuarioId = null;
    export let cargo = null;

    let mostrarDetalhes = false;

    $: ehEquipamento = ag.tipo === "equipamento";

    $: proprio = usuarioId != null && ag.user_id == usuarioId;
    // AJUSTAR: espelhe a mesma regra de permissão do backend (DeletedAgendamentoXController)
    $: responsavelId = ehEquipamento
        ? ag.equipamento_responsavel_id
        : ag.sala_responsavel_id;
    $: ehResponsavel =
        usuarioId != null &&
        responsavelId != null &&
        String(responsavelId) === String(usuarioId);
    $: podeDeletar = cargo === "admin" || proprio || ehResponsavel;

    $: recursoNome = ehEquipamento
        ? ag.equipamento_nome || ag.equipamento_id
        : ag.sala_nome || ag.sala_id;
    $: recursoIcone = ehEquipamento ? "devices" : "meeting_room";
    $: agendamentoCancelado = ag.status === "inativo";
    $: agendamentoPassado = !estaNoFuturo(ag.data_hora_inicio);

    function estaNoFuturo(dataHora) {
        if (!dataHora) return false;
        const data = new Date(String(dataHora).replace(" ", "T").slice(0, 19));
        return !Number.isNaN(data.getTime()) && data >= new Date();
    }

    function cancelarPeloModal(agendamento) {
        mostrarDetalhes = false;
        onDeletar?.(agendamento);
    }
</script>

{#if mostrarDetalhes}
    <AgendamentoDetalheModal
        {ag}
        {usuarioId}
        {cargo}
        onFechar={() => (mostrarDetalhes = false)}
        onCancelar={onDeletar && !agendamentoPassado && !agendamentoCancelado
            ? cancelarPeloModal
            : null}
    />
{/if}

<div
    class="ag-bloco-inner {proprio ? 'proprio' : 'outro'}"
    class:passado={agendamentoPassado}
    class:cancelado={agendamentoCancelado}
>
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

    {#if ag.turma_nome}
        <div class="ag-info">
            <span class="material-symbols-outlined ag-icon">groups</span>
            <span class="ag-label">{ag.turma_nome}</span>
        </div>
    {/if}

    <div class="ag-acoes">
        {#if onDeletar && podeDeletar && !agendamentoPassado && !agendamentoCancelado}
            <button
                class="btn-ag delete"
                on:click={() => onDeletar(ag)}
                title="Deletar"
            >
                <span class="material-symbols-outlined">delete</span>
            </button>
        {/if}
        <button
            type="button"
            class="btn-ag info"
            on:click={() => (mostrarDetalhes = true)}
            title="Ver detalhes"
            aria-label="Ver detalhes do agendamento"
        >
            <span class="material-symbols-outlined">info</span>
        </button>
    </div>
</div>

<style>
    .ag-bloco-inner {
        --neu-bg: var(--surface);

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
        border-left: 4px solid var(--confirm);
    }

    .ag-bloco-inner.outro {
        border-left: 4px solid var(--disabled-text);
    }

    .ag-bloco-inner.passado {
        background: var(--disabled);
        box-shadow:
            inset 3px 3px 6px
                color-mix(in srgb, var(--text-muted) 28%, transparent),
            inset -3px -3px 6px
                color-mix(in srgb, var(--white) 55%, transparent);
    }

    .ag-bloco-inner.passado .ag-hora,
    .ag-bloco-inner.passado .ag-label {
        color: var(--text-muted);
    }

    .ag-bloco-inner.cancelado {
        background: var(--cancel-light);
        border-left-color: var(--cancel);
        box-shadow:
            inset 3px 3px 6px
                color-mix(in srgb, var(--cancel-dark) 18%, transparent),
            inset -3px -3px 6px
                color-mix(in srgb, var(--white) 60%, transparent);
    }

    .ag-bloco-inner.cancelado .ag-hora,
    .ag-bloco-inner.cancelado .ag-icon,
    .ag-bloco-inner.cancelado .ag-label {
        color: var(--cancel-dark);
    }

    .ag-hora {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-dark);
    }

    .ag-info {
        display: flex;
        align-items: center;
        gap: 0.3rem;
    }

    .ag-icon {
        font-size: 0.9rem;
        color: var(--text-muted);
    }

    .ag-label {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-dark);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .ag-acoes {
        display: flex;
        justify-content: flex-end;
        gap: 0.4rem;
        margin-top: auto;
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
        color: var(--cancel);
    }

    .btn-ag.delete:hover {
        color: var(--cancel-dark);
    }

    /* Botão Info */
    .btn-ag.info {
        color: var(--text-muted);
    }

    .btn-ag.info:hover {
        color: var(--focus);
    }
    .btn-ag:active {
        box-shadow:
            inset 1px 1px 3px var(--neu-shadow-dark),
            inset -1px -1px 3px var(--neu-shadow-light);
    }
</style>
