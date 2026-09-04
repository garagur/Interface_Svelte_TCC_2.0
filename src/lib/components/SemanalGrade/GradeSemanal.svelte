<script>
    export let dias = [];
    export let blocos = [];
    export let carregandoLista = false;
    export let filtrarPor = null; // ex: { campo: 'turma_id', valor: turma_id }

    const diasLabels = {
        domingo: "Domingo",
        segunda: "Segunda",
        terca: "Terça",
        quarta: "Quarta",
        quinta: "Quinta",
        sexta: "Sexta",
        sabado: "Sábado",
    };

    const diasFimDeSemana = ["sabado", "domingo"];

    function blocosOrdenados(dia) {
        return blocos
            .filter((b) => {
                if (b.dia_semana !== dia) return false;
                if (filtrarPor && filtrarPor.valor != null) {
                    return b[filtrarPor.campo] == filtrarPor.valor;
                }
                return true;
            })
            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
    }
</script>

{#if carregandoLista}
    <p class="estado-vazio">Carregando horários...</p>
{:else}
    <div class="grade-wrapper">
        {#each dias as dia}
            <div
                class="dia-coluna {diasFimDeSemana.includes(dia) ? 'fds' : ''}"
            >
                <div class="dia-header">{diasLabels[dia]}</div>
                <div class="dia-blocos">
                    {#each blocosOrdenados(dia) as bloco}
                        <slot {bloco} />
                    {:else}
                        <div class="bloco-vazio">—</div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
{/if}

<style>
    .grade-wrapper {
        --neu-bg: #e6e9ef;
        --neu-shadow-dark: rgba(163, 177, 198, 0.55);
        --neu-shadow-light: rgba(255, 255, 255, 0.85);

        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 1rem;
        padding: 0.5rem;
    }

    .dia-coluna {
        flex: 1;
        min-width: 120px;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        background: var(--neu-bg);
        padding: 0.75rem;
        border-radius: 16px;
        /* Coluna levemente destacada */
        box-shadow:
            5px 5px 10px var(--neu-shadow-dark),
            -5px -5px 10px var(--neu-shadow-light);
    }

    /* Estilo para Fim de Semana (Efeito Afundado / Inset) */
    .dia-coluna.fds {
        background: var(--neu-bg);
        opacity: 0.8;
        box-shadow:
            inset 3px 3px 6px var(--neu-shadow-dark),
            inset -3px -3px 6px var(--neu-shadow-light);
    }

    .dia-header {
        font-family: "Inter", Arial, sans-serif;
        font-weight: 700;
        font-size: 0.85rem;
        color: #475569;
        text-align: center;
        padding: 0.5rem;
        background: var(--neu-bg);
        border-radius: 10px;
        /* Header das colunas em relevo suave */
        box-shadow:
            3px 3px 6px var(--neu-shadow-dark),
            -3px -3px 6px var(--neu-shadow-light);
    }

    .dia-coluna.fds .dia-header {
        color: #64748b;
        /* Header no FDS ligeiramente neutro */
        box-shadow:
            2px 2px 4px var(--neu-shadow-dark),
            -2px -2px 4px var(--neu-shadow-light);
    }

    .dia-blocos {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
    }

    .bloco-vazio {
        text-align: center;
        color: #a0aec0;
        font-size: 1.1rem;
        padding: 1rem 0;
        border-radius: 10px;
        /* Slot vazio afundado */
        box-shadow:
            inset 2px 2px 4px var(--neu-shadow-dark),
            inset -2px -2px 4px var(--neu-shadow-light);
    }

    .estado-vazio {
        text-align: center;
        font-family: "Inter", Arial, sans-serif;
        color: #94a3b8;
        padding: 2rem;
    }
</style>
