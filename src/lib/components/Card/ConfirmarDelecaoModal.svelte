<script>
    /** @type {{ sala_nome?: string, sala_id?: number|string, data_hora_inicio: string, data_hora_fim: string, obs?: string } | null} */
    export let agendamento = null;
    export let onConfirmar;
    export let onCancelar;

    function formatarDataHora(iso) {
        if (!iso) return "—";
        const d = new Date(iso);
        const data = d.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        const hora = d.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
        return `${data} às ${hora}`;
    }
</script>

{#if agendamento}
    <div
        class="modal-overlay"
        on:click={onCancelar}
        on:keydown={(e) => e.key === "Escape" && onCancelar()}
        role="button"
        tabindex="-1"
        aria-label="Fechar modal"
    >
        <div
            class="modal-box"
            on:click|stopPropagation
            on:keydown|stopPropagation
            role="dialog"
            aria-modal="true"
            tabindex="-1"
        >
            <div class="modal-header">
                <span class="material-symbols-outlined">warning</span>
                <h3>Confirmar cancelamento</h3>
            </div>

            <p class="modal-descricao">
                Deseja cancelar o agendamento da sala
                <strong>{agendamento.sala_nome || agendamento.sala_id}</strong>?
            </p>
            <p class="modal-horario">
                {formatarDataHora(agendamento.data_hora_inicio)}
                &nbsp;→&nbsp;
                {formatarDataHora(agendamento.data_hora_fim)}
            </p>

            <div class="modal-acoes">
                <button class="btn-secondary" on:click={onCancelar}>
                    Cancelar
                </button>
                <button
                    class="btn-danger"
                    on:click={() => onConfirmar(agendamento)}
                >
                    Confirmar exclusão
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
    }

    .modal-box {
        background: var(--white);
        border-radius: var(--card-radius);
        padding: var(--card-padding);
        width: min(420px, 90vw);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        box-shadow: var(--card-shadow-elevated);
    }

    .modal-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--cancel-dark);
    }

    .modal-header h3 {
        margin: 0;
        font-size: 1.1rem;
        font-family: "Inter", Arial, sans-serif;
    }

    .modal-descricao {
        margin: 0;
        font-family: "Inter", Arial, sans-serif;
        font-size: 0.95rem;
        color: var(--text-dark);
    }

    .modal-horario {
        margin: 0;
        font-family: "Inter", Arial, sans-serif;
        font-size: 0.875rem;
        color: var(--text-muted);
    }

    .modal-acoes {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.5rem;
    }

    .btn-secondary {
        background: var(--primary-light);
        color: var(--primary-dark);
        border: none;
        border-radius: var(--btn-radius-sm);
        padding: 10px 18px;
        font-size: 0.9rem;
        font-weight: 600;
        font-family: "Inter", Arial, sans-serif;
        cursor: pointer;
    }

    .btn-secondary:hover {
        background: var(--border-input);
    }

    .btn-danger {
        background: var(--cancel);
        color: var(--white);
        border: none;
        border-radius: var(--btn-radius-sm);
        padding: 10px 18px;
        font-size: 0.9rem;
        font-weight: 600;
        font-family: "Inter", Arial, sans-serif;
        cursor: pointer;
    }

    .btn-danger:hover {
        background: var(--cancel-dark);
    }
</style>
