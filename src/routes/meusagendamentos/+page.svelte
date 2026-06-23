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

    async function deletar(ag) {
        try {
            await deletarAgendamentoSala(ag.id, token);
            agendamentos = agendamentos.filter((a) => a.id !== ag.id);
        } catch (e) {
            erro = e?.message || "Erro ao deletar agendamento.";
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
    onDeletar={deletar}
/>
