<script>
    /** @type {{ sala_nome?: string, sala_id?: number|string, data_hora_inicio: string, data_hora_fim: string, obs?: string } | null} */
    export let agendamento = null;
    export let onConfirmar;
    export let onCancelar;

    let justificativa = "";

    $: if (!agendamento) {
        justificativa = "";
    }

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

    function confirmar() {
        onConfirmar({ ...agendamento, justificativa: justificativa.trim() });
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
                <span class="icon-wrapper">
                    <span class="material-symbols-outlined">warning</span>
                </span>
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

            <div class="modal-campo">
                <label for="justificativa">Justificativa do cancelamento</label>
                <textarea
                    id="justificativa"
                    bind:value={justificativa}
                    placeholder="Descreva o motivo do cancelamento..."
                    rows="3"
                ></textarea>
            </div>

            <div class="modal-acoes">
                <button class="btn-secondary" on:click={onCancelar}>
                    Cancelar
                </button>
                <button class="btn-danger" on:click={confirmar}>
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
        --neu-bg: #e6e9ef;
        --neu-shadow-dark: rgba(163, 177, 198, 0.65);
        background: var(--neu-bg);
        border-radius: 24px;
        padding: 28px 26px;
        width: min(420px, 90vw);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        box-shadow:
            9px 9px 18px var(--neu-shadow-dark),
            -9px -9px 18px var(--neu-shadow-dark);
    }

    .modal-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--cancel-dark, #b3261e);
    }

    .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--neu-bg);
        box-shadow:
            4px 4px 8px var(--neu-shadow-dark),
            -4px -4px 8px var(--neu-shadow-light);
        flex-shrink: 0;
    }

    .icon-wrapper .material-symbols-outlined {
        font-size: 1.2rem;
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
        color: var(--text-dark, #2b2f38);
    }

    .modal-horario {
        margin: 0;
        font-family: "Inter", Arial, sans-serif;
        font-size: 0.875rem;
        color: var(--text-muted, #6b7280);
        background: rgba(163, 177, 198, 0.12);
        padding: 8px 12px;
        border-radius: 10px;
        width: fit-content;
    }

    .modal-campo {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .modal-campo label {
        font-family: "Inter", Arial, sans-serif;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-dark, #2b2f38);
    }

    .modal-campo textarea {
        font-family: "Inter", Arial, sans-serif;
        font-size: 0.9rem;
        color: var(--text-dark, #2b2f38);
        background: var(--neu-bg);
        border: none;
        border-radius: 14px;
        padding: 12px 14px;
        resize: none;
        outline: none;
        box-shadow:
            inset 4px 4px 8px var(--neu-shadow-dark),
            inset -4px -4px 8px var(--neu-shadow-light);
    }

    .modal-campo textarea::placeholder {
        color: var(--text-muted, #9aa0a8);
    }

    .modal-campo textarea:focus {
        box-shadow:
            inset 5px 5px 10px var(--neu-shadow-dark),
            inset -5px -5px 10px var(--neu-shadow-light),
            0 0 0 2px rgba(179, 38, 30, 0.25);
    }

    .modal-acoes {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.5rem;
    }

    .btn-secondary,
    .btn-danger {
        border: none;
        border-radius: 14px;
        padding: 10px 20px;
        font-size: 0.9rem;
        font-weight: 600;
        font-family: "Inter", Arial, sans-serif;
        cursor: pointer;
        transition:
            box-shadow 0.15s ease,
            transform 0.1s ease;
    }

    .btn-secondary {
        background: var(--neu-bg);
        color: var(--primary-dark, #3a3f4b);
        box-shadow:
            5px 5px 10px var(--neu-shadow-dark),
            -5px -5px 10px var(--neu-shadow-light);
    }

    .btn-secondary:hover {
        box-shadow:
            3px 3px 6px var(--neu-shadow-dark),
            -3px -3px 6px var(--neu-shadow-light);
    }

    .btn-secondary:active {
        box-shadow:
            inset 3px 3px 6px var(--neu-shadow-dark),
            inset -3px -3px 6px var(--neu-shadow-light);
    }

    .btn-danger {
        background: var(--cancel, #d92d20);
        color: #fff;
        box-shadow:
            5px 5px 10px var(--neu-shadow-dark),
            -2px -2px 6px var(--neu-shadow-light);
    }

    .btn-danger:hover {
        background: var(--cancel-dark, #b3261e);
        box-shadow:
            3px 3px 6px var(--neu-shadow-dark),
            -1px -1px 4px var(--neu-shadow-light);
    }

    .btn-danger:active {
        box-shadow:
            inset 3px 3px 6px rgba(0, 0, 0, 0.35),
            inset -2px -2px 5px rgba(255, 255, 255, 0.15);
    }
</style>
