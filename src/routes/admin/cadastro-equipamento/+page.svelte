<script>
    import { onMount } from "svelte";
    import CadastroCard from "$lib/components/admin/CadastroCard.svelte";
    import { cadastrarEquipamento } from "$lib/services/EquipamentoServices/Create_Equipamento_Service.js";
    import { carregarEquipamentos } from "$lib/services/EquipamentoServices/List_Equipamento_Service.js";
    import { atualizarEquipamentos } from "$lib/services/EquipamentoServices/Update_Equipamento_Service.js";
    import { goto } from "$app/navigation";
    import "$lib/styles/admin-cadastro.css";
    let token = "";
    let matriculaLogado = "";

    let novoEquipamento = {
        nome: "",
        N_patrimonio: null,
        obs: "",
        status: true,
    };
    let equipamentos = [];
    let carregando = false;
    let carregandoLista = false;
    let erro = "";
    let sucesso = "";
    let editando = false;
    let equipamentoEditandoId = null;

    onMount(async () => {
        token = localStorage.getItem("token") || "";
        matriculaLogado = localStorage.getItem("matricula") || "";

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
            equipamentos = await carregarEquipamentos(token);
        } catch (e) {
            erro = e?.message || "Não foi possível carregar os equipamentos.";
        } finally {
            carregandoLista = false;
        }
    }

    async function salvarEquipamento() {
        erro = "";
        sucesso = "";
        if (
            !novoEquipamento.nome.trim() ||
            !novoEquipamento.N_patrimonio ||
            !novoEquipamento.obs.trim()
        ) {
            erro = "Preencha todos os campos do formulário.";
            return;
        }
        carregando = true;
        try {
            if (editando && equipamentoEditandoId) {
                await atualizarEquipamentos(
                    equipamentoEditandoId,
                    novoEquipamento,
                    token,
                );
                sucesso = "Equipamento atualizado com sucesso.";
            } else {
                await cadastrarEquipamento(novoEquipamento, token);
                sucesso = "Equipamento cadastrado com sucesso.";
            }
            resetForm();
            await carregarLista();
        } catch (e) {
            erro = e?.message || "Erro ao salvar equipamento.";
        } finally {
            carregando = false;
        }
    }

    function editarEquipamento(eq) {
        novoEquipamento = { ...eq };
        equipamentoEditandoId = eq.id;
        editando = true;
        sucesso = "";
        erro = "";
    }

    function resetForm() {
        novoEquipamento = { nome: "", N_patrimonio: "", obs: "", status: true };
        editando = false;
        equipamentoEditandoId = null;
    }
</script>

<CadastroCard
    titulo="Portal de Agendamento"
    subtitulo="Cadastro de Equipamentos"
    onSair={() => goto("/main")}
    onSubmit={salvarEquipamento}
    onCancelar={resetForm}
    {editando}
    {carregando}
    {erro}
    {sucesso}
    iconeForm={editando ? "edit" : "add_circle"}
    tituloTabela="Equipamentos Cadastrados"
    iconeTabela="computer"
    totalRegistros={equipamentos.length}
    {carregandoLista}
    estadoVazioTexto="Nenhum equipamento cadastrado ainda."
    carregandoTexto="Carregando equipamentos..."
    temToggle={true}
>
    <!-- Campos do formulário -->
    <svelte:fragment slot="campos">
        <div class="field">
            <label for="nome-equipamento">Nome do Equipamento</label>
            <input
                id="nome-equipamento"
                type="text"
                bind:value={novoEquipamento.nome}
                placeholder="Ex: Notebook Dell"
                required
            />
        </div>
        <div class="field">
            <label for="numero-equipamento">Número</label>
            <input
                id="numero-equipamento"
                type="text"
                bind:value={novoEquipamento.N_patrimonio}
                placeholder="Ex: PAT-101"
                required
            />
        </div>
        <div class="field">
            <label for="obs-equipamento">Observação</label>
            <input
                id="obs-equipamento"
                type="text"
                bind:value={novoEquipamento.obs}
                placeholder="Ex: funciona apenas em 220V"
                required
            />
        </div>
    </svelte:fragment>

    <!-- Toggle de status -->
    <svelte:fragment slot="toggle">
        <label for="status-equipamento">Status</label>
        <div class="toggle-wrapper">
            <label class="toggle-switch">
                <input
                    id="status-equipamento"
                    type="checkbox"
                    bind:checked={novoEquipamento.status}
                />
                <span class="toggle-track"
                    ><span class="toggle-thumb"></span></span
                >
            </label>
            <span class="toggle-label"
                >{novoEquipamento.status ? "Ativo" : "Inativo"}</span
            >
        </div>
    </svelte:fragment>

    <!-- Cabeçalho da tabela -->
    <svelte:fragment slot="tabela-header">
        <div class="table-header">
            <div class="th flex-2">Nome</div>
            <div class="th flex-1">Número</div>
            <div class="th flex-2">Observação</div>
            <div class="th flex-1">Status</div>
            <div class="th flex-1">Ações</div>
        </div>
    </svelte:fragment>

    <!-- Linhas da tabela -->
    <svelte:fragment slot="tabela-body">
        {#each equipamentos as s, index}
            <div class="table-row {index % 2 === 0 ? 'even' : 'odd'}">
                <div class="td flex-2">
                    <span class="material-symbols-outlined icon-tiny"
                        >computer</span
                    >
                    <span class="text-truncate">{s.nome}</span>
                </div>
                <div class="td flex-1">
                    <span class="badge-numero">{s.N_patrimonio}</span>
                </div>
                <div class="td flex-2">
                    <span class="text-truncate">{s.obs}</span>
                </div>
                <div class="td flex-1">
                    <span class="badge-status {s.status ? 'ativo' : 'inativo'}">
                        {s.status ? "Ativo" : "Inativo"}
                    </span>
                </div>
                <div class="td flex-1 action-cell">
                    <button
                        class="btn-action edit"
                        on:click={() => editarEquipamento(s)}
                        title="Editar"
                    >
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                </div>
            </div>
        {/each}
    </svelte:fragment>
</CadastroCard>
