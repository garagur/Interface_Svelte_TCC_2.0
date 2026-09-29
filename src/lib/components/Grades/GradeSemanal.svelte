<script>
    import "$lib/styles/grade-semanal.css";
    import { createEventDispatcher } from "svelte";

    export let dias = [];
    export let blocos = [];
    export let carregandoLista = false;
    export let filtrarPor = null; // ex: { campo: 'turma_id', valor: turma_id }
    export let anoInicial = new Date().getFullYear();
    export let filtrarPorAno = true;

    const dispatch = createEventDispatcher();
    let anoSelecionado = anoInicial;

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

    function agruparPorDia(blocos, ano, filtrarPor, filtrarPorAno) {
        const grupos = {};
        for (const b of blocos) {
            const anoTurma =
                b.turma_ano_letivo ??
                b.turma_ano ??
                b.ano_letivo ??
                b.turma?.ano_letivo ??
                b.turma?.ano;
            if (
                filtrarPorAno &&
                anoTurma !== null &&
                anoTurma !== undefined &&
                anoTurma !== "" &&
                Number(anoTurma) !== Number(ano)
            ) {
                continue;
            }
            if (
                filtrarPor &&
                filtrarPor.valor != null &&
                b[filtrarPor.campo] != filtrarPor.valor
            )
                continue;
            (grupos[b.dia_semana] ??= []).push(b);
        }
        for (const dia in grupos) {
            grupos[dia].sort((a, b) =>
                a.hora_inicio.localeCompare(b.hora_inicio),
            );
        }
        return grupos;
    }

    $: blocosPorDia = agruparPorDia(
        blocos,
        anoSelecionado,
        filtrarPor,
        filtrarPorAno,
    );

    function mudarAno(delta) {
        anoSelecionado += delta;
        dispatch("mudarAno", anoSelecionado);
    }
</script>

{#if carregandoLista}
    <p class="estado-vazio">Carregando horários...</p>
{:else}
    <div class="grade-semanal">
        <div class="grade-header">
            <h3>
                <span class="material-symbols-outlined">calendar_month</span> Grade
                Semanal
            </h3>

            {#if filtrarPorAno}
                <div class="seletor-ano">
                    <button
                        type="button"
                        on:click={() => mudarAno(-1)}
                        aria-label="Ano anterior"
                    >
                        <span class="material-symbols-outlined"
                            >chevron_left</span
                        >
                    </button>
                    <span class="ano-valor">{anoSelecionado}</span>
                    <button
                        type="button"
                        on:click={() => mudarAno(1)}
                        aria-label="Próximo ano"
                    >
                        <span class="material-symbols-outlined"
                            >chevron_right</span
                        >
                    </button>
                </div>
            {/if}
        </div>
        <div class="grade-wrapper">
            {#each dias as dia}
                <div
                    class="dia-coluna {diasFimDeSemana.includes(dia)
                        ? 'fds'
                        : ''}"
                >
                    <div class="dia-header">{diasLabels[dia]}</div>
                    <div class="dia-blocos">
                        {#each blocosPorDia[dia] ?? [] as bloco (bloco.id)}
                            <slot {bloco} />
                        {:else}
                            <div class="bloco-vazio">—</div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    </div>
{/if}
