<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import AgendamentoCard from "$lib/components/agendamento/AgendamentoCard.svelte";
    import { carregarSalas } from "$lib/services/SalaServices/List_Sala_Service.js";
    import { carregarEquipamentos } from "$lib/services/EquipamentoServices/List_Equipamento_Service.js";

    let token = "";
    let matricula = "";

    // ── Form state ──
    let dataAgendamento = hoje();
    let horaInicio = "08:00";
    let horaFim = "10:00";
    let obs = "";

    // ── Data ──
    let salas = [];
    let equipamentos = [];
    let carregandoLista = false;

    // ── Itens selecionados ──
    let itensSelecionados = [];

    // ── Filtros ──
    let filtroTipo = "todos";
    let filtroBusca = "";

    // ── UI state ──
    let carregando = false;
    let erro = "";
    let sucesso = "";

    onMount(async () => {
        token = localStorage.getItem("token") || "";
        matricula = localStorage.getItem("matricula") || "";

        if (!token) {
            goto("/login");
            return;
        }
        await carregarLista();
    });

    async function carregarLista() {
        carregandoLista = true;
        erro = "";
        try {
            const [s, e] = await Promise.all([
                carregarSalas(token),
                carregarEquipamentos(token),
            ]);
            salas = s;
            equipamentos = e;
        } catch (e) {
            erro = e?.message || "Não foi possível carregar os itens.";
        } finally {
            carregandoLista = false;
        }
    }

    $: todosItens = [
        ...salas.map((s) => ({ ...s, tipo: "sala" })),
        ...equipamentos.map((e) => ({ ...e, tipo: "equipamento" })),
    ];

    $: itensFiltrados = todosItens.filter((item) => {
        const matchTipo = filtroTipo === "todos" || item.tipo === filtroTipo;
        const matchBusca = item.nome
            .toLowerCase()
            .includes(filtroBusca.toLowerCase());
        return matchTipo && matchBusca;
    });

    function jaSelecionado(id, tipo) {
        return itensSelecionados.some((i) => i.id === id && i.tipo === tipo);
    }

    function adicionarItem(item) {
        if (!item.status || jaSelecionado(item.id, item.tipo)) return;
        itensSelecionados = [...itensSelecionados, item];
    }

    function removerItem(id, tipo) {
        itensSelecionados = itensSelecionados.filter(
            (i) => !(i.id === id && i.tipo === tipo),
        );
    }

    function hoje() {
        return new Date().toISOString().slice(0, 10);
    }

    async function salvarAgendamento() {
        erro = "";
        sucesso = "";
        if (!dataAgendamento || !horaInicio || !horaFim) {
            erro = "Preencha a data e os horários.";
            return;
        }
        if (itensSelecionados.length === 0) {
            erro = "Selecione pelo menos um item para agendar.";
            return;
        }
        if (horaInicio >= horaFim) {
            erro = "A hora de início deve ser anterior à hora de fim.";
            return;
        }
        carregando = true;
        try {
            const payload = {
                matricula,
                data: dataAgendamento,
                hora_inicio: horaInicio,
                hora_fim: horaFim,
                obs,
                itens: itensSelecionados.map((i) => ({
                    id: i.id,
                    tipo: i.tipo,
                })),
            };
            // TODO: await criarAgendamento(payload, token);
            console.log("Payload agendamento:", payload);
            sucesso = "Agendamento realizado com sucesso.";
            resetForm();
        } catch (e) {
            erro = e?.message || "Erro ao realizar agendamento.";
        } finally {
            carregando = false;
        }
    }

    function resetForm() {
        dataAgendamento = hoje();
        horaInicio = "08:00";
        horaFim = "10:00";
        obs = "";
        itensSelecionados = [];
    }
</script>

<AgendamentoCard
    titulo="Portal de Agendamento"
    subtitulo="Novo Agendamento"
    onSair={() => goto("/main")}
    onSubmit={salvarAgendamento}
    onLimpar={resetForm}
    {carregando}
    {erro}
    {sucesso}
    totalRegistros={todosItens.length}
    {carregandoLista}
    estadoVazioTexto="Nenhum item encontrado."
    carregandoTexto="Carregando itens..."
    bind:filtroTipo
    bind:filtroBusca
>
    <!-- Campos do formulário -->
    <svelte:fragment slot="campos">
        <div class="field">
            <label for="data-agendamento">Data</label>
            <input
                id="data-agendamento"
                type="date"
                bind:value={dataAgendamento}
                min={hoje()}
                required
            />
        </div>
        <div class="field">
            <label for="hora-inicio">Hora de Início</label>
            <input
                id="hora-inicio"
                type="time"
                bind:value={horaInicio}
                required
            />
        </div>
        <div class="field">
            <label for="hora-fim">Hora de Fim</label>
            <input id="hora-fim" type="time" bind:value={horaFim} required />
        </div>
        <div class="field">
            <label for="obs-agendamento">Observação</label>
            <input
                id="obs-agendamento"
                type="text"
                bind:value={obs}
                placeholder="Ex: Aula de reposição"
            />
        </div>
    </svelte:fragment>

    <!-- Itens selecionados -->
    <svelte:fragment slot="itens-selecionados">
        <div class="selected-section">
            <span class="selected-label">
                <span class="material-symbols-outlined icon-tiny"
                    >checklist</span
                >
                Itens selecionados
                <span class="badge-count">{itensSelecionados.length}</span>
            </span>

            {#if itensSelecionados.length === 0}
                <p class="selected-empty">Nenhum item adicionado ainda.</p>
            {:else}
                <ul class="selected-list">
                    {#each itensSelecionados as item (item.id + item.tipo)}
                        <li class="selected-item">
                            <span
                                class="material-symbols-outlined icon-tiny tipo-icon"
                            >
                                {item.tipo === "sala"
                                    ? "meeting_room"
                                    : "devices"}
                            </span>
                            <span class="selected-nome">{item.nome}</span>
                            <button
                                type="button"
                                class="btn-remove"
                                on:click={() => removerItem(item.id, item.tipo)}
                                title="Remover"
                            >
                                <span class="material-symbols-outlined"
                                    >close</span
                                >
                            </button>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </svelte:fragment>

    <!-- Cabeçalho da tabela -->
    <svelte:fragment slot="tabela-header">
        <div class="table-header">
            <div class="th flex-2">Nome</div>
            <div class="th flex-1">Tipo</div>
            <div class="th flex-1">Status</div>
            <div class="th flex-1">Ação</div>
        </div>
    </svelte:fragment>

    <!-- Linhas da tabela -->
    <svelte:fragment slot="tabela-body">
        {#each itensFiltrados as item, index (item.id + item.tipo)}
            {@const selecionado = jaSelecionado(item.id, item.tipo)}
            {@const indisponivel = !item.status}
            <div
                class="table-row
        {index % 2 === 0 ? 'even' : 'odd'}
        {selecionado ? 'row-selected' : ''}
        {indisponivel ? 'row-disabled' : ''}"
            >
                <div class="td flex-2">
                    <span class="material-symbols-outlined icon-tiny">
                        {item.tipo === "sala" ? "meeting_room" : "devices"}
                    </span>
                    <span class="text-truncate">{item.nome}</span>
                </div>
                <div class="td flex-1">
                    <span class="badge-tipo {item.tipo}">
                        {item.tipo === "sala" ? "Sala" : "Equipamento"}
                    </span>
                </div>
                <div class="td flex-1">
                    <span
                        class="badge-status {item.status ? 'ativo' : 'inativo'}"
                    >
                        {item.status ? "Ativo" : "Inativo"}
                    </span>
                </div>
                <div class="td flex-1 action-cell">
                    {#if selecionado}
                        <button
                            type="button"
                            class="btn-action remove"
                            on:click={() => removerItem(item.id, item.tipo)}
                            title="Remover"
                        >
                            <span class="material-symbols-outlined">remove</span
                            >
                        </button>
                    {:else}
                        <button
                            type="button"
                            class="btn-action add"
                            on:click={() => adicionarItem(item)}
                            disabled={indisponivel}
                            title={indisponivel ? "Indisponível" : "Adicionar"}
                        >
                            <span class="material-symbols-outlined">add</span>
                        </button>
                    {/if}
                </div>
            </div>
        {/each}
    </svelte:fragment>
</AgendamentoCard>
