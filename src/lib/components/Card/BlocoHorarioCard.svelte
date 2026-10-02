<script>
    export let bloco;
    /** @type {((bloco: any) => void) | null} */
    export let onRemover = null;
    export let mostrarTurma = false;

    function formatarHora(hora) {
        return String(hora || "")
            .split(":")
            .slice(0, 2)
            .join(":");
    }
</script>

<div class="bloco-card">
    <div class="bloco-horario">
        {formatarHora(bloco.hora_inicio)} - {formatarHora(bloco.hora_fim)}
    </div>
    <div class="bloco-disciplina">
        {bloco.disciplina}
    </div>
    <div class="bloco-sala">
        <span class="material-symbols-outlined icon-tiny">meeting_room</span>
        {bloco.sala_nome || bloco.sala_id || "Sala não informada"}
    </div>
    <div class="bloco-professor">
        <span class="material-symbols-outlined icon-tiny">person</span>
        {bloco.professor?.name ?? bloco.professor_id}
    </div>
    {#if mostrarTurma}
        <div class="bloco-turma">
            <span class="material-symbols-outlined icon-tiny">groups</span>
            {bloco.turma_nome ?? bloco.turma_id ?? "—"}
        </div>
    {/if}
    {#if onRemover}
        <div class="bloco-actions">
            <button
                class="btn-action delete"
                title="Remover"
                on:click={() => onRemover(bloco)}
            >
                <span class="material-symbols-outlined">delete</span>
            </button>
        </div>
    {/if}
</div>

<style>
    .bloco-card {
        --neu-bg: var(--surface);

        background: var(--neu-bg);
        border: none;
        border-radius: 12px;
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-size: 0.82rem;
        font-family: "Inter", Arial, sans-serif;
        box-shadow:
            4px 4px 8px var(--neu-shadow-dark),
            -4px -4px 8px var(--neu-shadow-light);
        transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
    }

    .bloco-card:hover {
        box-shadow:
            2px 2px 5px var(--neu-shadow-dark),
            -2px -2px 5px var(--neu-shadow-light);
    }

    .bloco-horario {
        font-weight: 700;
        font-size: 0.8rem;
        color: var(--text-dark);
    }

    .bloco-disciplina {
        font-weight: 600;
        color: var(--text-dark);
    }

    .bloco-sala,
    .bloco-professor,
    .bloco-turma {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        color: var(--text-muted);
        font-size: 0.78rem;
    }

    .icon-tiny {
        font-size: 1rem;
    }

    .bloco-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 0.25rem;
    }

    .btn-action.delete {
        background: var(--neu-bg);
        border: none;
        cursor: pointer;
        color: var(--cancel);
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow:
            2px 2px 5px var(--neu-shadow-dark),
            -2px -2px 5px var(--neu-shadow-light);
        transition:
            box-shadow 0.15s ease,
            color 0.15s ease;
    }

    .btn-action.delete .material-symbols-outlined {
        font-size: 1.05rem;
    }

    .btn-action.delete:hover {
        color: var(--cancel-dark);
        box-shadow:
            1px 1px 3px var(--neu-shadow-dark),
            -1px -1px 3px var(--neu-shadow-light);
    }

    .btn-action.delete:active {
        box-shadow:
            inset 2px 2px 4px var(--neu-shadow-dark),
            inset -2px -2px 4px var(--neu-shadow-light);
    }
</style>
