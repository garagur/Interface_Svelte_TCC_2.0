<script>
    // Lista de agendamentos (estilo "Meus Agendamentos") com filtros.
    // Alternativa ao GradeMensal na página main.
    import AgendamentoDetalheModal from "./AgendamentoDetalheModal.svelte";

    export let agendamentos = [];
    export let carregando = false;
    export let usuarioId = null;
    export let cargo = "";
    /** @type {((ag: any) => void) | null} */
    export let onDeletar = null;
    /** @type {((ag: any) => Promise<void> | void) | null} */
    export let onConfirmar = null;
    // true quando a lista já está dentro de outro card (ex.: página de novo agendamento)
    export let embutido = false;
    // true quando a lista é de um único recurso (sala/equipamento já selecionado):
    // esconde o filtro de Tipo e a ordenação por nome
    export let recursoUnico = false;

    let pesquisaAg = "";
    let filtroStatusAg = "todos"; // "todos" | "ativo" | "finalizado"
    let filtroTipoAg = "todos"; // "todos" | "sala" | "equipamento"
    let ordenacaoAg = "recente"; // "recente" | "antigo" | "az" | "za"

    // Agendamento aberto no modal de detalhes (null = fechado)
    let agDetalhe = null;

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
    function formatarPeriodo(inicio, fim) {
        const ini = parseData(inicio);
        const f = parseData(fim);
        if (!ini) return "—";

        const dia = (d) =>
            d.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        const hora = (d) =>
            d.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            });

        if (!f) return `${dia(ini)} · ${hora(ini)}`;
        if (dia(ini) === dia(f))
            return `${dia(ini)} · ${hora(ini)} → ${hora(f)}`;
        return `${dia(ini)} ${hora(ini)} → ${dia(f)} ${hora(f)}`;
    }
    function justificativaCancelamento(ag) {
        return (
            ag.justificativa_cancelamento ||
            ag.motivo_cancelamento ||
            ag.justificativa ||
            ""
        );
    }
    function isFuturo(str) {
        const d = parseData(str);
        return !!d && d >= new Date();
    }

    // retorna "cancelado" | "futuro" | "passado"
    function statusExibicao(ag) {
        if (ag.status === "inativo") return "cancelado";
        return isFuturo(ag.data_hora_inicio) ? "futuro" : "passado";
    }

    function rotuloStatus(ag, status) {
        if (ag.status === "ocioso") return "Ocioso";
        if (ag.status === "em_andamento") return "Em andamento";
        if (status === "cancelado") return "Cancelado";
        if (status === "futuro") return "Ativo";
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

    function podeConfirmar(ag) {
        if (!onConfirmar || ag.status !== "ocioso") return false;
        const respId = responsavelId(ag);
        if (respId == null) return cargo === "admin";
        return String(respId) === String(usuarioId);
    }

    function abrirDetalhes(ag) {
        agDetalhe = ag;
    }

    function cancelarPeloModal(ag) {
        // fecha o modal de detalhes antes, para não empilhar com o modal de confirmação
        agDetalhe = null;
        if (onDeletar) onDeletar(ag);
    }

    // Move o modal para o <body>: evita corte por overflow do card/lista
    function portal(node) {
        document.body.appendChild(node);
        return {
            destroy() {
                node.remove();
            },
        };
    }

    $: agendamentosFiltrados = agendamentos
        .filter((ag) => {
            if (!pesquisaAg.trim()) return true;
            const termo = pesquisaAg.toLowerCase();
            return (
                nomeAgendamento(ag).toLowerCase().includes(termo) ||
                nomeResponsavel(ag).toLowerCase().includes(termo) ||
                (ag.turma_nome || "").toLowerCase().includes(termo) ||
                (ag.obs || "").toLowerCase().includes(termo)
            );
        })
        .filter((ag) => {
            if (filtroTipoAg === "todos") return true;
            return tipoAgendamento(ag) === filtroTipoAg;
        })
        .filter((ag) => {
            if (filtroStatusAg === "todos") return true;
            if (filtroStatusAg === "ocioso") return ag.status === "ocioso";
            const status = statusExibicao(ag);
            if (filtroStatusAg === "ativo") return status === "futuro";
            if (filtroStatusAg === "finalizado") return status === "passado";
            if (filtroStatusAg === "cancelado") return status === "cancelado";
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
                <option value="ocioso">Ociosos</option>
                <option value="ativo">Ativos</option>
                <option value="finalizado">Concluídos</option>
                <option value="cancelado">Cancelados</option>
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
                    <option value="az">Nome item (A-Z)</option>
                    <option value="za">Nome item (Z-A)</option>
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
                <div
                    class="agendamento-item {ag.status === 'ocioso'
                        ? 'ocioso'
                        : ''} {ag.status === 'em_andamento'
                        ? 'em-andamento'
                        : ''}"
                    class:cancelado={status === "cancelado"}
                    class:passado={status === "passado"}
                >
                    <div class="agendamento-faixa"></div>
                    <div class="agendamento-body">
                        <span
                            class="badge-status {status} {ag.status === 'ocioso'
                                ? 'ocioso'
                                : ''} {ag.status === 'em_andamento'
                                ? 'em-andamento'
                                : ''}"
                        >
                            {rotuloStatus(ag, status)}
                        </span>
                        <div class="agendamento-data-hora">
                            <span class="material-symbols-outlined"
                                >schedule</span
                            >
                            {formatarPeriodo(
                                ag.data_hora_inicio,
                                ag.data_hora_fim,
                            )}
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
                        {#if ag.turma_nome}
                            <div class="agendamento-sala">
                                <span class="material-symbols-outlined"
                                    >groups</span
                                >
                                {ag.turma_nome}
                            </div>
                        {/if}
                        {#if ag.obs}
                            <p class="agendamento-obs">
                                <span
                                    class="material-symbols-outlined"
                                    aria-hidden="true">edit_note</span
                                >
                                <span>
                                    <strong
                                        >Justificativa do agendamento:</strong
                                    >
                                    {ag.obs}
                                </span>
                            </p>
                        {/if}
                        {#if status === "cancelado"}
                            <p class="agendamento-justificativa">
                                <span class="material-symbols-outlined"
                                    >block</span
                                >
                                <strong>Justificativa do cancelamento:</strong>
                                {justificativaCancelamento(ag) ||
                                    "Não informada"}
                            </p>
                        {/if}
                    </div>
                    <div class="agendamento-botoes">
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
                        <button
                            type="button"
                            class="btn-info-ag"
                            on:click={() => abrirDetalhes(ag)}
                            title="Ver detalhes"
                        >
                            <span class="material-symbols-outlined">info</span>
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

{#if agDetalhe}
    <div use:portal>
        <AgendamentoDetalheModal
            ag={agDetalhe}
            {usuarioId}
            {cargo}
            onFechar={() => (agDetalhe = null)}
            onCancelar={podeDeletar(agDetalhe, statusExibicao(agDetalhe))
                ? cancelarPeloModal
                : null}
            onConfirmar={podeConfirmar(agDetalhe) ? onConfirmar : null}
        />
    </div>
{/if}

<style>
    /* Estilo local da lista, sem prefixo de página.
       As variáveis neumórficas (definidas lá em .scaffold) ficam na raiz daqui. */
    .lista-agendamentos-card {
        --neu-bg: var(--gray-50);
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
        background-color: var(--campo-bg); /* era "background" */
        appearance: none;
        background-image: linear-gradient(
                45deg,
                transparent 50%,
                var(--text-muted) 50%
            ),
            linear-gradient(135deg, var(--text-muted) 50%, transparent 50%);
        background-repeat: no-repeat;
        background-position:
            calc(100% - 1rem) 50%,
            calc(100% - 0.75rem) 50%;
        background-size: 0.25rem 0.25rem;
        border: none;
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-dark);
        padding: 0 2.25rem 0 14px; /* espaço à direita para a seta */
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
        width: 100%;
        max-height: min(70vh, 760px);
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 6px 8px 10px 6px;
        scrollbar-gutter: stable;
        margin: 0;
    }

    .agendamento-item {
        display: flex;
        flex-shrink: 0;
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

    .agendamento-item.passado {
        background: var(--disabled);
        box-shadow:
            inset 5px 5px 10px var(--neu-shadow-dark),
            inset -5px -5px 10px var(--neu-shadow-light);
    }

    .agendamento-item.passado:hover {
        box-shadow:
            inset 4px 4px 8px var(--neu-shadow-dark),
            inset -4px -4px 8px var(--neu-shadow-light);
    }

    .agendamento-faixa {
        width: 4px;
        background: var(--primary);
        flex-shrink: 0;
    }

    .agendamento-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px 14px;
        flex: 1;
        min-width: 0;
    }

    .agendamento-data-hora {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1rem;
        font-weight: 700;
        color: var(--primary-dark);
    }

    .agendamento-data-hora .material-symbols-outlined {
        font-size: 20px;
    }

    .agendamento-sala {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.95rem;
        color: var(--text-dark);
        font-weight: 500;
    }

    .agendamento-sala .material-symbols-outlined {
        font-size: 19px;
        color: var(--text-muted);
    }

    .agendamento-obs {
        display: flex;
        align-items: flex-start;
        gap: 7px;
        font-size: 0.9rem;
        color: var(--text-muted);
        font-style: normal;
        line-height: 1.45;
        margin: 2px 0 0;
    }

    .agendamento-obs .material-symbols-outlined {
        flex: 0 0 auto;
        font-size: 19px;
        color: var(--text-muted);
    }

    .agendamento-item .agendamento-botoes {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        align-self: center;
        gap: 8px;
        flex-shrink: 0;
        margin-right: 12px;
    }

    .agendamento-body .badge-status {
        position: static !important;
        display: inline-flex;
        float: none;
        margin: 0;
        align-self: flex-start;
        width: fit-content;
        font-size: 0.9rem;
    }

    .badge-status.futuro {
        background: var(--confirm-light);
        color: var(--confirm-dark);
    }

    .badge-status.ocioso {
        background: var(--warning-light);
        color: var(--warning-text);
    }

    .badge-status.em-andamento {
        background: color-mix(in srgb, var(--focus) 16%, var(--white));
        color: #1d4ed8;
    }

    .badge-status.passado {
        background: none;
        color: var(--text-muted);
        border-radius: 0;
        padding: 0;
        box-shadow: none;
    }

    .btn-deletar-ag,
    .btn-info-ag {
        background: var(--neu-bg);
        border: none;
        cursor: pointer;
        width: 36px;
        height: 36px;
        padding: 0;
        margin: 0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow:
            3px 3px 6px var(--neu-shadow-dark),
            -3px -3px 6px var(--neu-shadow-light);
        transition:
            box-shadow 0.15s,
            color 0.15s;
    }

    .btn-deletar-ag {
        color: var(--cancel);
    }

    .btn-deletar-ag:hover {
        color: var(--cancel-dark);
    }

    .btn-info-ag {
        color: var(--text-muted);
    }

    .btn-info-ag:hover {
        color: var(--focus);
    }

    .btn-deletar-ag:active,
    .btn-info-ag:active {
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

        .agendamentos-lista {
            max-height: 60vh;
        }

        .agendamento-botoes {
            padding: 0 16px 12px;
        }
    }
    .agendamento-item.cancelado {
        background: var(--cancel-light);
        box-shadow:
            5px 5px 10px color-mix(in srgb, var(--cancel-dark) 18%, transparent),
            -5px -5px 10px var(--neu-shadow-light);
    }

    .agendamento-item.cancelado:hover {
        box-shadow:
            3px 3px 6px color-mix(in srgb, var(--cancel-dark) 18%, transparent),
            -3px -3px 6px var(--neu-shadow-light);
    }

    .agendamento-item.cancelado .agendamento-faixa {
        background: var(--cancel);
    }

    .agendamento-item.cancelado .agendamento-data-hora {
        color: var(--cancel-dark);
    }

    .agendamento-item.ocioso {
        background: var(--warning-light);
    }

    .agendamento-item.ocioso .agendamento-faixa {
        background: var(--warning);
    }

    .agendamento-item.em-andamento {
        background: color-mix(in srgb, var(--focus) 16%, var(--white));
    }

    .agendamento-item.em-andamento .agendamento-faixa {
        background: var(--focus);
    }

    .badge-status.cancelado {
        background: var(--cancel-light);
        color: var(--cancel-dark);
    }

    .agendamento-justificativa {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 2px 0 0;
        font-size: 0.9rem;
        color: var(--cancel-dark);
    }

    .agendamento-justificativa .material-symbols-outlined {
        font-size: 19px;
        color: var(--cancel-dark);
    }
</style>
