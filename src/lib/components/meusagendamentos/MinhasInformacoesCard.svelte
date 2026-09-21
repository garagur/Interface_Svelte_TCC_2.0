<script>
    import GradeSemanal from "$lib/components/SemanalGrade/GradeSemanal.svelte";
    import BlocoCard from "$lib/components/Card/BlocoHorarioCard.svelte";
    import ConfirmarDelecaoModal from "$lib/components/Card/ConfirmarDelecaoModal.svelte";
    import ListaAgendamentosCard from "$lib/components/Card/ListaAgendamentosCard.svelte";
    // Dados pessoais
    /** @type {{ nome?: string, email?: string, matricula?: string, foto_url?: string } | null} */
    export let usuario = null;
    export let carregandoUsuario = false;

    // Estatísticas
    /**
     * @type {{
     *   totalSala: number,
     *   totalEquipamento: number,
     *   salaMaisAgendada?: string | null,
     *   equipamentoMaisAgendado?: string | null,
     *   heatmap: Array<{ data: string, quantidade: number }>
     * }}
     */
    export let estatisticas = {
        totalSala: 0,
        totalEquipamento: 0,
        salaMaisAgendada: null,
        equipamentoMaisAgendado: null,
        heatmap: [],
    };
    export let carregandoEstatisticas = false;

    // Grade e agendamentos (já existentes)
    export let blocos = [];
    export let agendamentos = [];
    export let carregandoBlocos = false;
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

    // Ano exibido no heatmap (começa no ano atual)
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

    function formatarDataHora(iso) {
        if (!iso) return "—";
        const d = new Date(iso);
        const data = d.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        const hora = d.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
        return `${data} às ${hora}`;
    }

    function isFuturo(iso) {
        if (!iso) return false;
        return new Date(iso) >= new Date();
    }

    /**
     * Determina o status de exibição do agendamento.
     * @param {any} ag
     * @returns {"cancelado" | "futuro" | "passado"}
     */
    function statusExibicao(ag) {
        if (ag.status === "inativo") return "cancelado";
        return isFuturo(ag.data_hora_inicio) ? "futuro" : "passado";
    }

    function rotuloStatus(status) {
        if (status === "cancelado") return "Cancelado";
        if (status === "futuro") return "Agendado";
        return "Concluído";
    }

    /**
     * Normaliza o tipo do agendamento ("sala" | "equipamento").
     * @param {any} ag
     */
    function tipoAgendamento(ag) {
        return ag.tipo === "equipamento" ? "equipamento" : "sala";
    }

    /**
     * Nome de exibição do recurso agendado, usado na ordenação A-Z/Z-A.
     * @param {any} ag
     */
    function nomeAgendamento(ag) {
        return tipoAgendamento(ag) === "equipamento"
            ? ag.equipamento_nome || ""
            : ag.sala_nome || "";
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

    // Monta a grade de semanas (colunas) x dias da semana (linhas)
    // cobrindo o ano civil completo (1 de Jan a 31 de Dez do ano informado),
    // alinhado do domingo anterior ao 1º de Jan até o sábado seguinte ao 31 de Dez.
    function montarSemanas(heatmap, ano) {
        const mapa = new Map(
            (heatmap || []).map((h) => [h.data, h.quantidade]),
        );

        const inicioAno = new Date(ano, 0, 1);
        const fimAno = new Date(ano, 11, 31);

        const inicio = new Date(inicioAno);
        inicio.setDate(inicio.getDate() - inicio.getDay()); // volta até domingo

        const fim = new Date(fimAno);
        fim.setDate(fim.getDate() + (6 - fim.getDay())); // avança até sábado

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

    // Rótulo de mês só na primeira semana em que o mês aparece
    $: rotulosMeses = semanasHeatmap.map((semana, idx) => {
        const primeiroDia = semana[0];
        if (!primeiroDia) return "";
        if (idx === 0) return NOMES_MESES[primeiroDia.mes];
        const mesAnterior = semanasHeatmap[idx - 1][0]?.mes;
        return primeiroDia.mes !== mesAnterior
            ? NOMES_MESES[primeiroDia.mes]
            : "";
    });

    $: totalGeral =
        (estatisticas?.totalSala || 0) + (estatisticas?.totalEquipamento || 0);

    let pesquisaAg = "";
    let filtroStatusAg = "todos"; // "todos" | "ativo" | "cancelado" | "finalizado"
    let filtroTipoAg = "todos"; // "todos" | "sala" | "equipamento"
    let ordenacaoAg = "recente"; // "recente" | "antigo" | "az" | "za"

    $: agendamentosFiltrados = agendamentos
        .filter((ag) => {
            if (!pesquisaAg.trim()) return true;
            const termo = pesquisaAg.toLowerCase();
            return (
                nomeAgendamento(ag).toLowerCase().includes(termo) ||
                (ag.obs || "").toLowerCase().includes(termo)
            );
        })
        .filter((ag) => {
            if (filtroTipoAg === "todos") return true;
            return tipoAgendamento(ag) === filtroTipoAg;
        })
        .filter((ag) => {
            if (filtroStatusAg === "todos") return true;
            const status = statusExibicao(ag);
            if (filtroStatusAg === "ativo") return status === "futuro";
            if (filtroStatusAg === "cancelado") return status === "cancelado";
            if (filtroStatusAg === "finalizado") return status === "passado";
            return true;
        })
        .sort((a, b) => {
            if (ordenacaoAg === "az" || ordenacaoAg === "za") {
                const nomeA = nomeAgendamento(a).toLowerCase();
                const nomeB = nomeAgendamento(b).toLowerCase();
                return ordenacaoAg === "az"
                    ? nomeA.localeCompare(nomeB)
                    : nomeB.localeCompare(nomeA);
            }
            const dataA = new Date(a.data_hora_inicio).getTime();
            const dataB = new Date(b.data_hora_inicio).getTime();
            return ordenacaoAg === "recente" ? dataB - dataA : dataA - dataB;
        });
</script>

<ConfirmarDelecaoModal
    agendamento={agendamentoParaDeletar}
    onConfirmar={confirmarDelecao}
    onCancelar={fecharModal}
    {processando}
/>

<div class="minhas-informacoes">
    <div class="scaffold">
        <header class="app-bar">
            <div class="title-section">
                <h1>Portal de Agendamento</h1>
                <span>Meu Perfil</span>
            </div>
            <button class="btn-icon" on:click={onSair} title="Voltar">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
        </header>

        <main class="page-content">
            {#if erro}
                <p class="msg-erro">{erro}</p>
            {/if}

            <!-- Dados pessoais -->
            <div class="card" id="dados">
                <div class="card-header">
                    <span class="material-symbols-outlined">person</span>
                    <h3>Meus Dados</h3>
                </div>

                {#if carregandoUsuario}
                    <p class="estado-vazio">Carregando dados do usuário...</p>
                {:else}
                    <div class="perfil-conteudo">
                        {#if usuario?.foto_url}
                            <img
                                class="perfil-foto"
                                src={usuario.foto_url}
                                alt="Foto de perfil"
                            />
                        {:else}
                            <div class="perfil-foto-placeholder">
                                {iniciais(usuario?.nome)}
                            </div>
                        {/if}

                        <div class="perfil-dados">
                            <p class="perfil-nome">{usuario?.nome || "—"}</p>
                            <div class="perfil-info-linha">
                                <span class="material-symbols-outlined"
                                    >mail</span
                                >
                                {usuario?.email || "—"}
                            </div>
                            <div class="perfil-info-linha">
                                <span class="material-symbols-outlined"
                                    >badge</span
                                >
                                Matrícula: {usuario?.matricula || "—"}
                            </div>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Estatísticas -->
            <div class="card" id="estatisticas">
                <div class="card-header">
                    <span class="material-symbols-outlined">query_stats</span>
                    <h3>Minhas Estatísticas</h3>
                </div>

                {#if carregandoEstatisticas}
                    <p class="estado-vazio">Carregando estatísticas...</p>
                {:else}
                    <div class="estatisticas-resumo">
                        <div class="estatistica-item">
                            <span class="estatistica-valor"
                                >{estatisticas.totalSala}</span
                            >
                            <span class="estatistica-label"
                                >Salas agendadas</span
                            >
                        </div>
                        <div class="estatistica-item">
                            <span class="estatistica-valor"
                                >{estatisticas.totalEquipamento}</span
                            >
                            <span class="estatistica-label"
                                >Equipamentos agendados</span
                            >
                        </div>
                        <div class="estatistica-item">
                            <span class="estatistica-valor">{totalGeral}</span>
                            <span class="estatistica-label">Total geral</span>
                        </div>
                    </div>

                    <div class="estatisticas-destaques">
                        <div class="destaque-item">
                            <div class="destaque-icone">
                                <span class="material-symbols-outlined"
                                    >meeting_room</span
                                >
                            </div>
                            <div class="destaque-texto">
                                <span class="destaque-label"
                                    >Sala mais agendada</span
                                >
                                <span class="destaque-valor">
                                    {estatisticas.salaMaisAgendada || "—"}
                                </span>
                            </div>
                        </div>
                        <div class="destaque-item">
                            <div class="destaque-icone">
                                <span class="material-symbols-outlined"
                                    >devices</span
                                >
                            </div>
                            <div class="destaque-texto">
                                <span class="destaque-label"
                                    >Equipamento mais agendado</span
                                >
                                <span class="destaque-valor">
                                    {estatisticas.equipamentoMaisAgendado ||
                                        "—"}
                                </span>
                            </div>
                        </div>
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

            <!-- Grade de aulas (já existente) -->
            <div class="card" id="grade">
                <div class="card-header">
                    <span class="material-symbols-outlined">calendar_month</span
                    >
                    <h3>Minha Grade de Aulas</h3>
                </div>

                {#if blocos.length === 0 && !carregandoBlocos}
                    <p class="estado-vazio">
                        Nenhuma aula cadastrada para você.
                    </p>
                {:else}
                    <GradeSemanal
                        {dias}
                        {blocos}
                        carregandoLista={carregandoBlocos}
                    >
                        <svelte:fragment let:bloco>
                            <BlocoCard {bloco} mostrarTurma={true} />
                        </svelte:fragment>
                    </GradeSemanal>
                {/if}
            </div>

            <!-- Agendamentos de salas e equipamentos -->
            <div class="card" id="agendamentos">
                <div class="card-header">
                    <span class="material-symbols-outlined"
                        >event_available</span
                    >
                    <h3>Meus Agendamentos</h3>
                </div>

                <ListaAgendamentosCard
                    {agendamentos}
                    carregando={carregandoAgendamentos}
                    onDeletar={abrirModal}
                    {processando}
                    semCard
                    listaPropria
                    mostrarCancelados
                />
            </div>
        </main>
    </div>
</div>

<style>
    @import "$lib/styles/minhas-informacoes.css";

    .btn-deletar-ag:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
