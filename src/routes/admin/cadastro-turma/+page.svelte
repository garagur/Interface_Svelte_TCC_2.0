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

    // pesquisa, ordenação e filtros extras
    let pesquisa = "";
    let ordenacao = "asc"; // "asc" | "desc"
    let filtroAno = "todos"; // "todos" | valor específico do ano_letivo
    let filtroSerie = "todos"; // "todos" | "1" | "2" | "3" ...

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

        if (!/^\d/.test(novaTurma.nome.trim())) {
            erro =
                "O nome da turma deve começar com um número (ex: 1A, 9º Ano A).";
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

    function mudarOrdenacao(novoValor) {
        ordenacao = novoValor;
    }

    // extrai o número inicial do nome da turma (ex: "1A" -> "1", "9º Ano A" -> "9")
    function extrairSerie(nome) {
        const match = (nome || "").match(/^\d+/);
        return match ? match[0] : null;
    }

    // opções dinâmicas geradas a partir dos dados carregados
    $: anosDisponiveis = [
        ...new Set(turmas.map((t) => t.ano_letivo).filter(Boolean)),
    ].sort((a, b) => b - a); // mais recente primeiro

    $: seriesDisponiveis = [
        ...new Set(turmas.map((t) => extrairSerie(t.nome)).filter(Boolean)),
    ].sort((a, b) => Number(a) - Number(b));

    // pipeline: pesquisa -> filtro ano -> filtro série -> ordenação
    $: turmasFiltradas = turmas
        .filter((t) => {
            if (!pesquisa.trim()) return true;
            const termo = pesquisa.toLowerCase();
            return (
                t.nome?.toLowerCase().includes(termo) ||
                String(t.ano_letivo ?? "").includes(termo)
            );
        })
        .filter((t) => {
            if (filtroAno === "todos") return true;
            return String(t.ano_letivo) === filtroAno;
        })
        .filter((t) => {
            if (filtroSerie === "todos") return true;
            return extrairSerie(t.nome) === filtroSerie;
        })
        .sort((a, b) => {
            const nomeA = (a.nome || "").toLowerCase();
            const nomeB = (b.nome || "").toLowerCase();
            return ordenacao === "asc"
                ? nomeA.localeCompare(nomeB)
                : nomeB.localeCompare(nomeA);
        });
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
    totalRegistros={turmasFiltradas.length}
    {carregandoLista}
    estadoVazioTexto="Nenhuma turma encontrada."
    carregandoTexto="Carregando turmas..."
    mostrarPesquisa={true}
    bind:pesquisa
    placeholderPesquisa="Pesquisar por nome ou ano..."
    {ordenacao}
    onOrdenarChange={mudarOrdenacao}
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
            <small class="dica-campo"
                >Deve começar com um número (ex: 1A, 9º Ano A).</small
            >
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

    <svelte:fragment slot="filtros-extra">
        <select class="select-ordenacao" bind:value={filtroAno}>
            <option value="todos">Todos os anos</option>
            {#each anosDisponiveis as ano}
                <option value={String(ano)}>{ano}</option>
            {/each}
        </select>

        <select class="select-ordenacao" bind:value={filtroSerie}>
            <option value="todos">Todas as séries</option>
            {#each seriesDisponiveis as serie}
                <option value={serie}>{serie}º</option>
            {/each}
        </select>
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
        {#each turmasFiltradas as t, index}
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
