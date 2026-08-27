<script>
    import GradeSemanal from "$lib/components/SemanalGrade/GradeSemanal.svelte";
    import BlocoCard from "$lib/components/Card/BlocoHorarioCard.svelte";
    import ConfirmarDelecaoModal from "$lib/components/Card/ConfirmarDelecaoModal.svelte";

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
    /** @type {((ag: any) => void) | null} */
    export let onDeletar = null;

    let agendamentoParaDeletar = null;

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

    function abrirModal(ag) {
        agendamentoParaDeletar = ag;
    }

    function fecharModal() {
        agendamentoParaDeletar = null;
    }

    function confirmarDelecao(ag) {
        fecharModal();
        onDeletar?.(ag);
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

    // Monta a grade de semanas (colunas) x dias da semana (linhas), últimas ~53 semanas
    function montarSemanas(heatmap) {
        const mapa = new Map(
            (heatmap || []).map((h) => [h.data, h.quantidade]),
        );

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const inicio = new Date(hoje);
        inicio.setDate(inicio.getDate() - 370);
        inicio.setDate(inicio.getDate() - inicio.getDay()); // alinha no domingo

        const dias = [];
        const cursor = new Date(inicio);
        while (cursor <= hoje) {
            const chave = cursor.toISOString().slice(0, 10);
            dias.push({
                data: chave,
                dia: cursor.getDate(),
                mes: cursor.getMonth(),
                quantidade: mapa.get(chave) || 0,
            });
            cursor.setDate(cursor.getDate() + 1);
        }

        const semanas = [];
        for (let i = 0; i < dias.length; i += 7) {
            semanas.push(dias.slice(i, i + 7));
        }
        return semanas;
    }

    $: semanasHeatmap = montarSemanas(estatisticas?.heatmap);

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

    $: agendamentosOrdenados = [...agendamentos].sort((a, b) => {
        const fa = isFuturo(a.data_hora_inicio);
        const fb = isFuturo(b.data_hora_inicio);
        if (fa !== fb) return fb ? 1 : -1;
        return (
            new Date(a.data_hora_inicio).getTime() -
            new Date(b.data_hora_inicio).getTime()
        );
    });
</script>

<ConfirmarDelecaoModal
    agendamento={agendamentoParaDeletar}
    onConfirmar={confirmarDelecao}
    onCancelar={fecharModal}
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
            <div class="card">
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
            <div class="card">
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
            <div class="card">
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

            <!-- Agendamentos de sala (já existente) -->
            <div class="card">
                <div class="card-header">
                    <span class="material-symbols-outlined"
                        >event_available</span
                    >
                    <h3>Meus Agendamentos de Sala</h3>
                </div>

                {#if carregandoAgendamentos}
                    <p class="estado-vazio">Carregando agendamentos...</p>
                {:else if agendamentosOrdenados.length === 0}
                    <p class="estado-vazio">
                        Nenhum agendamento de sala encontrado.
                    </p>
                {:else}
                    <div class="agendamentos-lista">
                        {#each agendamentosOrdenados as ag}
                            <div class="agendamento-item">
                                <div class="agendamento-faixa"></div>
                                <div class="agendamento-body">
                                    <div class="agendamento-data-hora">
                                        <span class="material-symbols-outlined"
                                            >schedule</span
                                        >
                                        {formatarDataHora(ag.data_hora_inicio)}
                                        &nbsp;→&nbsp;
                                        {formatarDataHora(ag.data_hora_fim)}
                                    </div>
                                    <div class="agendamento-sala">
                                        <span class="material-symbols-outlined"
                                            >meeting_room</span
                                        >
                                        {ag.sala_nome ||
                                            ag.sala_id ||
                                            "Sala não informada"}
                                    </div>
                                    {#if ag.obs}
                                        <p class="agendamento-obs">{ag.obs}</p>
                                    {/if}
                                </div>
                                <div class="agendamento-status">
                                    <span
                                        class="badge-status {isFuturo(
                                            ag.data_hora_inicio,
                                        )
                                            ? 'futuro'
                                            : 'passado'}"
                                    >
                                        {isFuturo(ag.data_hora_inicio)
                                            ? "Agendado"
                                            : "Concluído"}
                                    </span>
                                    {#if isFuturo(ag.data_hora_inicio) && onDeletar}
                                        <button
                                            class="btn-deletar-ag"
                                            on:click={() => abrirModal(ag)}
                                            title="Deletar agendamento"
                                        >
                                            <span
                                                class="material-symbols-outlined"
                                                >delete</span
                                            >
                                        </button>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </main>
    </div>
</div>

<style>
    @import "$lib/styles/minhas-informacoes.css";
</style>
