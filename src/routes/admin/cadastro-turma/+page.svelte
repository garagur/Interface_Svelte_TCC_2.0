<script>
    import { onMount } from "svelte";
    import CadastroCard from "$lib/components/admin/CadastroCard.svelte";
    import { cadastrarTurma } from "$lib/services/TurmaServices/Create_Turma_Service.js";
    import { carregarTurmas } from "$lib/services/TurmaServices/List_Turma_Service.js";
    import { atualizarTurma } from "$lib/services/TurmaServices/Update_Turma_Service.js";
    import { goto } from "$app/navigation";

    let token = "";
    let novaTurma = { nome: "", ano_letivo: null };
    let turmas = [];
    let carregando = false;
    let carregandoLista = false;
    let erro = "";
    let sucesso = "";
    let editando = false;
    let turmaEditandoId = null;

    onMount(async () => {
        token = localStorage.getItem("token") || "";
        if (!token) {
            erro = "Token não encontrado. Faça login novamente.";
            return;
        }
        await carregarLista();
    });

    async function carregarLista() {
        carregandoLista = true;
        erro = "";
        try {
            turmas = await carregarTurmas(token);
        } catch (e) {
            erro = e?.message || "Não foi possível carregar as turmas.";
        } finally {
            carregandoLista = false;
        }
    }

    async function salvarTurma() {
        erro = "";
        sucesso = "";
        if (!novaTurma.nome || !novaTurma.ano_letivo) {
            erro = "Preencha todos os campos do formulário.";
            return;
        }
        carregando = true;
        try {
            if (editando && turmaEditandoId) {
                await atualizarTurma(turmaEditandoId, novaTurma, token);
                sucesso = "Turma atualizada com sucesso.";
            } else {
                await cadastrarTurma(novaTurma, token);
                sucesso = "Turma cadastrada com sucesso.";
            }
            resetForm();
            await carregarLista();
        } catch (e) {
            erro = e?.message || "Erro ao salvar turma.";
        } finally {
            carregando = false;
        }
    }

    function editarTurma(turma) {
        novaTurma = { ...turma };
        turmaEditandoId = turma.id;
        editando = true;
        sucesso = "";
        erro = "";
    }

    function resetForm() {
        novaTurma = { nome: "", ano_letivo: null };
        editando = false;
        turmaEditandoId = null;
    }
</script>

<CadastroCard
    titulo="Portal de Agendamento"
    subtitulo="Cadastro de Turmas"
    onSair={() => goto("/main")}
    onSubmit={salvarTurma}
    onCancelar={resetForm}
    {editando}
    {carregando}
    {erro}
    {sucesso}
    iconeForm={editando ? "edit" : "add_circle"}
    tituloTabela="Turmas Cadastradas"
    iconeTabela="groups"
    totalRegistros={turmas.length}
    {carregandoLista}
    estadoVazioTexto="Nenhuma turma cadastrada ainda."
    carregandoTexto="Carregando turmas..."
>
    <svelte:fragment slot="campos">
        <div class="field">
            <label for="nome-turma">Nome da Turma</label>
            <input
                id="nome-turma"
                type="text"
                bind:value={novaTurma.nome}
                placeholder="Ex: 9º Ano A"
                required
            />
        </div>
        <div class="field">
            <label for="ano-letivo">Ano Letivo</label>
            <input
                id="ano-letivo"
                type="number"
                bind:value={novaTurma.ano_letivo}
                placeholder="Ex: 2026"
                required
            />
        </div>
    </svelte:fragment>

    <svelte:fragment slot="tabela-header">
        <div class="table-header">
            <div class="th flex-2">
                <span
                    class="material-symbols-outlined"
                    style="font-size:16px; margin-right:4px; vertical-align:middle"
                    >groups</span
                >
                Nome
            </div>
            <div class="th flex-1">Ano Letivo</div>
            <div class="th flex-1">Ações</div>
        </div>
    </svelte:fragment>

    <svelte:fragment slot="tabela-body">
        {#each turmas as t, index}
            <div class="table-row {index % 2 === 0 ? 'even' : 'odd'}">
                <div class="td flex-2">
                    <span class="text-truncate">{t.nome}</span>
                </div>
                <div class="td flex-1">
                    <span class="badge-numero">{t.ano_letivo}</span>
                </div>
                <div class="td flex-1 action-cell">
                    <button
                        class="btn-action edit"
                        on:click={() => editarTurma(t)}
                        title="Editar"
                    >
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                </div>
            </div>
        {/each}
    </svelte:fragment>
</CadastroCard>
