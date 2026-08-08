<script>
    export let agendamentos = [];
    export let carregandoLista = false;
    export let hojeStr = "";

    const LIMITE_VISIVEL = 2;

    /** @type {string|null} */
    let diaExpandido = null;

    function gerarDias() {
        const hoje = new Date();
        const diaSemana = hoje.getDay();
        const inicio = new Date(hoje);
        inicio.setDate(hoje.getDate() - diaSemana);
        inicio.setHours(0, 0, 0, 0);
        return Array.from({ length: 60 }, (_, i) => {
            const d = new Date(inicio);
            d.setDate(inicio.getDate() + i);
            return d;
        });
    }

    function gerarSemanas(dias) {
        const semanas = [];
        const primeiro = dias[0].getDay();
        const prefixo = Array(primeiro).fill(null);
        const todos = [...prefixo, ...dias];
        for (let i = 0; i < todos.length; i += 7) {
            semanas.push(todos.slice(i, i + 7));
        }
        return semanas;
    }

    function extrairHora(dtStr) {
        if (!dtStr) return "";
        return dtStr.slice(11, 16);
    }

    function formatarChave(date) {
        return date.toISOString().slice(0, 10);
    }

    function ehHoje(date) {
        if (!date) return false;
        return formatarChave(date) === hojeStr;
    }

    function toggleExpandir(chave) {
        diaExpandido = diaExpandido === chave ? null : chave;
    }

    const CABECALHO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    $: agendamentosPorData = agendamentos.reduce((acc, ag) => {
        const chave = ag.data_hora_inicio?.slice(0, 10);
        if (!chave) return acc;
        if (!acc[chave]) acc[chave] = [];
        acc[chave].push(ag);
        return acc;
    }, {});

    $: dias = gerarDias();
    $: semanas = gerarSemanas(dias);
</script>

{#if carregandoLista}
    <p class="estado-vazio">Carregando agendamentos...</p>
{:else}
    <div class="grade-wrapper">
        <div class="grade-cabecalho">
            {#each CABECALHO as dia}
                <div class="cabecalho-dia">{dia}</div>
            {/each}
        </div>
        <div class="grade-semanas">
            {#each semanas as semana}
                <div class="semana-row">
                    {#each semana as dia}
                        {@const chave = dia ? formatarChave(dia) : ""}
                        {@const ags = dia
                            ? agendamentosPorData[chave] || []
                            : []}
                        {@const expandido = !!chave && chave === diaExpandido}
                        <div
                            class="dia-celula {!dia ? 'dia-vazio' : ''} {dia &&
                            ehHoje(dia)
                                ? 'dia-hoje'
                                : ''} {expandido ? 'expandido' : ''}"
                        >
                            {#if dia}
                                <span
                                    class="dia-numero {ehHoje(dia)
                                        ? 'numero-hoje'
                                        : ''}"
                                >
                                    {dia.getDate()}
                                </span>
                                <div class="dia-conteudo">
                                    {#each ags as ag}
                                        <div
                                            class="ag-bloco {ag.tipo ?? 'sala'}"
                                        >
                                            <slot {ag} />
                                        </div>
                                    {/each}
                                </div>
                                {#if ags.length > LIMITE_VISIVEL || expandido}
                                    <button
                                        type="button"
                                        class="btn-expandir"
                                        title={expandido
                                            ? "Recolher"
                                            : "Ver todos os agendamentos"}
                                        on:click={() => toggleExpandir(chave)}
                                    >
                                        <span class="material-symbols-outlined">
                                            {expandido
                                                ? "expand_less"
                                                : "expand_more"}
                                        </span>
                                    </button>
                                {/if}
                            {/if}
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
{/if}
