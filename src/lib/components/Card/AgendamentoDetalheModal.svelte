<script>
    // agendamento detalhado (passado como prop) usado para mostrar detalhes do agendamento em um modal
    import { goto } from "$app/navigation";
    export let ag;
    export let onFechar = () => {};
    /** @type {((ag: any) => void | Promise<void>) | null} */
    export let onCancelar = null;
    /** @type {((ag: any) => void | Promise<void>) | null} */
    export let onConfirmar = null;
    export let usuarioId = null;
    export let cargo = null;
    export let processando = false;
    let imagemQuebrada = false;
    let confirmando = false;
    let erroConfirmacao = "";

    $: k = ag.tipo === "equipamento" ? "equipamento" : "sala";
    $: recursoNome = ag[`${k}_nome`] || ag[`${k}_id`];
    $: recursoIcone = k === "sala" ? "meeting_room" : "devices";
    $: rotuloItem = k === "sala" ? "Sala" : "Equipamento";
    $: imagemOriginal =
        ag.fotoUrl ||
        ag.foto_url ||
        ag[`${k}_foto_url`] ||
        ag[`${k}_imagem`] ||
        ag[`${k}_foto`] ||
        ag[k]?.fotoUrl ||
        ag[k]?.foto_url ||
        ag[k]?.imagem ||
        ag[k]?.foto ||
        "";
    $: imagem = resolverImagem(imagemOriginal);
    $: if (imagem) imagemQuebrada = false;

    function resolverImagem(valor) {
        if (!valor || typeof valor !== "string") return "";
        const caminho = valor.trim();
        if (!caminho) return "";
        if (/^(https?:|data:|blob:)/i.test(caminho)) return caminho;

        try {
            return new URL(caminho, window.location.origin).href;
        } catch {
            return caminho;
        }
    }

    $: respId = ag[`${k}_responsavel_id`];
    $: podeCancelar =
        cargo === "admin" ||
        (usuarioId != null &&
            (ag.user_id == usuarioId ||
                (respId != null && String(respId) === String(usuarioId))));
    $: cancelado = ag.status === "inativo";
    $: podeConfirmar =
        ag.status === "ocioso" &&
        onConfirmar &&
        (respId == null
            ? cargo === "admin"
            : String(respId) === String(usuarioId));

    $: idRecurso = k === "sala" ? ag.sala_id : ag.equipamento_id;
    $: rotaRecurso = rotaInformacoes(k, idRecurso);
    $: rotaUsuario = rotaInformacoes("usuario", ag.user_id);

    function rotaInformacoes(tipo, id) {
        if (id == null || id === "") return "";

        const parametros = new URLSearchParams({ tipo, id: String(id) });

        return `/informacoes?${parametros.toString()}`;
    }
    function ir(rota) {
        console.log("ir() ->", rota);
        onFechar();
        goto(rota);
    }

    async function confirmar() {
        if (confirmando || !onConfirmar) return;
        confirmando = true;
        erroConfirmacao = "";
        try {
            await onConfirmar(ag);
            onFechar();
        } catch (e) {
            erroConfirmacao = e?.message || "Erro ao confirmar o agendamento.";
        } finally {
            confirmando = false;
        }
    }
    // Data "de parede" (ignora fuso), igual à lista e ao GradeMensal
    function parseData(s) {
        if (!s) return null;
        const d = new Date(String(s).replace(" ", "T").slice(0, 19));
        return isNaN(d.getTime()) ? null : d;
    }
    const dia = (d) => d.toLocaleDateString("pt-BR");
    const hora = (d) =>
        d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    $: ini = parseData(ag.data_hora_inicio);
    $: fim = parseData(ag.data_hora_fim);
    $: dataHorario = !ini
        ? "—"
        : !fim
          ? `${dia(ini)} · ${hora(ini)}`
          : dia(ini) === dia(fim)
            ? `${dia(ini)} · ${hora(ini)} → ${hora(fim)}`
            : `${dia(ini)} ${hora(ini)} → ${dia(fim)} ${hora(fim)}`;

    // Motivo informado ao cancelar (mesma ordem de campos usada na lista)
    $: justCancelamento =
        ag.justificativa_cancelamento ||
        ag.motivo_cancelamento ||
        ag.justificativa ||
        "";

    $: linhas = [
        ["schedule", "Data e horário", dataHorario],
        ["groups", "Turma", ag.turma_nome || "—"],
        [
            "person",
            "Agendado por",
            ag.usuario_nome || "—",
            ag.user_id ? () => ir(rotaUsuario) : null,
        ],
        [null, "Justificativa do agendamento", ag.obs || "—"],
        ...(cancelado
            ? [[null, "Justificativa do cancelamento", justCancelamento || "—"]]
            : []),
    ];
</script>

<svelte:window on:keydown={(e) => e.key === "Escape" && onFechar()} />

<!-- svelte-ignore a11y-click-events-have-key-events, a11y-no-static-element-interactions -->
<div class="escopo-agendamento-modal overlay" on:click={() => onFechar()}>
    <!-- svelte-ignore a11y-click-events-have-key-events, a11y-no-noninteractive-element-interactions -->
    <div
        class="card"
        role="dialog"
        aria-modal="true"
        aria-label="Detalhes do agendamento"
        tabindex="-1"
        on:click|stopPropagation
    >
        <button
            class="btn-fechar"
            on:click={() => onFechar()}
            aria-label="Fechar"
            title="Fechar"
        >
            <span class="material-symbols-outlined">close</span>
        </button>

        <div class="corpo">
            <div class="foto">
                {#if imagem && !imagemQuebrada}
                    <img
                        src={imagem}
                        alt={recursoNome}
                        on:error={() => (imagemQuebrada = true)}
                    />
                {:else}
                    <span class="material-symbols-outlined fallback"
                        >{recursoIcone}</span
                    >
                {/if}
            </div>

            <div class="info">
                <div class="selos">
                    <span class="rotulo-item">{rotuloItem}</span>
                    {#if cancelado}
                        <span class="rotulo-item cancelado">Cancelado</span>
                    {/if}
                </div>
                <div class="nome-linha">
                    <h2 class="nome">{recursoNome || "—"}</h2>
                    <button
                        class="btn-i"
                        on:click|stopPropagation={() => ir(rotaRecurso)}
                        title="Ver {rotuloItem.toLowerCase()}"
                        aria-label="Ver {rotuloItem.toLowerCase()}"
                    >
                        <span class="material-symbols-outlined">info</span>
                    </button>
                </div>

                {#each linhas as [icone, rotulo, valor, acao]}
                    <div class="linha">
                        <span class="dt">
                            {#if icone}
                                <span class="material-symbols-outlined"
                                    >{icone}</span
                                >
                            {/if}
                            {rotulo}
                        </span>
                        <div class="valor-linha">
                            <span class="dd">{valor}</span>
                            {#if acao}
                                <button
                                    class="btn-i"
                                    on:click|stopPropagation={acao}
                                    title="Ver usuário"
                                    aria-label="Ver usuário"
                                >
                                    <span class="material-symbols-outlined"
                                        >info</span
                                    >
                                </button>
                            {/if}
                        </div>
                    </div>
                {/each}

                {#if erroConfirmacao}
                    <p class="erro-confirmacao" role="alert">
                        {erroConfirmacao}
                    </p>
                {/if}
                {#if (!cancelado && onCancelar && podeCancelar) || podeConfirmar}
                    <div class="acoes-agendamento">
                        {#if podeConfirmar}
                            <button
                                class="btn-confirmar"
                                on:click={confirmar}
                                disabled={confirmando || processando}
                            >
                                {confirmando
                                    ? "Confirmando..."
                                    : "Confirmar agendamento"}
                            </button>
                        {/if}
                        {#if !cancelado && onCancelar && podeCancelar}
                            <button
                                class="btn-cancelar"
                                on:click={() => onCancelar(ag)}
                                disabled={processando || confirmando}
                            >
                                {processando
                                    ? "Cancelando..."
                                    : "Cancelar agendamento"}
                            </button>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .escopo-agendamento-modal {
        --neu-bg: var(--surface);
        --dk: var(--neu-shadow-dark);
        --lt: var(--neu-shadow-light);
        --fora: 6px 6px 12px var(--dk), -6px -6px 12px var(--lt);
        --dentro: inset 5px 5px 10px var(--dk), inset -5px -5px 10px var(--lt);
        --dentro-sm: inset 2px 2px 4px var(--dk), inset -2px -2px 4px var(--lt);
        font-family: "Inter", Arial, sans-serif;
    }

    .overlay {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        background: var(--overlay);
    }

    .card {
        position: relative;
        box-sizing: border-box;
        width: min(640px, 100%);
        max-height: 90vh;
        overflow-y: auto;
        padding: 2rem;
        border-radius: 24px;
        background: var(--neu-bg);
        box-shadow: 8px 8px 16px var(--shadow-dark-heavy);
    }

    /* (x) canto superior direito */
    .btn-fechar {
        position: absolute;
        top: 14px;
        right: 14px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: var(--neu-bg);
        color: var(--text-muted);
        cursor: pointer;
        box-shadow: var(--fora);
        transition: color 0.15s;
    }
    .btn-fechar:hover {
        color: var(--cancel);
    }
    .btn-fechar:active {
        box-shadow: var(--dentro-sm);
    }
    .btn-fechar .material-symbols-outlined {
        font-size: 1.2rem;
    }

    /* Foto à esquerda (altura total), informações à direita */
    .corpo {
        display: flex;
        gap: 1.5rem;
        align-items: stretch;
        padding-top: 0.5rem;
    }
    .selos {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .rotulo-item.cancelado {
        color: var(--cancel);
    }
    .foto {
        position: relative;
        flex: 0 0 280px;
        width: 280px;
        aspect-ratio: 1 / 1; /* altura = largura */
        align-self: flex-start; /* não estica com a coluna de informações */
        border-radius: 18px;
        overflow: hidden;
        box-shadow: var(--dentro);
    }
    .foto img {
        position: absolute;
        inset: 8px;
        width: calc(100% - 16px);
        height: calc(100% - 16px);
        object-fit: cover; /* preenche a caixa, cortando o excesso */
        object-position: center;
        border-radius: 12px;
    }
    .fallback {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4.5rem;
        color: var(--disabled-text);
    }

    .info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        padding-right: 2.2rem; /* respiro para o (x) */
    }

    .rotulo-item {
        align-self: flex-start;
        padding: 4px 12px;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--focus);
        box-shadow: var(--dentro-sm);
    }
    .nome {
        margin: 0;
        font-size: 1.35rem;
        line-height: 1.25;
        color: var(--text-dark);
        overflow-wrap: anywhere;
    }

    .linha {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .dt {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-muted);
    }
    .dt .material-symbols-outlined {
        font-size: 0.95rem;
    }
    .dd {
        max-height: 120px;
        overflow-y: auto;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-dark);
        white-space: pre-wrap;
        overflow-wrap: anywhere;
    }

    .acoes-agendamento {
        display: flex;
        gap: 0.75rem;
        margin-top: auto;
    }

    .btn-confirmar,
    .btn-cancelar {
        flex: 1 1 0;
        min-width: 0;
        padding: 0.85rem 1rem;
        border: none;
        border-radius: 14px;
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--white);
        cursor: pointer;
        box-shadow: var(--fora);
        transition: background 0.15s;
    }
    .btn-confirmar {
        background: var(--confirm);
    }
    .btn-confirmar:hover:not(:disabled) {
        background: var(--confirm-dark);
    }
    .btn-cancelar {
        background: var(--cancel);
    }
    .btn-cancelar:hover:not(:disabled) {
        background: var(--danger-text);
    }
    .btn-confirmar:active:not(:disabled) {
        background: var(--confirm-dark);
        box-shadow:
            inset 4px 4px 8px var(--shadow-dark-medium),
            inset -4px -4px 8px var(--overlay-light);
    }
    .btn-cancelar:active:not(:disabled) {
        background: var(--danger-text);
        box-shadow:
            inset 4px 4px 8px var(--shadow-dark-medium),
            inset -4px -4px 8px var(--overlay-light);
    }
    .btn-confirmar:disabled,
    .btn-cancelar:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .erro-confirmacao {
        margin: 0;
        color: var(--cancel-dark);
        font-size: 0.85rem;
    }

    @media (max-width: 520px) {
        .card {
            width: min(760px, 100%);
            padding: 1.5rem 1.2rem;
        }
        .corpo {
            flex-direction: column;
        }
        .foto {
            flex-basis: auto;
            width: 100%;
            max-width: 320px;
            align-self: center;
        }
        .info {
            padding-right: 0;
        }
    }
    .nome-linha,
    .valor-linha {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .nome-linha .nome,
    .valor-linha .dd {
        min-width: 0;
    }

    .btn-i {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: var(--neu-bg);
        color: var(--text-muted);
        cursor: pointer;
        box-shadow:
            2px 2px 4px var(--dk),
            -2px -2px 4px var(--lt);
        transition: color 0.15s;
    }
    .btn-i:hover {
        color: var(--focus);
    }
    .btn-i:active {
        box-shadow: var(--dentro-sm);
    }
    .btn-i .material-symbols-outlined {
        font-size: 0.95rem;
    }
</style>
