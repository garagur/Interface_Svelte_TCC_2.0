<script>
    import "$lib/styles/grade-semanal.css";
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
