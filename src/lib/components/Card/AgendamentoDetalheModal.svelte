<script>
    // agendamento detalhado (passado como prop) usado para mostrar detalhes do agendamento em um modal
    import { goto } from "$app/navigation";
    export let ag;
    export let onFechar = () => {};
    /** @type {((ag: any) => void | Promise<void>) | null} */
    export let onCancelar = null;
    export let usuarioId = null;
    export let cargo = null;
    export let processando = false;
    let imagemQuebrada = false;

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

    $: linhas = [
        ["schedule", "Data e horário", dataHorario],
        ["groups", "Turma", ag.turma_nome || "—"],
        [
            "person",
            "Agendado por",
            ag.usuario_nome || "—",
            ag.user_id ? () => ir(rotaUsuario) : null,
        ],
        // AJUSTAR: campo da justificativa do agendamento
        [null, "Justificativa", ag.justificativa || "—"],
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
                <span class="rotulo-item">{rotuloItem}</span>
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

                {#if cancelado}
                    <span class="badge-cancelado">Cancelado</span>
                {:else if onCancelar && podeCancelar}
                    <button
                        class="btn-cancelar"
                        on:click={() => onCancelar(ag)}
                        disabled={processando}
                    >
                        {processando ? "Cancelando..." : "Cancelar agendamento"}
                    </button>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .escopo-agendamento-modal {
        --neu-bg: #e6e9ef;
        --dk: rgba(163, 177, 198, 0.55);
        --lt: rgba(255, 255, 255, 0.85);
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
        background: rgba(0, 0, 0, 0.45);
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
        box-shadow: 8px 8px 16px rgba(12, 12, 14, 0.45);
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
        color: #64748b;
        cursor: pointer;
        box-shadow: var(--fora);
        transition: color 0.15s;
    }
    .btn-fechar:hover {
        color: #ef4444;
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

    .foto {
        position: relative;
        flex: 0 0 200px;
        min-height: 200px;
        border-radius: 18px;
        overflow: hidden;
        box-shadow: var(--dentro);
    }
    .foto img {
        position: absolute;
        inset: 8px;
        width: calc(100% - 16px);
        height: calc(100% - 16px);
        object-fit: cover;
        border-radius: 12px;
    }
    .fallback {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4.5rem;
        color: #94a3b8;
    }

    .info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        padding-right: 2.2rem; /* respiro para o (x) */
    }

    .rotulo-item,
    .badge-cancelado {
        align-self: flex-start;
        padding: 4px 12px;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #2563eb;
        box-shadow: var(--dentro-sm);
    }
    .badge-cancelado {
        margin-top: auto;
        padding: 0.5rem 1.4rem;
        font-size: 0.8rem;
        color: #ef4444;
    }

    .nome {
        margin: 0;
        font-size: 1.35rem;
        line-height: 1.25;
        color: #1e293b;
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
        color: #64748b;
    }
    .dt .material-symbols-outlined {
        font-size: 0.95rem;
    }
    .dd {
        max-height: 120px;
        overflow-y: auto;
        font-size: 0.95rem;
        font-weight: 600;
        color: #334155;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
    }

    /* Botão cancelar embaixo das informações */
    .btn-cancelar {
        margin-top: auto;
        width: 100%;
        padding: 0.85rem 1rem;
        border: none;
        border-radius: 14px;
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 700;
        color: #fff;
        background: #ef4444;
        cursor: pointer;
        box-shadow: var(--fora);
        transition: background 0.15s;
    }
    .btn-cancelar:hover:not(:disabled) {
        background: #dc2626;
    }
    .btn-cancelar:active:not(:disabled) {
        background: #dc2626;
        box-shadow:
            inset 4px 4px 8px rgba(0, 0, 0, 0.25),
            inset -4px -4px 8px rgba(255, 255, 255, 0.2);
    }
    .btn-cancelar:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    @media (max-width: 520px) {
        .card {
            padding: 1.5rem 1.2rem;
        }
        .corpo {
            flex-direction: column;
        }
        .foto {
            flex-basis: auto;
            min-height: 180px;
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
        color: #64748b;
        cursor: pointer;
        box-shadow:
            2px 2px 4px var(--dk),
            -2px -2px 4px var(--lt);
        transition: color 0.15s;
    }
    .btn-i:hover {
        color: #2563eb;
    }
    .btn-i:active {
        box-shadow: var(--dentro-sm);
    }
    .btn-i .material-symbols-outlined {
        font-size: 0.95rem;
    }
</style>
