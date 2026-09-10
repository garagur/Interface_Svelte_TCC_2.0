<script>
    //mainCard
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { tick } from "svelte";
    import CalendarioAgendamentos from "$lib/components/MesGrade/GradeMensal.svelte";
    import AgendamentoBloco from "$lib/components/Card/BlocoAgendamentoCard.svelte";
    import ConfirmarDelecaoModal from "$lib/components/Card/ConfirmarDelecaoModal.svelte";
    import { deletarAgendamentoSala } from "$lib/services/AgendamentoServices/AgendamentoSala/Deleted_Agendamento_Sala_Service.js";
    import { deletarAgendamentoEquipamento } from "$lib/services/AgendamentoServices/AgendamentoEquipamento/Deleted_Agendamento_equipamento.js";

    export let titulo = "";
    export let matricula = "";
    export let cargo = "";
    export let onSair = () => {};
    export let onNovoAgendamento = () => {};
    export let agendamentos = [];
    export let carregando = false;
    export let erro = "";

    let token = "";
    let usuarioId = null;
    let agendamentoParaDeletar = null;
    let cancelandoId = null; // ex: "sala-12" ou "equipamento-7" — null quando nada está em andamento
    let mostrarMenuUsuario = false;

    function irParaDetalhes(ag) {
        goto(`/agendamento/${ag.tipo}/${ag.id}`);
    }

    function hoje() {
        return new Date().toISOString().slice(0, 10);
    }

    function abrirModalDeletar(ag) {
        if (cancelandoId) return; // já tem um cancelamento em andamento, ignora
        agendamentoParaDeletar = ag;
    }

    function fecharModalDeletar() {
        if (cancelandoId) return; // não deixa fechar no meio da requisição
        agendamentoParaDeletar = null;
    }

    async function confirmarDeletar(ag) {
        cancelandoId = `${ag.tipo}-${ag.id}`;
        erro = "";
        try {
            if (ag.tipo === "sala") {
                await deletarAgendamentoSala(
                    ag.id,
                    token,
                    ag.justificativa || "",
                );
            } else if (ag.tipo === "equipamento") {
                await deletarAgendamentoEquipamento(
                    ag.id,
                    token,
                    ag.justificativa || "",
                );
            }
            agendamentos = agendamentos.filter(
                (a) => a.id !== ag.id || a.tipo !== ag.tipo,
            );
            agendamentoParaDeletar = null;
        } catch (e) {
            erro = e?.message || "Erro ao deletar agendamento.";
        } finally {
            cancelandoId = null;
        }
    }

    function alternarMenuUsuario() {
        mostrarMenuUsuario = !mostrarMenuUsuario;
    }

    function fecharMenuUsuario() {
        mostrarMenuUsuario = false;
    }

    async function irPara(rota) {
        fecharMenuUsuario();
        const [caminho, hash] = rota.split("#");
        await goto(caminho);
        await tick();

        if (hash) {
            document.getElementById(hash)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }

    function sair() {
        fecharMenuUsuario();
        onSair();
    }

    onMount(() => {
        token = localStorage.getItem("token") || "";
        usuarioId = localStorage.getItem("user_id");
        cargo = localStorage.getItem("cargo");
    });

    $: agendamentosVisiveis = agendamentos.filter(
        (a) => a.status !== "inativo",
    );
    $: totalRegistros = agendamentosVisiveis.length;
</script>

<svelte:window on:click={fecharMenuUsuario} />

<ConfirmarDelecaoModal
    agendamento={agendamentoParaDeletar}
    onConfirmar={confirmarDeletar}
    onCancelar={fecharModalDeletar}
    processando={!!cancelandoId}
/>

<div class="scaffold">
    <header class="app-bar">
        <div class="title-section">
            <h1>{titulo}</h1>
            <span>Matrícula: {matricula}</span>
        </div>

        <nav class="nav-menu">
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
            <div class="user-menu" on:click|stopPropagation>
                <button
                    class="btn-icon"
                    on:click={alternarMenuUsuario}
                    title="Minha conta"
                    aria-haspopup="true"
                    aria-expanded={mostrarMenuUsuario}
                >
                    <span class="material-symbols-outlined">account_circle</span
                    >
                </button>

                {#if mostrarMenuUsuario}
                    <ul class="user-menu-dropdown" role="menu">
                        <li role="none">
                            <button
                                role="menuitem"
                                on:click={() =>
                                    irPara("/minhasinformacoes#dados")}
                            >
                                <span class="material-symbols-outlined"
                                    >person</span
                                >
                                Meus Dados
                            </button>
                        </li>
                        <li role="none">
                            <button
                                role="menuitem"
                                on:click={() =>
                                    irPara("/minhasinformacoes#estatisticas")}
                            >
                                <span class="material-symbols-outlined"
                                    >query_stats</span
                                >
                                Minhas Estatísticas
                            </button>
                        </li>
                        <li role="none">
                            <button
                                role="menuitem"
                                on:click={() =>
                                    irPara("/minhasinformacoes#agendamentos")}
                            >
                                <span class="material-symbols-outlined"
                                    >event_available</span
                                >
                                Meus Agendamentos
                            </button>
                        </li>
                        <li class="user-menu-separador" role="none"></li>
                        <li role="none">
                            <button
                                role="menuitem"
                                class="user-menu-sair"
                                on:click={sair}
                            >
                                <span class="material-symbols-outlined"
                                    >logout</span
                                >
                                Sair
                            </button>
                        </li>
                    </ul>
                {/if}
            </div>
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

        {#if erro}
            <p class="msg-erro">{erro}</p>
        {/if}

        <div class="calendario-scroll-area">
            <CalendarioAgendamentos
                agendamentos={agendamentosVisiveis}
                hojeStr={hoje()}
                carregandoLista={carregando}
            >
                <svelte:fragment let:ag>
                    <AgendamentoBloco
                        {ag}
                        {usuarioId}
                        {cargo}
                        onDeletar={abrirModalDeletar}
                    />
                </svelte:fragment>
            </CalendarioAgendamentos>
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
        color: var(--cancel-dark, #b3261e);
        background: rgba(217, 45, 32, 0.08);
        border-radius: 10px;
        padding: 10px 14px;
        font-family: "Inter", Arial, sans-serif;
        font-size: 0.9rem;
        margin: 0 0 0.75rem 0;
    }
</style>
