<script>
    export let bloco = null;
    export let onConfirmar;
    export let onCancelar;
    export let processando = false;

    const ROTULOS_DIA = {
        segunda: "Segunda-feira",
        terca: "Terça-feira",
        quarta: "Quarta-feira",
        quinta: "Quinta-feira",
        sexta: "Sexta-feira",
        sabado: "Sábado",
        domingo: "Domingo",
    };

    function formatarHora(hora) {
        return String(hora || "")
            .split(":")
            .slice(0, 2)
            .join(":");
    }

    function cancelar() {
        if (!processando) onCancelar?.();
    }

    function confirmar() {
        if (!processando) onConfirmar?.();
    }
</script>

{#if bloco}
    <div
        class="modal-overlay"
        role="presentation"
        on:click={cancelar}
        on:keydown={(event) => event.key === "Escape" && cancelar()}
    >
        <div
            class="modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmacao-horario"
            tabindex="-1"
            on:click|stopPropagation
            on:keydown|stopPropagation
        >
            <div class="modal-header">
                <span class="material-symbols-outlined">warning</span>
                <h2 id="titulo-confirmacao-horario">
                    Excluir bloco de horário?
                </h2>
            </div>

            <p class="modal-descricao">
                Confirma a exclusão do bloco de
                <strong>{bloco.disciplina || "horário"}</strong> da grade semanal?
            </p>

            <div class="modal-detalhes">
                <span>{ROTULOS_DIA[bloco.dia_semana] || bloco.dia_semana}</span>
                <span>
                    {formatarHora(bloco.hora_inicio)} - {formatarHora(
                        bloco.hora_fim,
                    )}
                </span>
                <span>{bloco.sala_nome || "Sala não informada"}</span>
            </div>

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
                        Excluindo...
                    {:else}
                        <span class="material-symbols-outlined">delete</span>
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
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        background: var(--overlay);
    }

    .modal-box {
        width: min(440px, 100%);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1.5rem;
        border-radius: 16px;
        background: var(--surface);
        color: var(--text-dark);
        font-family: "Inter", Arial, sans-serif;
        box-shadow: 8px 8px 16px var(--shadow-dark-heavy);
    }

    .modal-header {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        color: var(--cancel-dark);
    }

    .modal-header .material-symbols-outlined {
        font-size: 1.4rem;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.1rem;
    }

    .modal-descricao {
        margin: 0;
        line-height: 1.5;
    }

    .modal-detalhes {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        color: var(--text-muted);
        font-size: 0.9rem;
    }

    .modal-detalhes span {
        padding: 0.4rem 0.65rem;
        border-radius: 8px;
        background: color-mix(in srgb, var(--neu-shadow-dark) 12%, transparent);
    }

    .modal-acoes {
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 0.25rem;
    }

    .btn-secondary,
    .btn-danger {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        padding: 0.65rem 1rem;
        border: 0;
        border-radius: 10px;
        font-family: "Inter", Arial, sans-serif;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition:
            box-shadow 0.15s ease,
            transform 0.1s ease,
            background-color 0.15s ease;
    }

    .btn-secondary {
        min-width: 112px;
        min-height: 44px;
        background: var(--surface);
        color: var(--primary-dark);
        border: 1px solid
            color-mix(in srgb, var(--neu-shadow-dark) 45%, transparent);
        box-shadow:
            6px 6px 12px var(--neu-shadow-dark),
            -6px -6px 12px var(--neu-shadow-light);
    }

    .btn-secondary:hover:not(:disabled) {
        box-shadow:
            4px 4px 8px var(--neu-shadow-dark),
            -4px -4px 8px var(--neu-shadow-light);
    }

    .btn-secondary:active:not(:disabled) {
        box-shadow:
            inset 3px 3px 6px var(--neu-shadow-dark),
            inset -3px -3px 6px var(--neu-shadow-light);
    }

    .btn-danger {
        background: var(--cancel);
        color: var(--white);
        box-shadow:
            5px 5px 10px var(--neu-shadow-dark),
            -5px -5px 10px var(--neu-shadow-light);
    }

    .btn-danger:hover:not(:disabled) {
        background: var(--cancel-dark);
        box-shadow:
            3px 3px 6px var(--neu-shadow-dark),
            -3px -3px 6px var(--neu-shadow-light);
    }

    .btn-danger:active:not(:disabled) {
        box-shadow:
            inset 3px 3px 6px var(--shadow-dark-strong),
            inset -3px -3px 5px var(--shadow-light-soft);
    }

    .btn-secondary:disabled,
    .btn-danger:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .spin {
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 420px) {
        .modal-acoes > button {
            flex: 1 1 100%;
        }
    }
</style>
