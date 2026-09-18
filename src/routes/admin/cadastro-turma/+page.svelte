<!--+page.svelte de cadastro turma-->
<script>
    import { onMount } from "svelte";
    import CadastroCard from "$lib/components/admin/CadastroCard.svelte";
    import { cadastrarTurma } from "$lib/services/TurmaServices/Create_Turma_Service.js";
    import { carregarTurmas } from "$lib/services/TurmaServices/List_Turma_Service.js";
    import { atualizarTurma } from "$lib/services/TurmaServices/Update_Turma_Service.js";
    import { goto } from "$app/navigation";

    let token = "";

    // campos do formulário
    let novaSerie = null; // 1 a 10
    let novaLetra = ""; // A a Z
    let novoTurno = "";
    let novoGrau = "";
    let novoAnoLetivo = null;

    const TURNOS = ["matutino", "vespertino", "noturno", "integral"];
    const GRAUS = ["fundamental", "medio", "superior"];

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

    // força a letra a ficar sempre maiúscula e com 1 caractere
    function normalizarLetra() {
        if (!novaLetra) return;
        novaLetra = novaLetra.trim().slice(-1).toUpperCase();
    }

    async function salvarTurma() {
        erro = "";
        sucesso = "";

        if (
            !novaSerie ||
            !novaLetra ||
            !novoTurno ||
            !novoGrau ||
            !novoAnoLetivo
        ) {
            erro = "Preencha todos os campos do formulário.";
            return;
        }

        const serieNum = Number(novaSerie);
        if (!Number.isInteger(serieNum) || serieNum < 1 || serieNum > 10) {
            erro = "A série deve ser um número entre 1 e 10.";
            return;
        }

        if (!/^[A-Za-z]$/.test(novaLetra)) {
            erro = "A turma deve ser uma única letra de A a Z.";
            return;
        }

        const payload = {
            serie: serieNum,
            turma: novaLetra.toUpperCase(),
            turno: novoTurno,
            grau: novoGrau,
            ano_letivo: novoAnoLetivo,
        };

        carregando = true;
        try {
            if (editando && turmaEditandoId) {
                await atualizarTurma(turmaEditandoId, payload, token);
                sucesso = "Turma atualizada com sucesso.";
            } else {
                await cadastrarTurma(payload, token);
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
        novaSerie = turma.serie || null;
        novaLetra = turma.turma || "";
        novoTurno = turma.turno || "";
        novoGrau = turma.grau || "";
        novoAnoLetivo = turma.ano_letivo;
        turmaEditandoId = turma.id;
        editando = true;
        sucesso = "";
        erro = "";
    }

    function resetForm() {
        novaSerie = null;
        novaLetra = "";
        novoTurno = "";
        novoGrau = "";
        novoAnoLetivo = null;
        editando = false;
        turmaEditandoId = null;
    }

    function mudarOrdenacao(novoValor) {
        ordenacao = novoValor;
    }

    // opções dinâmicas geradas a partir dos dados carregados
    $: anosDisponiveis = [
        ...new Set(turmas.map((t) => t.ano_letivo).filter(Boolean)),
    ].sort((a, b) => b - a); // mais recente primeiro

    $: seriesDisponiveis = [
        ...new Set(turmas.map((t) => t.serie).filter(Boolean)),
    ].sort((a, b) => Number(a) - Number(b));

    // pipeline: pesquisa -> filtro ano -> filtro série -> ordenação
    $: turmasFiltradas = turmas
        .filter((t) => {
            if (!pesquisa.trim()) return true;
            const termo = pesquisa.toLowerCase();
            return (
                t.nome?.toLowerCase().includes(termo) ||
                t.turno?.toLowerCase().includes(termo) ||
                t.grau?.toLowerCase().includes(termo) ||
                String(t.ano_letivo ?? "").includes(termo)
            );
        })
        .filter((t) => {
            if (filtroAno === "todos") return true;
            return String(t.ano_letivo) === filtroAno;
        })
        .filter((t) => {
            if (filtroSerie === "todos") return true;
            return String(t.serie) === filtroSerie;
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
    placeholderPesquisa="Pesquisar por nome, turno, grau ou ano..."
    {ordenacao}
    onOrdenarChange={mudarOrdenacao}
>
    <svelte:fragment slot="campos">
        <div class="field">
            <label for="serie-turma">Série</label>
            <input
                id="serie-turma"
                type="number"
                min="1"
                max="10"
                bind:value={novaSerie}
                placeholder="Ex: 9"
                required
            />
            <small class="dica-campo">Número de 1 a 10.</small>
        </div>
        <div class="field">
            <label for="letra-turma">Turma</label>
            <input
                id="letra-turma"
                type="text"
                maxlength="1"
                style="text-transform: uppercase;"
                bind:value={novaLetra}
                on:input={normalizarLetra}
                placeholder="Ex: A"
                required
            />
            <small class="dica-campo">Letra de A a Z.</small>
        </div>
        <div class="field">
            <label for="turno-turma">Turno</label>
            <select id="turno-turma" bind:value={novoTurno} required>
                <option value="" disabled selected>Selecione o turno</option>
                {#each TURNOS as t}
                    <option value={t}
                        >{t.charAt(0).toUpperCase() + t.slice(1)}</option
                    >
                {/each}
            </select>
        </div>
        <div class="field">
            <label for="grau-turma">Grau</label>
            <select id="grau-turma" bind:value={novoGrau} required>
                <option value="" disabled selected>Selecione o grau</option>
                {#each GRAUS as g}
                    <option value={g}
                        >{g.charAt(0).toUpperCase() + g.slice(1)}</option
                    >
                {/each}
            </select>
        </div>
        <div class="field">
            <label for="ano-letivo">Ano Letivo</label>
            <input
                id="ano-letivo"
                type="number"
                bind:value={novoAnoLetivo}
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
                <option value={String(serie)}>{serie}º</option>
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
            <div class="th flex-1">Turno</div>
            <div class="th flex-1">Grau</div>
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
                    <span class="text-truncate">{t.turno}</span>
                </div>
                <div class="td flex-1">
                    <span class="text-truncate">{t.grau}</span>
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
