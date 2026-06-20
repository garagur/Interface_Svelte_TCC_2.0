<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import MeusAgendamentosCard from "$lib/components/meusagendamentos/MeusAgendamentosCard.svelte";
    import { carregarHorariosProfessor } from "$lib/services/HorarioServices/List_Horario_Service.js";
    import { carregarAgendamentosSalas } from "$lib/services/AgendamentoServices/AgendamentoSala/List_Agendamento_Sala_Service.js";
    import { deletarAgendamentoSala } from "$lib/services/AgendamentoServices/AgendamentoSala/Deleted_Agendamento_Sala_Service.js";

    let token = "";
    let professor_id = "";

    let blocos = [];
    let agendamentos = [];

    let carregandoBlocos = false;
    let carregandoAgendamentos = false;
    let erro = "";

    // ── Confirmação de exclusão ──
    let agendamentoParaDeletar = null;
    let deletando = false;

    onMount(async () => {
        token = localStorage.getItem("token") || "";
        professor_id = localStorage.getItem("user_id") || "";

        if (!token) {
            goto("/login");
            return;
        }

        await Promise.all([carregarGrade(), carregarMeusAgendamentos()]);
    });

    async function carregarGrade() {
        carregandoBlocos = true;
        try {
            blocos = await carregarHorariosProfessor(token, professor_id);
        } catch (e) {
            erro = e?.message || "Erro ao carregar grade de aulas.";
        } finally {
            carregandoBlocos = false;
        }
    }

    async function carregarMeusAgendamentos() {
        carregandoAgendamentos = true;
        try {
            const todos = await carregarAgendamentosSalas(token, null);
            agendamentos = todos.filter(
                (ag) => String(ag.user_id) === String(professor_id),
            );
        } catch (e) {
            erro = e?.message || "Erro ao carregar agendamentos.";
        } finally {
            carregandoAgendamentos = false;
        }
    }

    function pedirConfirmacaoDeletar(ag) {
        agendamentoParaDeletar = ag;
    }

    function cancelarDeletar() {
        agendamentoParaDeletar = null;
    }

    async function confirmarDeletar() {
        if (!agendamentoParaDeletar) return;
        deletando = true;
        try {
            await deletarAgendamentoSala(agendamentoParaDeletar.id, token);
            agendamentos = agendamentos.filter(
                (a) => a.id !== agendamentoParaDeletar.id,
            );
            agendamentoParaDeletar = null;
        } catch (e) {
            erro = e?.message || "Erro ao deletar agendamento.";
        } finally {
            deletando = false;
        }
    }
</script>

<MeusAgendamentosCard
    {blocos}
    {agendamentos}
    {carregandoBlocos}
    {carregandoAgendamentos}
    {erro}
    onSair={() => goto("/main")}
    onDeletar={pedirConfirmacaoDeletar}
/>

{#if agendamentoParaDeletar}
    <div class="overlay-confirmar">
        <div class="popup-confirmar">
            <h3>Tem certeza que deseja deletar esse agendamento?</h3>
            <p>Essa ação não pode ser desfeita.</p>
            <div class="popup-acoes">
                <button
                    class="btn-secondary"
                    on:click={cancelarDeletar}
                    disabled={deletando}
                >
                    Cancelar
                </button>
                <button
                    class="btn-danger"
                    on:click={confirmarDeletar}
                    disabled={deletando}
                >
                    {deletando ? "Deletando..." : "Deletar"}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .overlay-confirmar {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        font-family: Arial, sans-serif;
    }

    .popup-confirmar {
        background: var(--white, #fff);
        border-radius: 12px;
        padding: 24px;
        max-width: 380px;
        width: 90%;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        font-family: Arial, sans-serif;
    }

    .popup-confirmar h3 {
        margin: 0 0 10px 0;
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
    }

    .popup-confirmar p {
        margin: 0 0 18px 0;
        font-size: 14px;
        color: #64748b;
    }

    .popup-acoes {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }

    .btn-secondary {
        background: #e2e8f0;
        color: #334155;
        border: none;
        border-radius: 8px;
        padding: 10px 18px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
    }

    .btn-danger {
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 18px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
    }

    .btn-danger:disabled,
    .btn-secondary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
