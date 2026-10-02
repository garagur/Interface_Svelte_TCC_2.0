<script>
    /** @type {{ tipo?: string, sala_nome?: string, sala_id?: number|string, equipamento_nome?: string, equipamento_id?: number|string, data_hora_inicio: string, data_hora_fim: string, obs?: string } | null} */
    export let agendamento = null;
    export let onConfirmar;
    export let onCancelar;
    export let processando = false;
    //ConfirmarDelecaoModal.svelte
    let justificativa = "";
    $: ehEquipamento = agendamento?.tipo === "equipamento";
    $: recursoNome = ehEquipamento
        ? agendamento?.equipamento_nome || agendamento?.equipamento_id
        : agendamento?.sala_nome || agendamento?.sala_id;

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
        if (processando) return;
        onConfirmar({ ...agendamento, justificativa: justificativa.trim() });
    }

    function cancelar() {
        if (processando) return;
        onCancelar();
    }
</script>

{#if agendamento}
    <div
        class="modal-overlay"
        on:click={cancelar}
        on:keydown={(e) => e.key === "Escape" && cancelar()}
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
                Deseja cancelar o agendamento do
                {ehEquipamento ? "equipamento" : "sala"}
                <strong>{recursoNome}</strong>?
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
                    disabled={processando}
                ></textarea>
            </div>

            <div class="modal-acoes">
                <button
                    class="btn-secondary"
                    on:click={cancelar}
                    disabled={processando}
                >
                    Cancelar
                </button>
                <button
                    class="btn-danger"
                    on:click={confirmar}
                    disabled={processando}
                >
                    {#if processando}
                        <span class="material-symbols-outlined spin"
                            >progress_activity</span
                        >
                        Cancelando...
                    {:else}
                        Confirmar exclusão
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: var(--overlay);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
    }

    .modal-box {
        --neu-bg: var(--surface);
        --neu-shadow-dark: var(--shadow-dark-heavy);

        background: var(--neu-bg);
        border-radius: 24px;
        padding: 28px 26px;
        width: min(420px, 90vw);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        box-shadow: 8px 8px 16px var(--neu-shadow-dark);
    }

    .modal-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--cancel-dark);
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
        color: var(--text-dark);
    }

    .modal-horario {
        margin: 0;
        font-family: "Inter", Arial, sans-serif;
        font-size: 0.875rem;
        color: var(--text-muted);
        background: color-mix(in srgb, var(--neu-shadow-dark) 12%, transparent);
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
        color: var(--text-dark);
    }

    .modal-campo textarea {
        font-family: "Inter", Arial, sans-serif;
        font-size: 0.9rem;
        color: var(--text-dark);
        background: var(--neu-bg);
        border: none;
        border-radius: 20px;
        padding: 14px 16px;
        resize: none;
        outline: none;
        box-shadow:
            inset 6px 6px 12px var(--neu-shadow-dark),
            inset -6px -6px 12px var(--neu-shadow-light);
        transition: box-shadow 0.2s ease;
    }

    .modal-campo textarea::placeholder {
        color: var(--disabled-text);
    }

    .modal-campo textarea:focus {
        box-shadow:
            inset 7px 7px 14px var(--neu-shadow-dark),
            inset -7px -7px 14px var(--neu-shadow-light),
            0 0 0 2px color-mix(in srgb, var(--cancel-dark) 15%, transparent);
    }

    .modal-campo textarea:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition:
            box-shadow 0.15s ease,
            transform 0.1s ease;
    }

    .btn-secondary {
        background: var(--neu-bg);
        color: var(--primary-dark);
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
        background: var(--cancel);
        color: var(--white);
        box-shadow:
            5px 5px 10px var(--neu-shadow-dark),
            -2px -2px 6px var(--neu-shadow-light);
    }

    .btn-danger:hover {
        background: var(--cancel-dark);
        box-shadow:
            3px 3px 6px var(--neu-shadow-dark),
            -1px -1px 4px var(--neu-shadow-light);
    }

    .btn-danger:active {
        box-shadow:
            inset 3px 3px 6px var(--shadow-dark-strong),
            inset -2px -2px 5px var(--shadow-light-soft);
    }

    .btn-secondary:disabled,
    .btn-danger:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        box-shadow: none;
        transform: none;
    }

    .spin {
        display: inline-block;
        animation: spin 0.8s linear infinite;
        font-size: 1.1rem;
        line-height: 1;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
