<script>
    import { onMount } from "svelte";
    import HorarioCard from "$lib/components/admin/HorarioCard.svelte";
    import { cadastrarHorario } from "$lib/services/HorarioServices/Create_Horario_Service.js";
    import { carregarHorarios } from "$lib/services/HorarioServices/List_Horario_Service.js";
    import { deletarHorario } from "$lib/services/HorarioServices/Deleted_Horario_Service.js";
    import { carregarTurmas } from "$lib/services/TurmaServices/List_Turma_Service.js";
    import { carregarSalas } from "$lib/services/SalaServices/List_Sala_Service.js";
    import { goto } from "$app/navigation";
    import "$lib/styles/horario.css";

    let token = "";
    let turmas = [];
    let salas = [];
    let blocos = [];
    let turma_id = null;

    let novoBloco = {
        dia_semana: "segunda",
        hora_inicio: "",
        hora_fim: "",
        disciplina: "",
        professor_id: "",
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

    onMount(async () => {
        token = localStorage.getItem("token") || "";
        if (!token) {
            erro = "Token não encontrado. Faça login novamente.";
            return;
        }
        await Promise.all([
            carregarLista(),
            carregarListaTurmas(),
            carregarListaSalas(),
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

    async function carregarLista() {
        carregandoLista = true;
        try {
            blocos = await carregarHorarios(token);
        } catch (e) {
            erro = e?.message || "Erro ao carregar horários.";
        } finally {
            carregandoLista = false;
        }
    }

    function blocosOrdenados(dia) {
        return blocos
            .filter(
                (b) =>
                    b.dia_semana === dia &&
                    (!turma_id || b.turma_id == turma_id),
            )
            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
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

        if (
            !novoBloco.hora_inicio ||
            !novoBloco.hora_fim ||
            !novoBloco.disciplina ||
            !novoBloco.professor_id
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
                professor_id: "",
                sala_id: null,
            };
            await carregarLista();
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
            await carregarLista();
        } catch (e) {
            erro = e?.message || "Erro ao remover bloco.";
        }
    }
</script>

<HorarioCard
    {turmas}
    {salas}
    bind:turma_id
    bind:novoBloco
    {dias}
    {blocosOrdenados}
    {carregando}
    {carregandoLista}
    {erro}
    {sucesso}
    onAdicionar={adicionarBloco}
    onRemover={removerBloco}
    onSair={() => goto("/main")}
/>
