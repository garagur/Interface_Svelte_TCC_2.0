<script>
    export let agendamento = null;
    export let conflitos = [];
    export let onConfirmar = null;
    export let onCancelar = null;
    export let processando = false;

    let justificativa = "";
    let erro = "";

    $: if (!agendamento) {
        justificativa = "";
        erro = "";
    }

    function formatarDataHora(iso) {
        if (!iso) return "—";

        const data = new Date(String(iso).replace(" ", "T").slice(0, 19));
        if (Number.isNaN(data.getTime())) return "—";

        return `${data.toLocaleDateString("pt-BR")} às ${data.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit",
            },
        )}`;
    }

    async function confirmar() {
        if (processando || !onConfirmar) return;

        erro = "";
        try {
            await onConfirmar({
                agendamento,
                conflitos,
                justificativa: justificativa.trim(),
            });
        } catch (e) {
            erro = e?.message || "Erro ao confirmar o agendamento.";
        }
    }

    function cancelar() {
        if (processando || !onCancelar) return;
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
                <h3>Conflito com agendamento ocioso</h3>
            </div>

            <p class="modal-descricao">
                Já existe(m) <strong>{conflitos.length}</strong> agendamento(s) ocioso(s)
                para o mesmo horário e item. Ao confirmar este, o(s) em disputa será(ão)
                cancelado(s).
            </p>

            <div class="lista-conflitos">
                {#each conflitos as conflito}
                    <div class="item-conflito">
                        <span class="material-symbols-outlined">schedule</span>
                        <div>
                            <strong>
                                {conflito.usuario_nome ||
                                    conflito.user_nome ||
                                    "Agendamento"}
                            </strong>
                            <span
                                >{formatarDataHora(conflito.data_hora_inicio)} →
                                {formatarDataHora(conflito.data_hora_fim)}</span
                            >
                        </div>
                    </div>
                {/each}
            </div>

            <div class="modal-campo">
                <label for="justificativa-conflito">
                    Justificativa do cancelamento do agendamento ocioso
                </label>
                <textarea
                    id="justificativa-conflito"
                    bind:value={justificativa}
                    placeholder="Descreva o motivo do cancelamento do agendamento em disputa..."
                    rows="3"
                    disabled={processando}
                ></textarea>
            </div>

            {#if erro}
                <p class="erro" role="alert">{erro}</p>
            {/if}

            <div class="modal-acoes">
                <button
                    type="button"
                    class="btn-secondary"
                    on:click={cancelar}
                    disabled={processando}
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    class="btn-danger"
                    on:click={confirmar}
                    disabled={processando}
                >
                    {#if processando}
                        <span class="material-symbols-outlined spin"
                            >progress_activity</span
                        >
                        Confirmando...
                    {:else}
                        Confirmar e cancelar ocioso
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
        --neu-shadow-light: var(--shadow-light-heavy);
        background: var(--neu-bg);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 24px;
        padding: 28px 26px;
        width: min(460px, 90vw);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        box-shadow: 10px 10px 18px var(--neu-shadow-dark);
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
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: var(--neu-bg);
        box-shadow: 6px 6px 12px var(--shadow-dark-heavy);
        flex-shrink: 0;
    }

    .modal-header h3 {
        margin: 0;
        font-size: 1.12rem;
        font-family: "Inter", "Segoe UI", Arial, sans-serif;
        font-weight: 700;
    }

    .modal-descricao,
    .item-conflito,
    .modal-campo label,
    .erro {
        font-family: "Inter", "Segoe UI", Arial, sans-serif;
    }

    .modal-descricao {
        margin: 0;
        color: var(--text-dark);
        line-height: 1.5;
    }

    .lista-conflitos {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 0.25rem;
    }

    .item-conflito {
        display: flex;
        align-items: flex-start;
        gap: 0.6rem;
        padding: 0.75rem 0.9rem;
        background: rgba(245, 158, 11, 0.07);
        border: 1px solid rgba(245, 158, 11, 0.22);
        border-radius: 12px;
        box-shadow: none;
    }

    .item-conflito .material-symbols-outlined {
        color: var(--warning);
        font-size: 1.1rem;
        margin-top: 0.15rem;
    }

    .item-conflito div {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        color: var(--text-dark);
        font-size: 0.85rem;
    }

    .modal-campo {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .modal-campo label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-dark);
    }

    textarea {
        width: 100%;
        resize: vertical;
        min-height: 88px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 12px;
        padding: 0.8rem 0.9rem;
        font: inherit;
        font-family: "Inter", "Segoe UI", Arial, sans-serif;
        background: rgba(255, 255, 255, 0.12);
        color: var(--text-dark);
        box-sizing: border-box;
        box-shadow: inset 3px 3px 7px rgba(163, 177, 198, 0.24);
    }

    textarea:focus {
        outline: 2px solid rgba(59, 130, 246, 0.22);
        border-color: rgba(59, 130, 246, 0.35);
    }

    .modal-acoes {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.25rem;
    }

    .btn-secondary,
    .btn-danger {
        border: none;
        border-radius: 12px;
        padding: 0.8rem 1rem;
        font-weight: 700;
        font-family: "Inter", "Segoe UI", Arial, sans-serif;
        cursor: pointer;
        transition:
            opacity 0.2s ease,
            transform 0.15s ease;
        box-shadow: 6px 6px 12px var(--shadow-dark-heavy);
    }

    .btn-secondary {
        background: var(--surface);
        color: var(--text-dark);
    }

    .btn-danger {
        background: var(--cancel);
        color: var(--white);
    }

    .btn-secondary:active,
    .btn-danger:active {
        transform: translateY(1px);
        box-shadow:
            inset 4px 4px 8px rgba(0, 0, 0, 0.12),
            inset -4px -4px 8px rgba(255, 255, 255, 0.3);
    }

    .btn-danger:disabled,
    .btn-secondary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .spin {
        animation: spin 1s linear infinite;
        margin-right: 0.35rem;
        font-size: 1rem;
    }

    .erro {
        margin: 0;
        color: var(--cancel-dark);
        background: color-mix(in srgb, var(--cancel) 10%, transparent);
        border-radius: 10px;
        padding: 0.7rem 0.8rem;
        font-size: 0.85rem;
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
