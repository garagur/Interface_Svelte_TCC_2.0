<script>
    //Grade mensal de agendamentos
    export let agendamentos = [];
    export let carregandoLista = false;
    export let hojeStr = "";
    const LIMITE_VISIVEL = 1;
    /** @type {string|null} */
    let diaExpandido = null;
    let mesExibido = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
    );
    let pesquisaAg = "";
    let filtroStatusAg = "todos";
    let filtroTipoAg = "todos";
    let ordenacaoAg = "recente";

    function gerarDias(mes) {
        const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1);
        const deslocamento = inicioMes.getDay();
        const totalDias = new Date(
            mes.getFullYear(),
            mes.getMonth() + 1,
            0,
        ).getDate();
        const totalCelulas = Math.ceil((deslocamento + totalDias) / 7) * 7;

        return Array.from(
            { length: totalCelulas },
            (_, indice) =>
                new Date(
                    mes.getFullYear(),
                    mes.getMonth(),
                    indice - deslocamento + 1,
                ),
        );
    }
    function gerarSemanas(dias) {
        const semanas = [];
        const primeiro = dias[0].getDay();
        const prefixo = Array(primeiro).fill(null);
        const todos = [...prefixo, ...dias];
        const resto = todos.length % 7;
        if (resto !== 0) {
            const sufixo = Array(7 - resto).fill(null);
            todos.push(...sufixo);
        }
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
        const ano = date.getFullYear();
        const mes = String(date.getMonth() + 1).padStart(2, "0");
        const dia = String(date.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    }
    function chaveDataAgendamento(dataHora) {
        return dataHora ? String(dataHora).slice(0, 10) : "";
    }
    function ehHoje(date) {
        if (!date) return false;
        return formatarChave(date) === formatarChave(new Date());
    }
    function toggleExpandir(chave) {
        diaExpandido = diaExpandido === chave ? null : chave;
    }
    function mudarMes(delta) {
        mesExibido = new Date(
            mesExibido.getFullYear(),
            mesExibido.getMonth() + delta,
            1,
        );
        diaExpandido = null;
    }
    function parseData(dataHora) {
        if (!dataHora) return null;
        const data = new Date(String(dataHora).replace(" ", "T").slice(0, 19));
        return Number.isNaN(data.getTime()) ? null : data;
    }
    function statusExibicao(ag) {
        if (ag.status === "inativo") return "cancelado";
        const inicio = parseData(ag.data_hora_inicio);
        return inicio && inicio >= new Date() ? "ativo" : "finalizado";
    }
    function nomeAgendamento(ag) {
        return ag.tipo === "equipamento"
            ? ag.equipamento_nome || String(ag.equipamento_id || "")
            : ag.sala_nome || String(ag.sala_id || "");
    }
    function nomeResponsavel(ag) {
        return ag.user_nome || ag.usuario_nome || ag.professor_nome || "";
    }
    function mudarFiltroStatus(event) {
        filtroStatusAg = event.currentTarget.value;
    }
    function mudarFiltroTipo(event) {
        filtroTipoAg = event.currentTarget.value;
    }
    function mudarOrdenacao(event) {
        ordenacaoAg = event.currentTarget.value;
    }
    const CABECALHO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    $: agendamentosFiltrados = agendamentos
        .filter((ag) => {
            const termo = pesquisaAg.trim().toLowerCase();
            if (!termo) return true;
            return (
                nomeAgendamento(ag).toLowerCase().includes(termo) ||
                nomeResponsavel(ag).toLowerCase().includes(termo) ||
                String(ag.turma_nome || "")
                    .toLowerCase()
                    .includes(termo) ||
                String(ag.obs || "")
                    .toLowerCase()
                    .includes(termo)
            );
        })
        .filter((ag) => {
            if (filtroTipoAg === "todos") return true;
            return (
                (ag.tipo === "equipamento" ? "equipamento" : "sala") ===
                filtroTipoAg
            );
        })
        .filter((ag) => {
            if (filtroStatusAg === "todos") return true;
            return statusExibicao(ag) === filtroStatusAg;
        })
        .sort((a, b) => {
            if (ordenacaoAg === "az" || ordenacaoAg === "za") {
                const nomeA = nomeAgendamento(a).toLocaleLowerCase("pt-BR");
                const nomeB = nomeAgendamento(b).toLocaleLowerCase("pt-BR");
                return ordenacaoAg === "az"
                    ? nomeA.localeCompare(nomeB, "pt-BR")
                    : nomeB.localeCompare(nomeA, "pt-BR");
            }
            const dataA = parseData(a.data_hora_inicio)?.getTime() ?? 0;
            const dataB = parseData(b.data_hora_inicio)?.getTime() ?? 0;
            return ordenacaoAg === "recente" ? dataB - dataA : dataA - dataB;
        });
    $: agendamentosPorData = agendamentosFiltrados.reduce((acc, ag) => {
        const chave = chaveDataAgendamento(ag.data_hora_inicio);
        if (!chave) return acc;
        if (!acc[chave]) acc[chave] = [];
        acc[chave].push(ag);
        return acc;
    }, {});
    $: dias = gerarDias(mesExibido);
    $: semanas = gerarSemanas(dias);
    $: mesAnoLabel = mesExibido.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
    });
</script>

<div class="grade-mensal">
    {#if carregandoLista}
        <p class="estado-vazio">Carregando agendamentos...</p>
    {:else}
        <div class="grade-toolbar">
            <div class="grade-periodo">
                <button
                    type="button"
                    class="btn-mes"
                    aria-label="Mês anterior"
                    title="Mês anterior"
                    on:click={() => mudarMes(-1)}
                >
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <strong>{mesAnoLabel}</strong>
                <button
                    type="button"
                    class="btn-mes"
                    aria-label="Próximo mês"
                    title="Próximo mês"
                    on:click={() => mudarMes(1)}
                >
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
            </div>

            <div class="grade-filtros">
                <label class="grade-pesquisa">
                    <span class="material-symbols-outlined" aria-hidden="true"
                        >search</span
                    >
                    <input
                        type="search"
                        placeholder="Buscar agendamento..."
                        bind:value={pesquisaAg}
                        aria-label="Buscar agendamento"
                    />
                </label>
                <label class="grade-filtro">
                    <span>Status</span>
                    <select
                        value={filtroStatusAg}
                        on:change={mudarFiltroStatus}
                    >
                        <option value="todos">Todos</option>
                        <option value="ativo">Ativos</option>
                        <option value="finalizado">Concluídos</option>
                        <option value="cancelado">Cancelados</option>
                    </select>
                </label>
                <label class="grade-filtro">
                    <span>Tipo</span>
                    <select value={filtroTipoAg} on:change={mudarFiltroTipo}>
                        <option value="todos">Todos</option>
                        <option value="sala">Salas</option>
                        <option value="equipamento">Equipamentos</option>
                    </select>
                </label>
                <label class="grade-filtro">
                    <span>Ordenar</span>
                    <select value={ordenacaoAg} on:change={mudarOrdenacao}>
                        <option value="recente">Mais recente</option>
                        <option value="antigo">Mais antigo</option>
                        <option value="az">Nome (A-Z)</option>
                        <option value="za">Nome (Z-A)</option>
                    </select>
                </label>
            </div>
        </div>
        {#if agendamentosFiltrados.length === 0}
            <p class="grade-sem-resultados">
                Nenhum agendamento encontrado com os filtros selecionados.
            </p>
        {/if}
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
                            {@const expandido =
                                !!chave && chave === diaExpandido}
                            {@const visiveis = expandido
                                ? ags
                                : ags.slice(0, LIMITE_VISIVEL)}
                            <div
                                class="dia-celula {!dia
                                    ? 'dia-vazio'
                                    : ''} {dia && ehHoje(dia)
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
                                    <div class="dia-expandir-slot">
                                        {#if ags.length > LIMITE_VISIVEL || expandido}
                                            <button
                                                type="button"
                                                class="btn-expandir"
                                                class:aberto={expandido}
                                                aria-expanded={expandido}
                                                title={expandido
                                                    ? "Recolher"
                                                    : "Ver todos os agendamentos"}
                                                on:click={() =>
                                                    toggleExpandir(chave)}
                                            >
                                                <span
                                                    class="material-symbols-outlined"
                                                    aria-hidden="true"
                                                >
                                                    {expandido
                                                        ? "expand_less"
                                                        : "expand_more"}
                                                </span>
                                                <span>
                                                    {expandido
                                                        ? "Recolher"
                                                        : `Ver mais (${ags.length - LIMITE_VISIVEL})`}
                                                </span>
                                            </button>
                                        {/if}
                                    </div>
                                    <div class="dia-conteudo" class:expandido>
                                        {#each visiveis as ag}
                                            <div
                                                class="ag-bloco {ag.tipo ??
                                                    'sala'}"
                                            >
                                                <slot {ag} />
                                            </div>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>
