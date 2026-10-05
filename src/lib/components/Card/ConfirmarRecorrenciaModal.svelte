<script>
    /** @type {{ data: string, payload: Object }[] | null} */
    export let ocorrencias = null;

    export let enviando = false;

    /** @type {{ atual: number, total: number }} */
    export let progresso = { atual: 0, total: 0 };

    /** @type {{ sucesso: { data: string, criado: any }[], falha: { data: string, erro: string }[] } | null} */
    export let resultadoFinal = null;

    export let horaInicio = "";
    export let horaFim = "";
    export let onConfirmar;
    export let onCancelar;
</script>

{#if ocorrencias || resultadoFinal}
    <div class="modal-overlay">
        <div class="modal-recorrencia">
            {#if resultadoFinal}
                <h3>Resultado do agendamento</h3>
                <p class="msg-sucesso">
                    {resultadoFinal.sucesso.length} agendamento(s) criado(s) com
                    sucesso.
                </p>
                {#if resultadoFinal.falha.length > 0}
                    <p class="msg-erro">
                        {resultadoFinal.falha.length} falharam:
                    </p>
                    <ul class="lista-falhas">
                        {#each resultadoFinal.falha as f}
                            <li>{f.data}: {f.erro}</li>
                        {/each}
                    </ul>
                {/if}
                <div class="bottom-action">
                    <button class="btn-primary" on:click={onCancelar}>
                        Fechar
                    </button>
                </div>
            {:else}
                <h3>Confirmar {ocorrencias.length} agendamento(s)</h3>
                <ul class="lista-ocorrencias">
                    {#each ocorrencias as o}
                        <li>{o.data} — {horaInicio} às {horaFim}</li>
                    {/each}
                </ul>
                <p class="aviso-modal">
                    Alguns podem falhar caso já exista conflito de horário.
                </p>
                <div class="bottom-action">
                    <button
                        class="btn-secondary"
                        on:click={onCancelar}
                        disabled={enviando}
                    >
                        Cancelar
                    </button>
                    <button
                        class="btn-primary"
                        on:click={onConfirmar}
                        disabled={enviando}
                    >
                        {enviando
                            ? `Enviando ${progresso.atual}/${progresso.total}...`
                            : "Agendar"}
                    </button>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        background: rgba(15, 23, 42, 0.22);
        padding: 1rem;
        z-index: 40;
    }

    .modal-recorrencia {
        width: min(100%, 540px);
        background: var(--surface);
        border: 1px solid rgba(148, 163, 184, 0.25);
        border-radius: 20px;
        padding: 1.5rem 1.4rem 1.2rem;
        box-shadow:
            10px 10px 20px var(--shadow-dark-soft),
            -10px -10px 20px rgba(255, 255, 255, 0.8);
        font-family: "Inter", "Segoe UI", sans-serif;
        color: var(--text-dark);
    }

    .modal-recorrencia h3 {
        margin: 0 0 1rem;
        font-size: 1.3rem;
        font-weight: 700;
        color: var(--text-dark);
        font-family: inherit;
    }

    .lista-ocorrencias {
        margin: 0;
        padding-left: 1.3rem;
        list-style: disc;
        display: grid;
        gap: 0.45rem;
        color: var(--text-dark);
        font-size: 1rem;
        line-height: 1.6;
    }

    .aviso-modal {
        margin: 1rem 0 1.2rem;
        font-size: 0.88rem;
        color: var(--text-muted);
        line-height: 1.45;
    }

    .bottom-action {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.9rem;
        margin-top: 1.2rem;
    }

    .btn-primary,
    .btn-secondary {
        flex: 1;
        min-width: 150px;
        max-width: 200px;
        min-height: 46px;
        border: none;
        border-radius: 12px;
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
        box-shadow:
            6px 6px 12px rgba(163, 177, 198, 0.45),
            -6px -6px 12px rgba(255, 255, 255, 0.8);
    }

    .btn-primary {
        background: linear-gradient(145deg, #1dbf65, #14a04a);
        color: var(--white);
    }

    .btn-secondary {
        background: linear-gradient(145deg, #ef5656, #d93030);
        color: var(--white);
    }

    .btn-primary:hover,
    .btn-secondary:hover {
        transform: translateY(-1px);
    }

    .btn-primary:active,
    .btn-secondary:active {
        box-shadow:
            inset 4px 4px 8px rgba(0, 0, 0, 0.12),
            inset -4px -4px 8px rgba(255, 255, 255, 0.2);
        transform: translateY(0);
    }

    .btn-primary:disabled,
    .btn-secondary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    @media (max-width: 480px) {
        .modal-recorrencia {
            padding: 1.2rem 1rem 1rem;
        }

        .bottom-action {
            flex-direction: column;
        }

        .btn-primary,
        .btn-secondary {
            width: 100%;
            max-width: none;
        }
    }
</style>
