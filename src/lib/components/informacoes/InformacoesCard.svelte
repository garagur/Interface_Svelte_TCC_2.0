<script>
    // InformacoesCard: card único usado por "Minhas Informações" e "Detalhes do Item"
    import { onDestroy } from "svelte";
    import ConfirmarDelecaoModal from "$lib/components/Card/ConfirmarDelecaoModal.svelte";
    import ListaAgendamentosCard from "$lib/components/Card/ListaAgendamentosCard.svelte";
    import GradeSemanal from "$lib/components/Grades/GradeSemanal.svelte";
    import BlocoCard from "$lib/components/Card/BlocoHorarioCard.svelte";

    // ─── Textos configuráveis ─────────────────────────────────────────
    export let subtitulo = "Detalhes do Item";
    export let tituloDados = "Dados";
    export let tituloEstatisticas = "Estatísticas";
    export let tituloAgendamentos = "Agendamentos";
    export let textoGradeVazia = "Nenhum horário cadastrado.";
    export let textoSemItem = "Selecione um item acima para ver os detalhes.";
    export let textoSemItemEstatisticas =
        "Selecione um item para ver as estatísticas.";

    // ─── Seletor de tipo/item ─────────────────────────────────────────
    export let mostrarSeletor = true;
    export let tipo = "sala";
    /** @type {((tipo: "sala" | "equipamento" | "usuario") => void) | null} */
    export let onTipoChange = null;
    export let itensDisponiveis = [];
    export let carregandoItens = false;
    export let itemSelecionadoId = null;
    /** @type {((id: string) => void) | null} */
    export let onItemChange = null;

    // ─── Dados do item ────────────────────────────────────────────────
    /**
     * @type {{ id: any, nome: string, email?: string, fotoUrl: string|null, formaFoto: "circular"|"quadrada", status: boolean, campos: Array<{chave?:string,icone:string,label:string,valor:string}> } | null}
     */
    export let item = null;
    export let carregandoItem = false;

    // Edição de perfil: só aparece se a página passar onSalvarPerfil
    /** @type {((dados: { nome: string, email: string, foto: File | null, removerFoto: boolean }) => Promise<void>) | null} */
    export let onSalvarPerfil = null;

    // Responsabilidades: [{ icone, titulo, itens: [{id, nome}], vazio }] ou null
    /** @type {Array<{ icone: string, titulo: string, itens: Array<{ id: any, nome: string }>, vazio: string }> | null} */
    export let responsabilidades = null;

    // ─── Estatísticas ─────────────────────────────────────────────────
    /**
     * @type {{ resumo: Array<{valor:number,label:string}>, destaques: Array<{icone:string,label:string,valor:string}>, heatmap: Array<{data:string,quantidade:number}> }}
     */
    export let estatisticas = { resumo: [], destaques: [], heatmap: [] };
    export let carregandoEstatisticas = false;

    // ─── Grade ────────────────────────────────────────────────────────
    export let mostrarGrade = false;
    export let tituloGrade = "Grade de Aulas";
    export let blocos = [];
    export let carregandoBlocos = false;
    export let mostrarTurmaGrade = true;

    // ─── Agendamentos ─────────────────────────────────────────────────
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

    // ─── Ano do heatmap ───────────────────────────────────────────────
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

    // ─── Modal de deleção ─────────────────────────────────────────────
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

    // ─── Edição de perfil ─────────────────────────────────────────────
    const FOTO_TIPOS = ["image/jpeg", "image/png", "image/webp"];
    const FOTO_MAX_BYTES = 2 * 1024 * 1024;

    let editandoPerfil = false;
    let salvandoPerfil = false;
    let erroPerfil = "";
    let nomeEdit = "";
    let emailEdit = "";
    let fotoArquivo = null;
    let fotoPreview = "";
    let removerFoto = false;
    let inputFoto;

    // foto exibida no círculo: prévia > foto atual > nada (placeholder)
    $: fotoExibida = editandoPerfil
        ? fotoPreview || (removerFoto ? "" : item?.fotoUrl || "")
        : item?.fotoUrl || "";

    $: classeForma =
        item?.formaFoto === "quadrada" ? "foto-quadrada" : "foto-circular";

    function limparPreview() {
        if (fotoPreview) URL.revokeObjectURL(fotoPreview);
        fotoPreview = "";
    }

    onDestroy(limparPreview);

    function iniciarEdicao() {
        nomeEdit = item?.nome || "";
        emailEdit = item?.email || "";
        fotoArquivo = null;
        removerFoto = false;
        erroPerfil = "";
        limparPreview();
        editandoPerfil = true;
    }

    function cancelarEdicao() {
        if (salvandoPerfil) return;
        limparPreview();
        fotoArquivo = null;
        removerFoto = false;
        erroPerfil = "";
        editandoPerfil = false;
    }

    function escolherFoto(event) {
        const input = event.currentTarget;
        const arquivo = input.files?.[0];
        if (!arquivo) return;

        if (!FOTO_TIPOS.includes(arquivo.type)) {
            erroPerfil = "Use uma imagem nos formatos jpg, png ou webp.";
            input.value = "";
            return;
        }
        if (arquivo.size > FOTO_MAX_BYTES) {
            erroPerfil = "A imagem pode ter no máximo 2 MB.";
            input.value = "";
            return;
        }

        erroPerfil = "";
        limparPreview();
        fotoArquivo = arquivo;
        fotoPreview = URL.createObjectURL(arquivo);
        removerFoto = false;
    }

    // Descarta a prévia; se já existe foto salva, marca para remover no servidor
    function removerFotoAtual() {
        limparPreview();
        fotoArquivo = null;
        if (inputFoto) inputFoto.value = "";
        removerFoto = !!item?.fotoUrl;
    }

    async function salvarPerfil() {
        if (salvandoPerfil) return;

        const nome = nomeEdit.trim();
        const email = emailEdit.trim();
        if (!nome || !email) {
            erroPerfil = "Nome e e-mail são obrigatórios.";
            return;
        }

        salvandoPerfil = true;
        erroPerfil = "";
        try {
            await onSalvarPerfil?.({
                nome,
                email,
                foto: fotoArquivo,
                removerFoto,
            });
            limparPreview();
            fotoArquivo = null;
            removerFoto = false;
            editandoPerfil = false;
        } catch (e) {
            erroPerfil = e?.message || "Erro ao salvar o perfil.";
        } finally {
            salvandoPerfil = false;
        }
    }

    // ─── Heatmap ──────────────────────────────────────────────────────
    function nivelHeatmap(quantidade) {
        if (!quantidade) return 0;
        if (quantidade === 1) return 1;
        if (quantidade === 2) return 2;
        if (quantidade <= 4) return 3;
        return 4;
    }

    // Semanas (colunas) x dias da semana (linhas), cobrindo o ano civil inteiro
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
</script>

<ConfirmarDelecaoModal
    agendamento={agendamentoParaDeletar}
    onConfirmar={confirmarDelecao}
    onCancelar={fecharModal}
    {processando}
/>

<div
    class="informacoes"
    class:minhas-informacoes={!mostrarSeletor}
    class:item-informacoes={mostrarSeletor}
>
    <div class="scaffold">
        <header class="app-bar">
            <div class="title-section">
                <h1>Portal de Agendamento</h1>
                <span>{subtitulo}</span>
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
            {#if mostrarSeletor}
                <div class="card seletor-card">
                    <div class="seletor-item">
                        <select
                            class="seletor-dropdown"
                            on:change={(e) =>
                                onItemChange?.(e.currentTarget.value)}
                            disabled={carregandoItens}
                        >
                            <option
                                value=""
                                disabled
                                selected={itemSelecionadoId == null ||
                                    itemSelecionadoId === ""}
                            >
                                Selecionar item
                            </option>
                            {#each itensDisponiveis as it (it.id)}
                                <option
                                    value={String(it.id)}
                                    selected={String(it.id) ===
                                        String(itemSelecionadoId)}
                                >
                                    {it.nome}
                                </option>
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
                                <span class="material-symbols-outlined"
                                    >person</span
                                >
                                Usuários
                            </button>
                        </div>
                    </div>
                </div>
            {/if}

            <!-- Dados do item -->
            <div class="card" id="dados">
                <div class="card-header">
                    <span class="material-symbols-outlined">info</span>
                    <h3>{tituloDados}</h3>
                    {#if item && !carregandoItem && !editandoPerfil && onSalvarPerfil}
                        <button
                            type="button"
                            class="btn-editar-perfil"
                            on:click={iniciarEdicao}
                        >
                            <span class="material-symbols-outlined">edit</span>
                            Editar
                        </button>
                    {/if}
                </div>

                {#if carregandoItem}
                    <p class="estado-vazio">Carregando dados...</p>
                {:else if !item}
                    <p class="estado-vazio">{textoSemItem}</p>
                {:else}
                    <div class="item-conteudo" class:editando={editandoPerfil}>
                        <div class="perfil-foto-area">
                            {#if fotoExibida}
                                <img
                                    class="item-foto {classeForma}"
                                    src={fotoExibida}
                                    alt="Foto de {item.nome}"
                                />
                            {:else}
                                <div
                                    class="item-foto-placeholder {classeForma}"
                                >
                                    {iniciais(
                                        editandoPerfil ? nomeEdit : item.nome,
                                    )}
                                </div>
                            {/if}

                            {#if editandoPerfil}
                                <input
                                    bind:this={inputFoto}
                                    class="input-foto-oculto"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    on:change={escolherFoto}
                                />
                                <div class="foto-acoes">
                                    <button
                                        type="button"
                                        class="btn-perfil-sec"
                                        disabled={salvandoPerfil}
                                        on:click={() => inputFoto?.click()}
                                    >
                                        <span class="material-symbols-outlined"
                                            >photo_camera</span
                                        >
                                        {fotoExibida
                                            ? "Trocar foto"
                                            : "Escolher foto"}
                                    </button>
                                    {#if fotoPreview || (item?.fotoUrl && !removerFoto)}
                                        <button
                                            type="button"
                                            class="btn-perfil-sec btn-perfil-remover"
                                            disabled={salvandoPerfil}
                                            on:click={removerFotoAtual}
                                        >
                                            <span
                                                class="material-symbols-outlined"
                                                >delete</span
                                            >
                                            Remover foto
                                        </button>
                                    {/if}
                                </div>
                            {/if}
                        </div>

                        <div class="item-dados">
                            {#if editandoPerfil}
                                <form
                                    class="perfil-form"
                                    on:submit|preventDefault={salvarPerfil}
                                >
                                    <label class="campo-perfil">
                                        <span class="campo-rotulo">Nome</span>
                                        <input
                                            type="text"
                                            maxlength="255"
                                            bind:value={nomeEdit}
                                            disabled={salvandoPerfil}
                                        />
                                    </label>
                                    <label class="campo-perfil">
                                        <span class="campo-rotulo">E-mail</span>
                                        <input
                                            type="email"
                                            bind:value={emailEdit}
                                            disabled={salvandoPerfil}
                                        />
                                    </label>
                                    {#if emailEdit.trim() !== (item?.email || "")}
                                        <small class="campo-dica">
                                            O código de login é enviado para
                                            este e-mail. Confira se está
                                            correto.
                                        </small>
                                    {/if}

                                    {#if erroPerfil}
                                        <p class="msg-erro">{erroPerfil}</p>
                                    {/if}

                                    <div class="perfil-acoes">
                                        <button
                                            type="submit"
                                            class="btn-perfil-primario"
                                            disabled={salvandoPerfil}
                                        >
                                            {salvandoPerfil
                                                ? "Salvando..."
                                                : "Salvar"}
                                        </button>
                                        <button
                                            type="button"
                                            class="btn-perfil-sec btn-perfil-cancelar"
                                            disabled={salvandoPerfil}
                                            on:click={cancelarEdicao}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            {:else}
                                <div class="item-nome-linha">
                                    <p class="item-nome">{item.nome}</p>
                                    {#if item.status === false}
                                        <span class="badge-inativo"
                                            >Inativo</span
                                        >
                                    {/if}
                                </div>
                            {/if}

                            {#each item.campos as campo}
                                {#if !(editandoPerfil && campo.chave === "email")}
                                    <div class="perfil-info-linha">
                                        <span class="material-symbols-outlined"
                                            >{campo.icone}</span
                                        >
                                        {campo.label}: {campo.valor}
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    </div>

                    {#if responsabilidades}
                        <div class="responsabilidades">
                            {#each responsabilidades as bloco}
                                <div class="responsabilidade-bloco">
                                    <span class="responsabilidade-titulo">
                                        <span class="material-symbols-outlined"
                                            >{bloco.icone}</span
                                        >
                                        {bloco.titulo}
                                    </span>
                                    {#if bloco.itens.length}
                                        <div class="chips">
                                            {#each bloco.itens as r (r.id)}
                                                <span class="chip"
                                                    >{r.nome}</span
                                                >
                                            {/each}
                                        </div>
                                    {:else}
                                        <span class="responsabilidade-vazio"
                                            >{bloco.vazio}</span
                                        >
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {/if}
                {/if}
            </div>

            <!-- Estatísticas -->
            <div class="card" id="estatisticas">
                <div class="card-header">
                    <span class="material-symbols-outlined">query_stats</span>
                    <h3>{tituloEstatisticas}</h3>
                </div>

                {#if carregandoEstatisticas}
                    <p class="estado-vazio">Carregando estatísticas...</p>
                {:else if !item}
                    <p class="estado-vazio">{textoSemItemEstatisticas}</p>
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
                        <p class="estado-vazio">{textoGradeVazia}</p>
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
                        <h3>{tituloAgendamentos}</h3>
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
    @import "$lib/styles/informacoes.css";
</style>
