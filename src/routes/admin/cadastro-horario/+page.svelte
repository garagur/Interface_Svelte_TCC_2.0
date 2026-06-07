<script>
    import { onMount } from "svelte";
    import HorarioCard from "$lib/components/admin/HorarioCard.svelte";
    import { cadastrarHorario } from "$lib/services/HorarioServices/Create_Horario_Service.js";
    import { carregarHorarios } from "$lib/services/HorarioServices/List_Horario_Service.js";
    import { deletarHorario } from "$lib/services/HorarioServices/Deleted_Horario_Service.js";
    import { carregarTurmas } from "$lib/services/TurmaServices/List_Turma_Service.js";
    import { carregarSalas } from "$lib/services/SalaServices/List_Sala_Service.js";
    import { carregarUsuarios } from "$lib/services/UserServices/List_User_Service.js";
    import { goto } from "$app/navigation";

    let token = "";
    let turmas = [];
    let salas = [];
    let professores = [];
    let blocos = [];
    let turma_id = null;

    let novoBloco = {
        dia_semana: "segunda",
        hora_inicio: "",
        hora_fim: "",
        disciplina: "",
        professor_id: null,
        sala_id: null,
    };

    let carregando = false;
    let carregandoLista = false;
    let erro = "";
    let sucesso = "";

    const dias = [
        "segunda",
        "terca",
        "quarta",
        "quinta",
        "sexta",
        "sabado",
        "domingo",
    ];

    // Reage à mudança de turma_id
    $: if (turma_id) {
        carregarLista(turma_id);
    } else {
        blocos = [];
    }

    onMount(async () => {
        token = localStorage.getItem("token") || "";
        if (!token) {
            erro = "Token não encontrado. Faça login novamente.";
            return;
        }
        await Promise.all([
            carregarListaTurmas(),
            carregarListaSalas(),
            carregarListaProfessores(),
        ]);
    });

    async function carregarListaTurmas() {
        try {
            turmas = await carregarTurmas(token);
        } catch (e) {
            erro = e?.message || "Erro ao carregar turmas.";
        }
    }

    async function carregarListaSalas() {
        try {
            salas = await carregarSalas(token);
        } catch (e) {
            erro = e?.message || "Erro ao carregar salas.";
        }
    }

    async function carregarListaProfessores() {
        try {
            const usuarios = await carregarUsuarios(token);
            professores = usuarios.filter((u) => u.cargo === "educador");
        } catch (e) {
            erro = e?.message || "Erro ao carregar professores.";
        }
    }

    async function carregarLista(id = null) {
        carregandoLista = true;
        erro = "";
        try {
            blocos = await carregarHorarios(token, id);
        } catch (e) {
            erro = e?.message || "Erro ao carregar horários.";
        } finally {
            carregandoLista = false;
        }
    }

    async function adicionarBloco() {
        erro = "";
        sucesso = "";

        if (!turma_id) {
            erro = "Selecione uma turma antes de adicionar um horário.";
            return;
        }

        if (!novoBloco.sala_id) {
            erro = "Selecione uma sala.";
            return;
        }

        if (!novoBloco.professor_id) {
            erro = "Selecione um professor.";
            return;
        }

        if (
            !novoBloco.hora_inicio ||
            !novoBloco.hora_fim ||
            !novoBloco.disciplina
        ) {
            erro = "Preencha todos os campos do bloco.";
            return;
        }

        if (novoBloco.hora_inicio >= novoBloco.hora_fim) {
            erro = "O horário de início deve ser anterior ao horário de fim.";
            return;
        }

        carregando = true;
        try {
            await cadastrarHorario({ ...novoBloco, turma_id }, token);
            sucesso = "Bloco adicionado com sucesso.";
            novoBloco = {
                dia_semana: novoBloco.dia_semana,
                hora_inicio: "",
                hora_fim: "",
                disciplina: "",
                professor_id: null,
                sala_id: null,
            };
            await carregarLista(turma_id);
        } catch (e) {
            erro = e?.message || "Erro ao adicionar bloco.";
        } finally {
            carregando = false;
        }
    }

    async function removerBloco(id) {
        erro = "";
        try {
            await deletarHorario(id, token);
            await carregarLista(turma_id);
        } catch (e) {
            erro = e?.message || "Erro ao remover bloco.";
        }
    }
</script>

<HorarioCard
    {turmas}
    {salas}
    {professores}
    {blocos}
    bind:turma_id
    bind:novoBloco
    {dias}
    {carregando}
    {carregandoLista}
    {erro}
    {sucesso}
    onAdicionar={adicionarBloco}
    onRemover={removerBloco}
    onSair={() => goto("/main")}
/>
