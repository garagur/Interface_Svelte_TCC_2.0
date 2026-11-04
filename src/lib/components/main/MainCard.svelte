<script>
    //mainCard
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import CalendarioAgendamentos from "$lib/components/Grades/GradeMensal.svelte";
    import CabecalhoGlobal from "$lib/components/main/CabecalhoGlobal.svelte";
    import AgendamentoBloco from "$lib/components/Card/BlocoAgendamentoCard.svelte";
    import ConfirmarDelecaoModal from "$lib/components/Card/ConfirmarDelecaoModal.svelte";
    import ListaAgendamentosCard from "$lib/components/Card/ListaAgendamentosCard.svelte";

    export let titulo = "";
    export let nome = "";
    export let matricula = "";
    export let cargo = "";
    export let usuarioId = null;
    export let agendamentos = [];
    export let carregando = false;
    export let erro = "";
    export let onSair = () => {};
    export let onNovoAgendamento = () => {};
    export let onConfirmarAgendamento = null;
    /** @type {(ag: any) => Promise<void>} */
    export let onDeletar = async () => {};

    let visao = "lista";
    let agendamentoParaDeletar = null;
    let cancelandoId = null; // ex: "sala-12" ou "equipamento-7" — null quando nada está em andamento

    function trocarVisao(novaVisao) {
        visao = novaVisao;
        localStorage.setItem("visao_agendamentos", novaVisao);
    }

    function irParaDetalhes(ag) {
        goto(`/agendamento/${ag.tipo}/${ag.id}`);
    }

    function abrirModalDeletar(ag) {
        if (cancelandoId) return;
        agendamentoParaDeletar = ag;
    }

    function fecharModalDeletar() {
        if (cancelandoId) return;
        agendamentoParaDeletar = null;
    }

    // Só controla o estado do modal; a chamada de API fica na página
    async function confirmarDeletar(ag) {
        cancelandoId = `${ag.tipo}-${ag.id}`;
        try {
            await onDeletar(ag);
            agendamentoParaDeletar = null;
        } catch {
            // a página já preenche `erro`; o modal continua aberto
        } finally {
            cancelandoId = null;
        }
    }

    function sair() {
        onSair();
    }

    onMount(() => {
        visao = localStorage.getItem("visao_agendamentos") || "lista";
    });

    $: agendamentosVisiveis = agendamentos;
    $: totalRegistros = agendamentosVisiveis.length;
</script>

<ConfirmarDelecaoModal
    agendamento={agendamentoParaDeletar}
    onConfirmar={confirmarDeletar}
    onCancelar={fecharModalDeletar}
    processando={!!cancelandoId}
/>

<div class="scaffold">
    <CabecalhoGlobal {titulo} {nome} {matricula} {cargo} onLogout={sair} />

    <main class="body-content">
        <div class="grade-header-title">
            <div class="title-left">
                <span class="material-symbols-outlined text-primary"
                    >calendar_month</span
                >
                <h2>Agendamentos</h2>
            </div>

            <div
                class="toggle-visao"
                role="group"
                aria-label="Modo de visualização"
            >
                <button
                    type="button"
                    class:ativo={visao === "lista"}
                    on:click={() => trocarVisao("lista")}
                    title="Lista de agendamentos"
                    aria-label="Lista de agendamentos"
                >
                    <span class="material-symbols-outlined">view_list</span>
                </button>
                <button
                    type="button"
                    class:ativo={visao === "calendario"}
                    on:click={() => trocarVisao("calendario")}
                    title="Grade mensal"
                    aria-label="Grade mensal"
                >
                    <span class="material-symbols-outlined"
                        >calendar_view_month</span
                    >
                </button>
            </div>

            <div class="badge">
                {totalRegistros}
                {totalRegistros === 1 ? "registro" : "registros"}
            </div>
        </div>

        {#if erro}
            <p class="msg-erro">{erro}</p>
        {/if}

        <div class="calendario-scroll-area">
            {#if visao === "lista"}
                <ListaAgendamentosCard
                    agendamentos={agendamentosVisiveis}
                    {carregando}
                    {usuarioId}
                    {cargo}
                    onDeletar={abrirModalDeletar}
                    onConfirmar={onConfirmarAgendamento}
                />
            {:else}
                <CalendarioAgendamentos
                    agendamentos={agendamentosVisiveis}
                    hojeStr={new Date().toISOString().slice(0, 10)}
                    carregandoLista={carregando}
                >
                    <svelte:fragment let:ag>
                        <AgendamentoBloco
                            {ag}
                            {usuarioId}
                            {cargo}
                            onDeletar={abrirModalDeletar}
                            onConfirmar={onConfirmarAgendamento}
                        />
                    </svelte:fragment>
                </CalendarioAgendamentos>
            {/if}
        </div>

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

<style>
    .msg-erro {
        color: var(--cancel-dark);
        background: color-mix(in srgb, var(--cancel) 8%, transparent);
        border-radius: 10px;
        padding: 10px 14px;
        font-family: "Inter", Arial, sans-serif;
        font-size: 0.9rem;
        margin: 0 0 0.75rem 0;
    }
</style>
