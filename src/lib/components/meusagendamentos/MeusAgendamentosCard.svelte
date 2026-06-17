<script>
    export let blocos = [];
    export let agendamentos = [];
    export let carregandoBlocos = false;
    export let carregandoAgendamentos = false;
    export let erro = "";
    export let onSair;

    const dias = ["segunda", "terca", "quarta", "quinta", "sexta"];

    const diasLabels = {
        segunda: "Segunda",
        terca: "Terça",
        quarta: "Quarta",
        quinta: "Quinta",
        sexta: "Sexta",
    };

    function blocosOrdenados(dia) {
        return blocos
            .filter((b) => b.dia_semana === dia)
            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
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

    // Ordena: futuros primeiro, depois por data
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

<div class="scaffold">
    <header class="app-bar">
        <div class="title-section">
            <h1>Portal de Agendamento</h1>
            <span>Meus Agendamentos</span>
        </div>
        <button class="btn-icon" on:click={onSair} title="Voltar">
            <span class="material-symbols-outlined">arrow_back</span>
        </button>
    </header>

    <main class="page-content">
        {#if erro}
            <p class="msg-erro">{erro}</p>
        {/if}

        <!-- ── Grade de Aulas ── -->
        <div class="card">
            <div class="card-header">
                <span class="material-symbols-outlined">calendar_month</span>
                <h3>Minha Grade de Aulas</h3>
            </div>

            {#if carregandoBlocos}
                <p class="estado-vazio">Carregando grade...</p>
            {:else if blocos.length === 0}
                <p class="estado-vazio">Nenhuma aula cadastrada para você.</p>
            {:else}
                <div class="grade-wrapper">
                    {#each dias as dia}
                        <div class="dia-coluna">
                            <div class="dia-header">{diasLabels[dia]}</div>
                            <div class="dia-blocos">
                                {#each blocosOrdenados(dia) as bloco}
                                    <div class="bloco-aula">
                                        <span class="bloco-horario">
                                            {bloco.hora_inicio} – {bloco.hora_fim}
                                        </span>
                                        <span class="bloco-disciplina">
                                            {bloco.disciplina}
                                        </span>
                                        <div class="bloco-meta">
                                            <span
                                                class="material-symbols-outlined"
                                                >meeting_room</span
                                            >
                                            {bloco.sala_nome ||
                                                bloco.sala_id ||
                                                "—"}
                                        </div>
                                        <div class="bloco-meta">
                                            <span
                                                class="material-symbols-outlined"
                                                >group</span
                                            >
                                            {bloco.turma_nome ||
                                                bloco.turma_id ||
                                                "—"}
                                        </div>
                                    </div>
                                {:else}
                                    <div class="bloco-vazio">—</div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <!-- ── Agendamentos de Sala ── -->
        <div class="card">
            <div class="card-header">
                <span class="material-symbols-outlined">event_available</span>
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
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </main>
</div>

<style>
    @import "$lib/styles/meus-agendamentos.css";
</style>
