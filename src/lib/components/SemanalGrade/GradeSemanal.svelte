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
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 0.75rem;
    }
    .dia-coluna {
        flex: 1;
        min-width: 120px;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .dia-coluna.fds {
        background: #f1f1f1;
        border-radius: 10px;
        padding: 0.5rem;
        opacity: 0.75;
    }

    .dia-header {
        font-weight: 700;
        font-size: 0.85rem;
        color: #475569;
        text-align: center;
        padding: 0.4rem;
        background: #e2e8f0;
        border-radius: 6px;
    }

    .dia-coluna.fds .dia-header {
        background: #cbd5e1;
        color: #64748b;
    }

    .dia-blocos {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .bloco-vazio {
        text-align: center;
        color: #cbd5e1;
        font-size: 1.2rem;
        padding: 1rem 0;
    }

    .estado-vazio {
        text-align: center;
        color: #94a3b8;
        padding: 2rem;
    }
</style>
