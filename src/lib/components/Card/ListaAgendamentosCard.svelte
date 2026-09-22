<script>
    // Lista de agendamentos (estilo "Meus Agendamentos") com filtros.
    // Alternativa ao GradeMensal na página main.

    export let agendamentos = [];
    export let carregando = false;
    export let usuarioId = null;
    export let cargo = "";
    /** @type {((ag: any) => void) | null} */
    export let onDeletar = null;
    // true quando a lista já está dentro de outro card (ex.: página de novo agendamento)
    export let embutido = false;
    // true quando a lista é de um único recurso (sala/equipamento já selecionado):
    // esconde o filtro de Tipo e a ordenação por nome
    export let recursoUnico = false;

    let pesquisaAg = "";
    let filtroStatusAg = "todos"; // "todos" | "ativo" | "finalizado"
    let filtroTipoAg = "todos"; // "todos" | "sala" | "equipamento"
    let ordenacaoAg = "recente"; // "recente" | "antigo" | "az" | "za"

    /**
     * Interpreta a data como horário "de parede" (ignora o Z / fuso),
     * exatamente como o GradeMensal faz com slice(11, 16).
     * Assim a lista e o calendário mostram o mesmo horário.
     * Se um dia o fuso for corrigido no backend, ajuste só aqui.
     */
    function parseData(str) {
        if (!str) return null;
        const d = new Date(String(str).replace(" ", "T").slice(0, 19));
        return isNaN(d.getTime()) ? null : d;
    }

    function formatarDataHora(str) {
        const d = parseData(str);
        if (!d) return "—";
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

    function isFuturo(str) {
        const d = parseData(str);
        return !!d && d >= new Date();
    }

    /** @returns {"cancelado" | "futuro" | "passado"} */
    function statusExibicao(ag) {
        if (ag.status === "inativo") return "cancelado";
        return isFuturo(ag.data_hora_inicio) ? "futuro" : "passado";
    }

    function rotuloStatus(status) {
        if (status === "cancelado") return "Cancelado";
        if (status === "futuro") return "Agendado";
        return "Concluído";
    }

    function tipoAgendamento(ag) {
        return ag.tipo === "equipamento" ? "equipamento" : "sala";
    }

    function nomeAgendamento(ag) {
        return tipoAgendamento(ag) === "equipamento"
            ? ag.equipamento_nome || ag.equipamento_id || ""
            : ag.sala_nome || ag.sala_id || "";
    }

    // Nome de quem fez o agendamento (3ª linha do bloco do calendário)
    function nomeResponsavel(ag) {
        return ag.user_nome || ag.usuario_nome || ag.professor_nome || "";
    }

    // Nome do responsável pelo recurso (sala/equipamento), não do solicitante
    function nomeResponsavelRecurso(ag) {
        return tipoAgendamento(ag) === "equipamento"
            ? ag.equipamento_responsavel_nome || ""
            : ag.sala_responsavel_nome || "";
    }

    function responsavelId(ag) {
        return tipoAgendamento(ag) === "equipamento"
            ? ag.equipamento_responsavel_id
            : ag.sala_responsavel_id;
    }
    function podeDeletar(ag, status) {
        if (!onDeletar || status !== "futuro") return false;
        if (cargo === "admin") return true;
        if (String(ag.user_id) === String(usuarioId)) return true;
        const respId = responsavelId(ag);
        return respId != null && String(respId) === String(usuarioId);
    }

    $: agendamentosFiltrados = agendamentos
        .filter((ag) => {
            if (!pesquisaAg.trim()) return true;
            const termo = pesquisaAg.toLowerCase();
            return (
                nomeAgendamento(ag).toLowerCase().includes(termo) ||
                nomeResponsavel(ag).toLowerCase().includes(termo) ||
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
            const dataA = parseData(a.data_hora_inicio)?.getTime() ?? 0;
            const dataB = parseData(b.data_hora_inicio)?.getTime() ?? 0;
            return ordenacaoAg === "recente" ? dataB - dataA : dataA - dataB;
        });
</script>

<div class="lista-agendamentos-card" class:embutido>
    <div class="agendamentos-toolbar">
        <div class="campo-pesquisa-ag">
            <span class="material-symbols-outlined">search</span>
            <input
                type="text"
                placeholder={recursoUnico
                    ? "Pesquisar por responsável ou observação..."
                    : "Pesquisar por sala, equipamento ou responsável..."}
                bind:value={pesquisaAg}
            />
        </div>

        <div class="filtro-grupo">
            <span class="filtro-grupo-label">Status</span>
            <select class="select-filtro-ag" bind:value={filtroStatusAg}>
                <option value="todos">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="finalizado">Finalizados</option>
            </select>
        </div>

        {#if !recursoUnico}
            <div class="filtro-grupo">
                <span class="filtro-grupo-label">Tipo</span>
                <select class="select-filtro-ag" bind:value={filtroTipoAg}>
                    <option value="todos">Todos</option>
                    <option value="sala">Salas</option>
                    <option value="equipamento">Equipamentos</option>
                </select>
            </div>
        {/if}

        <div class="filtro-grupo">
            <span class="filtro-grupo-label">Ordenar</span>
            <select class="select-filtro-ag" bind:value={ordenacaoAg}>
                <option value="recente">Mais recente</option>
                <option value="antigo">Mais antigo</option>
                {#if !recursoUnico}
                    <option value="az">Nome (A-Z)</option>
                    <option value="za">Nome (Z-A)</option>
                {/if}
            </select>
        </div>
    </div>

    {#if carregando}
        <p class="estado-vazio">Carregando agendamentos...</p>
    {:else if agendamentosFiltrados.length === 0}
        <p class="estado-vazio">
            Nenhum agendamento encontrado com os filtros selecionados.
        </p>
    {:else}
        <div class="agendamentos-lista">
            {#each agendamentosFiltrados as ag (`${tipoAgendamento(ag)}-${ag.id}`)}
                {@const status = statusExibicao(ag)}
                {@const responsavel = nomeResponsavel(ag)}
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
                                >{tipoAgendamento(ag) === "equipamento"
                                    ? "devices"
                                    : "meeting_room"}</span
                            >
                            {nomeAgendamento(ag) ||
                                (tipoAgendamento(ag) === "equipamento"
                                    ? "Equipamento não informado"
                                    : "Sala não informada")}
                        </div>
                        {#if responsavel}
                            <div class="agendamento-sala">
                                <span class="material-symbols-outlined"
                                    >person</span
                                >
                                {responsavel}
                            </div>
                        {/if}
                        {#if ag.obs}
                            <p class="agendamento-obs">{ag.obs}</p>
                        {/if}
                    </div>
                    <div class="agendamento-status">
                        <span class="badge-status {status}">
                            {rotuloStatus(status)}
                        </span>
                        {#if podeDeletar(ag, status)}
                            <button
                                type="button"
                                class="btn-deletar-ag"
                                on:click={() => onDeletar?.(ag)}
                                title="Deletar agendamento"
                            >
                                <span class="material-symbols-outlined"
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

<style>
    /* Estilo copiado de minhas-informacoes.css, sem o prefixo .minhas-informacoes.
       As variáveis neumórficas (definidas lá em .scaffold) ficam na raiz daqui. */
    .lista-agendamentos-card {
        --neu-bg: var(--gray-50);
        --neu-shadow-dark: rgba(163, 177, 198, 0.55);
        --neu-shadow-light: rgba(255, 255, 255, 0.85);
        --campo-bg: var(--neu-bg);

        font-family: "Inter", Arial, sans-serif;
        background: var(--neu-bg);
        border-radius: 20px;
        padding: 20px 24px;
        box-shadow:
            8px 8px 16px var(--neu-shadow-dark),
            -8px -8px 16px var(--neu-shadow-light);
    }

    /* Dentro de outro card (página de novo agendamento): sem card próprio e
       com a mesma paleta do .escopo-agendamento (card branco, campos em
       --bg-input, sombras azul-acinzentadas). */
    .lista-agendamentos-card.embutido {
        --neu-bg: var(--white);
        --campo-bg: var(--bg-input);
        --neu-shadow-dark: rgba(166, 180, 200, 0.4);
        --neu-shadow-light: rgba(255, 255, 255, 0.8);

        font-family: inherit;
        background: none;
        box-shadow: none;
        padding: 0;
        border-radius: 0;
    }

    /* ─── Toolbar de filtros ───────────────────────────────────────── */
    .agendamentos-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--gray-50);
    }

    .campo-pesquisa-ag {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--campo-bg);
        border-radius: 12px;
        padding: 0 14px;
        height: 42px;
        flex: 1 1 240px;
        min-width: 200px;
        box-shadow:
            inset 2px 2px 4px var(--neu-shadow-dark),
            inset -2px -2px 4px var(--neu-shadow-light);
    }

    .campo-pesquisa-ag .material-symbols-outlined {
        font-size: 18px;
        color: var(--text-muted);
    }

    .campo-pesquisa-ag input {
        border: none;
        background: none;
        outline: none;
        box-shadow: none;
        border-radius: 0;
        padding: 0;
        margin: 0;
        font-size: 0.82rem;
        color: var(--text-dark);
        width: 100%;
        height: 100%;
    }

    .filtro-grupo {
        display: flex;
        flex-direction: column;
        gap: 4px;
        justify-content: center;
    }

    .filtro-grupo-label {
        font-size: 0.68rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-muted);
        line-height: 1;
    }

    .select-filtro-ag {
        width: auto;
        margin: 0;
        background: var(--campo-bg);
        border: none;
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-dark);
        padding: 0 14px;
        height: 42px;
        border-radius: 12px;
        box-shadow:
            inset 2px 2px 4px var(--neu-shadow-dark),
            inset -2px -2px 4px var(--neu-shadow-light);
    }

    /* ─── Lista ────────────────────────────────────────────────────── */
    .agendamentos-lista {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: min(100%, 1080px);
        margin: 0 auto;
    }

    .agendamento-item {
        display: flex;
        align-items: stretch;
        gap: 0;
        background: var(--neu-bg);
        border: none;
        border-radius: 14px;
        overflow: hidden;
        box-shadow:
            5px 5px 10px var(--neu-shadow-dark),
            -5px -5px 10px var(--neu-shadow-light);
        transition: box-shadow 0.2s;
    }

    .agendamento-item:hover {
        box-shadow:
            3px 3px 6px var(--neu-shadow-dark),
            -3px -3px 6px var(--neu-shadow-light);
    }

    .agendamento-faixa {
        width: 4px;
        background: var(--primary);
        flex-shrink: 0;
    }

    .agendamento-body {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 14px 16px;
        flex: 1;
    }

    .agendamento-data-hora {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--primary-dark);
    }

    .agendamento-data-hora .material-symbols-outlined {
        font-size: 16px;
    }

    .agendamento-sala {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.82rem;
        color: var(--text-dark);
        font-weight: 500;
    }

    .agendamento-sala .material-symbols-outlined {
        font-size: 15px;
        color: var(--text-muted);
    }

    .agendamento-obs {
        font-size: 0.75rem;
        color: var(--text-muted);
        font-style: italic;
        margin: 2px 0 0;
    }

    .agendamento-status {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 16px;
    }

    .badge-status {
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: 4px 10px;
        border-radius: 20px;
        box-shadow:
            2px 2px 4px var(--neu-shadow-dark),
            -2px -2px 4px var(--neu-shadow-light);
    }

    .badge-status.futuro {
        background: var(--confirm-light);
        color: var(--confirm-dark);
    }

    .badge-status.passado {
        background: var(--gray-50);
        color: var(--text-muted);
    }

    .btn-deletar-ag {
        background: var(--neu-bg);
        border: none;
        cursor: pointer;
        color: #ef4444;
        padding: 6px;
        margin: 4px 0 0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow:
            3px 3px 6px var(--neu-shadow-dark),
            -3px -3px 6px var(--neu-shadow-light);
        transition: box-shadow 0.15s;
    }

    .btn-deletar-ag:hover {
        color: #b91c1c;
    }

    .btn-deletar-ag:active {
        box-shadow:
            inset 2px 2px 4px var(--neu-shadow-dark),
            inset -2px -2px 4px var(--neu-shadow-light);
    }

    .estado-vazio {
        text-align: center;
        color: var(--text-muted);
        font-size: 0.85rem;
        padding: 32px 0;
        margin: 0;
    }

    @media (max-width: 640px) {
        .agendamentos-toolbar {
            flex-direction: column;
            align-items: stretch;
        }

        .campo-pesquisa-ag {
            flex: 1 1 auto;
        }

        .agendamento-item {
            flex-wrap: wrap;
        }

        .agendamento-status {
            padding: 0 16px 12px;
        }
    }
</style>
