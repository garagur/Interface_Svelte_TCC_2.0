<script>
    export let bloco;
    export let onRemover = null; // se passado, mostra botão de deletar
    export let mostrarTurma = false;
</script>

<div class="bloco-card">
    <div class="bloco-horario">
        {bloco.hora_inicio} - {bloco.hora_fim}
    </div>
    <div class="bloco-disciplina">
        {bloco.disciplina}
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
            <button class="btn-action delete" title="Remover">
                <span class="material-symbols-outlined">delete</span>
            </button>
        </div>
    {/if}
</div>

<style>
    .bloco-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.6rem 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.82rem;
    }

    .bloco-horario {
        font-weight: 700;
        font-size: 0.8rem;
        color: #334155;
    }

    .bloco-disciplina {
        font-weight: 600;
        color: #1e293b;
    }

    .bloco-professor,
    .bloco-turma {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: #64748b;
    }

    .bloco-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 0.25rem;
    }

    .btn-action.delete {
        background: none;
        border: none;
        cursor: pointer;
        color: #ef4444;
        padding: 0;
        display: flex;
        align-items: center;
    }

    .btn-action.delete:hover {
        color: #b91c1c;
    }
</style>
