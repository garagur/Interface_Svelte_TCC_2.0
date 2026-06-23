<script>
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import CalendarioAgendamentos from "$lib/components/MesGrade/GradeMensal.svelte";
    import AgendamentoBloco from "$lib/components/Card/BlocoAgendamentoCard.svelte";
    import ConfirmarDelecaoModal from "$lib/components/Card/ConfirmarDelecaoModal.svelte";
    import { deletarAgendamentoSala } from "$lib/services/AgendamentoServices/AgendamentoSala/Deleted_Agendamento_Sala_Service.js";

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

    function irParaDetalhes(ag) {
        goto(`/agendamento/${ag.tipo}/${ag.id}`);
    }

    function hoje() {
        return new Date().toISOString().slice(0, 10);
    }

    function abrirModalDeletar(ag) {
        agendamentoParaDeletar = ag;
    }

    function fecharModalDeletar() {
        agendamentoParaDeletar = null;
    }

    async function confirmarDeletar(ag) {
        fecharModalDeletar();
        try {
            if (ag.tipo === "sala") {
                await deletarAgendamentoSala(ag.id, token);
            }
            agendamentos = agendamentos.filter(
                (a) => a.id !== ag.id || a.tipo !== ag.tipo,
            );
        } catch (e) {
            erro = e?.message || "Erro ao deletar agendamento.";
        }
    }

    onMount(() => {
        token = localStorage.getItem("token") || "";
        usuarioId = localStorage.getItem("user_id");
        cargo = localStorage.getItem("cargo");
    });

    $: totalRegistros = agendamentos.length;
</script>

<ConfirmarDelecaoModal
    agendamento={agendamentoParaDeletar}
    onConfirmar={confirmarDeletar}
    onCancelar={fecharModalDeletar}
/>

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

        <CalendarioAgendamentos
            {agendamentos}
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
