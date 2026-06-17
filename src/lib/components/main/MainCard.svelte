<script>
    import { goto } from "$app/navigation";

    export let titulo = "";
    export let matricula = "";
    export let cargo = "";
    export let onSair = () => {};
    export let onNovoAgendamento = () => {};
    export let agendamentos = [];
    export let carregando = false;
    export let erro = "";

    const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // Domingo da semana atual
    function inicioDaGrade() {
        const hoje = new Date();
        const diaSemana = hoje.getDay(); // 0 = domingo
        const domingo = new Date(hoje);
        domingo.setDate(hoje.getDate() - diaSemana);
        domingo.setHours(0, 0, 0, 0);
        return domingo;
    }

    // Gera array com 60 dias a partir do domingo inicial
    function gerarDias() {
        const inicio = inicioDaGrade();
        return Array.from({ length: 60 }, (_, i) => {
            const d = new Date(inicio);
            d.setDate(inicio.getDate() + i);
            return d;
        });
    }

    // Extrai só a data (YYYY-MM-DD) de um datetime
    function extrairData(datetime) {
        if (!datetime) return "";
        return datetime.slice(0, 10);
    }

    // Extrai hora (HH:MM) de um datetime
    function extrairHora(datetime) {
        if (!datetime) return "";
        return datetime.slice(11, 16);
    }

    // Formata data para chave YYYY-MM-DD
    function formatarChave(date) {
        return date.toISOString().slice(0, 10);
    }

    // Agrupa agendamentos por data
    $: agendamentosPorData = agendamentos.reduce((acc, ag) => {
        const chave = extrairData(ag.data_hora_inicio);
        if (!acc[chave]) acc[chave] = [];
        acc[chave].push(ag);
        return acc;
    }, {});

    $: dias = gerarDias();

    // Agrupa dias em semanas (arrays de 7)
    $: semanas = dias.reduce((acc, dia, i) => {
        const semana = Math.floor(i / 7);
        if (!acc[semana]) acc[semana] = [];
        acc[semana].push(dia);
        return acc;
    }, []);

    function irParaDetalhes(ag) {
        goto(`/agendamento/${ag.tipo}/${ag.id}`);
    }

    function hoje() {
        return new Date().toISOString().slice(0, 10);
    }

    $: totalRegistros = agendamentos.length;
</script>

<div class="scaffold">
    <header class="app-bar">
        <div class="title-section">
            <h1>{titulo}</h1>
            <span>Matrícula: {matricula}</span>
        </div>

        <nav class="nav-menu">
            <button
                class="menu-card"
                on:click={() => goto("/meusagendamentos")}
            >
                <span class="material-symbols-outlined">calendar_today</span>
                <span>Meus<br />Agendamentos</span>
            </button>
            {#if cargo === "admin"}
                <button
                    class="menu-card"
                    on:click={() => goto("/admin/cadastro-sala")}
                >
                    <span class="material-symbols-outlined">meeting_room</span>
                    <span>Gerenciar<br />Salas</span>
                </button>
                <button
                    class="menu-card"
                    on:click={() => goto("/admin/cadastro-turma")}
                >
                    <span class="material-symbols-outlined">groups</span>
                    <span>Gerenciar<br />Turmas</span>
                </button>
                <button
                    class="menu-card"
                    on:click={() => goto("/admin/cadastro-horario")}
                >
                    <span class="material-symbols-outlined">calendar_month</span
                    >
                    <span>Gerenciar<br />Horários</span>
                </button>
                <button
                    class="menu-card"
                    on:click={() => goto("/admin/cadastro-equipamento")}
                >
                    <span class="material-symbols-outlined">playlist_add</span>
                    <span>Gerenciar<br />Equipamentos</span>
                </button>
                <button
                    class="menu-card"
                    on:click={() => goto("/admin/cadastro-usuario")}
                >
                    <span class="material-symbols-outlined">person_add</span>
                    <span>Gerenciar<br />Usuários</span>
                </button>
            {/if}
        </nav>

        <div class="actions-section">
            <button class="btn-icon" on:click={onSair} title="Sair">
                <span class="material-symbols-outlined">logout</span>
            </button>
        </div>
    </header>

    <main class="body-content">
        <div class="grade-header-title">
            <div class="title-left">
                <span class="material-symbols-outlined text-primary"
                    >calendar_month</span
                >
                <h2>Agendamentos — próximos 60 dias</h2>
            </div>
            <div class="badge">{totalRegistros} registros</div>
        </div>

        {#if carregando}
            <div class="estado-vazio">Carregando...</div>
        {:else if erro}
            <div class="estado-vazio">{erro}</div>
        {:else}
            <div class="grade-wrapper">
                <!-- Cabeçalho fixo dos dias da semana -->
                <div class="grade-cabecalho">
                    {#each DIAS_SEMANA as dia}
                        <div class="cabecalho-dia">{dia}</div>
                    {/each}
                </div>

                <!-- Semanas -->
                <div class="grade-semanas">
                    {#each semanas as semana}
                        <div class="semana-row">
                            {#each semana as dia}
                                {@const chave = formatarChave(dia)}
                                {@const isHoje = chave === hoje()}
                                {@const ags = agendamentosPorData[chave] || []}
                                <div
                                    class="dia-celula {isHoje
                                        ? 'dia-hoje'
                                        : ''}"
                                >
                                    <span
                                        class="dia-numero {isHoje
                                            ? 'numero-hoje'
                                            : ''}">{dia.getDate()}</span
                                    >
                                    {#each ags as ag}
                                        <div class="ag-bloco {ag.tipo}">
                                            <span class="ag-hora">
                                                {extrairHora(
                                                    ag.data_hora_inicio,
                                                )} - {extrairHora(
                                                    ag.data_hora_fim,
                                                )}
                                            </span>
                                            <span class="ag-tipo-label">
                                                {ag.tipo === "sala"
                                                    ? "Sala"
                                                    : "Equipamento"}
                                            </span>
                                            <button
                                                class="btn-info-ag"
                                                on:click={() =>
                                                    irParaDetalhes(ag)}
                                                title="Ver detalhes"
                                            >
                                                <span
                                                    class="material-symbols-outlined"
                                                    >info</span
                                                >
                                            </button>
                                        </div>
                                    {/each}
                                </div>
                            {/each}
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        <div class="bottom-action">
            <button
                class="btn-primary btn-novo-agendamento"
                on:click={onNovoAgendamento}
            >
                <span class="material-symbols-outlined">add_circle</span>
                Novo Agendamento
            </button>
        </div>
    </main>
</div>
