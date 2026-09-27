<script>
    import ConfirmarDelecaoModal from "$lib/components/Card/ConfirmarDelecaoModal.svelte";
    import ListaAgendamentosCard from "$lib/components/Card/ListaAgendamentosCard.svelte";
    import GradeSemanal from "$lib/components/Grades/GradeSemanal.svelte";
    import BlocoCard from "$lib/components/Card/BlocoHorarioCard.svelte";

    // Seletor de tipo/item
    export let tipo = "sala";
    /** @type {((tipo: "sala" | "equipamento" | "usuario") => void) | null} */
    export let onTipoChange = null;
    export let rotuloSelecionar = "Selecione um item";
    export let itensDisponiveis = [];
    export let carregandoItens = false;
    export let itemSelecionadoId = null;
    /** @type {((id: string) => void) | null} */
    export let onItemChange = null;

    // Dados do item selecionado
    /**
     * @type {{ id: any, nome: string, fotoUrl: string|null, formaFoto: "circular"|"quadrada", status: boolean, campos: Array<{icone:string,label:string,valor:string}> } | null}
     */
    export let item = null;
    export let carregandoItem = false;

    // Estatísticas
    /**
     * @type {{ resumo: Array<{valor:number,label:string}>, destaques: Array<{icone:string,label:string,valor:string}>, heatmap: Array<{data:string,quantidade:number}> }}
     */
    export let estatisticas = { resumo: [], destaques: [], heatmap: [] };
    export let carregandoEstatisticas = false;

    // Grade
    export let mostrarGrade = false;
    export let tituloGrade = "Grade de Aulas";
    export let blocos = [];
    export let carregandoBlocos = false;
    export let mostrarTurmaGrade = true;

    // Agendamentos
    export let agendamentos = [];
    export let carregandoAgendamentos = false;
    export let erro = "";
    export let onSair;
    /** @type {((ag: any) => Promise<void> | void) | null} */
    export let onDeletar = null;

    let agendamentoParaDeletar = null;
    let processando = false;

    const dias = [
        "segunda",
        "terca",
        "quarta",
        "quinta",
        "sexta",
        "sabado",
        "domingo",
    ];

    const NOMES_MESES = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
    ];

    let anoSelecionado = new Date().getFullYear();

    function anoAnterior() {
        anoSelecionado -= 1;
    }
    function anoSeguinte() {
        anoSelecionado += 1;
    }
    function irParaAnoAtual() {
        anoSelecionado = new Date().getFullYear();
    }

    function abrirModal(ag) {
        if (processando) return;
        agendamentoParaDeletar = ag;
    }
    function fecharModal() {
        if (processando) return;
        agendamentoParaDeletar = null;
    }

    async function confirmarDelecao(ag) {
        if (processando) return;
        processando = true;
        try {
            await onDeletar?.(ag);
            agendamentoParaDeletar = null;
        } catch (e) {
            erro = e?.message || "Erro ao deletar agendamento.";
        } finally {
            processando = false;
        }
    }

    function iniciais(nome) {
        if (!nome) return "?";
        const partes = nome.trim().split(/\s+/);
        const primeiras = partes
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase() ?? "");
        return primeiras.join("") || "?";
    }

    function nivelHeatmap(quantidade) {
        if (!quantidade) return 0;
        if (quantidade === 1) return 1;
        if (quantidade === 2) return 2;
        if (quantidade <= 4) return 3;
        return 4;
    }

    function montarSemanas(heatmap, ano) {
        const mapa = new Map(
            (heatmap || []).map((h) => [h.data, h.quantidade]),
        );

        const inicioAno = new Date(ano, 0, 1);
        const fimAno = new Date(ano, 11, 31);

        const inicio = new Date(inicioAno);
        inicio.setDate(inicio.getDate() - inicio.getDay());

        const fim = new Date(fimAno);
        fim.setDate(fim.getDate() + (6 - fim.getDay()));

        const diasArr = [];
        const cursor = new Date(inicio);
        while (cursor <= fim) {
            const chave = cursor.toISOString().slice(0, 10);
            diasArr.push({
                data: chave,
                dia: cursor.getDate(),
                mes: cursor.getMonth(),
                foraDoAno: cursor.getFullYear() !== ano,
                quantidade: mapa.get(chave) || 0,
            });
            cursor.setDate(cursor.getDate() + 1);
        }

        const semanas = [];
        for (let i = 0; i < diasArr.length; i += 7) {
            semanas.push(diasArr.slice(i, i + 7));
        }
        return semanas;
    }

    $: semanasHeatmap = montarSemanas(estatisticas?.heatmap, anoSelecionado);

    $: rotulosMeses = semanasHeatmap.map((semana, idx) => {
        const primeiroDia = semana[0];
        if (!primeiroDia) return "";
        if (idx === 0) return NOMES_MESES[primeiroDia.mes];
        const mesAnterior = semanasHeatmap[idx - 1][0]?.mes;
        return primeiroDia.mes !== mesAnterior
            ? NOMES_MESES[primeiroDia.mes]
            : "";
    });
</script>

<ConfirmarDelecaoModal
    agendamento={agendamentoParaDeletar}
    onConfirmar={confirmarDelecao}
    onCancelar={fecharModal}
    {processando}
/>

<div class="item-informacoes">
    <div class="scaffold">
        <header class="app-bar">
            <div class="title-section">
                <h1>Portal de Agendamento</h1>
                <span>Detalhes do Item</span>
            </div>
            <button class="btn-icon" on:click={onSair} title="Voltar">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
        </header>

        <main class="page-content">
            {#if erro}
                <p class="msg-erro">{erro}</p>
            {/if}

            <!-- Seletor de tipo e item -->
            <div class="card seletor-card">
                <div class="seletor-item">
                    <select
                        class="seletor-dropdown"
                        value={itemSelecionadoId ?? ""}
                        on:change={(e) => onItemChange?.(e.currentTarget.value)}
                        disabled={carregandoItens}
                    >
                        <option value="" disabled selected={!itemSelecionadoId}>
                            {rotuloSelecionar}
                        </option>
                        {#each itensDisponiveis as it (it.id)}
                            <option value={it.id}>{it.nome}</option>
                        {/each}
                    </select>

                    <div class="seletor-tipos">
                        <button
                            type="button"
                            class="btn-tipo"
                            class:ativo={tipo === "sala"}
                            on:click={() => onTipoChange?.("sala")}
                        >
                            <span class="material-symbols-outlined"
                                >meeting_room</span
                            >
                            Salas
                        </button>
                        <button
                            type="button"
                            class="btn-tipo"
                            class:ativo={tipo === "equipamento"}
                            on:click={() => onTipoChange?.("equipamento")}
                        >
                            <span class="material-symbols-outlined"
                                >devices</span
                            >
                            Equipamentos
                        </button>
                        <button
                            type="button"
                            class="btn-tipo"
                            class:ativo={tipo === "usuario"}
                            on:click={() => onTipoChange?.("usuario")}
                        >
                            <span class="material-symbols-outlined">person</span
                            >
                            Usuários
                        </button>
                    </div>
                </div>
            </div>

            <!-- Dados do item -->
            <div class="card" id="dados">
                <div class="card-header">
                    <span class="material-symbols-outlined">info</span>
                    <h3>Dados</h3>
                </div>

                {#if carregandoItem}
                    <p class="estado-vazio">Carregando dados...</p>
                {:else if !item}
                    <p class="estado-vazio">
                        Selecione um item acima para ver os detalhes.
                    </p>
                {:else}
                    <div class="item-conteudo">
                        <div class="item-foto-area">
                            {#if item.fotoUrl}
                                <img
                                    class="item-foto {item.formaFoto ===
                                    'quadrada'
                                        ? 'foto-quadrada'
                                        : 'foto-circular'}"
                                    src={item.fotoUrl}
                                    alt="Foto de {item.nome}"
                                />
                            {:else}
                                <div
                                    class="item-foto-placeholder {item.formaFoto ===
                                    'quadrada'
                                        ? 'foto-quadrada'
                                        : 'foto-circular'}"
                                >
                                    {iniciais(item.nome)}
                                </div>
                            {/if}
                        </div>

                        <div class="item-dados">
                            <div class="item-nome-linha">
                                <p class="item-nome">{item.nome}</p>
                                {#if item.status === false}
                                    <span class="badge-inativo">Inativo</span>
                                {/if}
                            </div>
                            {#each item.campos as campo}
                                <div class="perfil-info-linha">
                                    <span class="material-symbols-outlined"
                                        >{campo.icone}</span
                                    >
                                    {campo.label}: {campo.valor}
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Estatísticas -->
            <div class="card" id="estatisticas">
                <div class="card-header">
                    <span class="material-symbols-outlined">query_stats</span>
                    <h3>Estatísticas</h3>
                </div>

                {#if carregandoEstatisticas}
                    <p class="estado-vazio">Carregando estatísticas...</p>
                {:else if !item}
                    <p class="estado-vazio">
                        Selecione um item para ver as estatísticas.
                    </p>
                {:else}
                    <div class="estatisticas-resumo">
                        {#each estatisticas.resumo as r}
                            <div class="estatistica-item">
                                <span class="estatistica-valor">{r.valor}</span>
                                <span class="estatistica-label">{r.label}</span>
                            </div>
                        {/each}
                    </div>

                    <div class="estatisticas-destaques">
                        {#each estatisticas.destaques as d}
                            <div class="destaque-item">
                                <div class="destaque-icone">
                                    <span class="material-symbols-outlined"
                                        >{d.icone}</span
                                    >
                                </div>
                                <div class="destaque-texto">
                                    <span class="destaque-label">{d.label}</span
                                    >
                                    <span class="destaque-valor">{d.valor}</span
                                    >
                                </div>
                            </div>
                        {/each}
                    </div>

                    <div class="heatmap-header">
                        <button
                            class="heatmap-nav-btn"
                            on:click={anoAnterior}
                            title="Ano anterior"
                        >
                            <span class="material-symbols-outlined"
                                >chevron_left</span
                            >
                        </button>
                        <button
                            class="heatmap-ano-btn"
                            on:click={irParaAnoAtual}
                            title="Ir para o ano atual"
                        >
                            {anoSelecionado}
                        </button>
                        <button
                            class="heatmap-nav-btn"
                            on:click={anoSeguinte}
                            title="Próximo ano"
                        >
                            <span class="material-symbols-outlined"
                                >chevron_right</span
                            >
                        </button>
                    </div>

                    <div class="heatmap-wrapper">
                        <div class="heatmap-meses">
                            {#each rotulosMeses as rotulo}
                                <span class="heatmap-mes-label">{rotulo}</span>
                            {/each}
                        </div>
                        <div class="heatmap-grid">
                            {#each semanasHeatmap as semana}
                                {#each semana as dia}
                                    <div
                                        class="heatmap-dia nivel-{nivelHeatmap(
                                            dia.quantidade,
                                        )}"
                                        class:fora-do-ano={dia.foraDoAno}
                                        title="{dia.data}: {dia.quantidade} agendamento(s)"
                                    ></div>
                                {/each}
                            {/each}
                        </div>
                        <div class="heatmap-legenda">
                            <span>Menos</span>
                            <div class="heatmap-dia nivel-0"></div>
                            <div class="heatmap-dia nivel-1"></div>
                            <div class="heatmap-dia nivel-2"></div>
                            <div class="heatmap-dia nivel-3"></div>
                            <div class="heatmap-dia nivel-4"></div>
                            <span>Mais</span>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Grade -->
            {#if mostrarGrade}
                <div class="card" id="grade">
                    <div class="card-header">
                        <span class="material-symbols-outlined"
                            >calendar_month</span
                        >
                        <h3>{tituloGrade}</h3>
                    </div>

                    {#if blocos.length === 0 && !carregandoBlocos}
                        <p class="estado-vazio">Nenhum horário cadastrado.</p>
                    {:else}
                        <GradeSemanal
                            {dias}
                            {blocos}
                            carregandoLista={carregandoBlocos}
                        >
                            <svelte:fragment let:bloco>
                                <BlocoCard
                                    {bloco}
                                    mostrarTurma={mostrarTurmaGrade}
                                />
                            </svelte:fragment>
                        </GradeSemanal>
                    {/if}
                </div>
            {/if}

            <!-- Agendamentos -->
            {#if item}
                <div class="card" id="agendamentos">
                    <div class="card-header">
                        <span class="material-symbols-outlined"
                            >event_available</span
                        >
                        <h3>Agendamentos</h3>
                    </div>

                    <ListaAgendamentosCard
                        {agendamentos}
                        carregando={carregandoAgendamentos}
                        onDeletar={abrirModal}
                    />
                </div>
            {/if}
        </main>
    </div>
</div>

<style>
    @import "$lib/styles/item-informacoes.css";
</style>
