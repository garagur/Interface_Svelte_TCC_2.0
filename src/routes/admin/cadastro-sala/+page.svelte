<script>
    import { onMount } from "svelte";
    import CadastroCard from "$lib/components/admin/CadastroCard.svelte";
    import { cadastrarSala } from "$lib/services/SalaServices/Create_Sala_Service.js";
    import { carregarSalas } from "$lib/services/SalaServices/List_Sala_Service.js";
    import { atualizarSalas } from "$lib/services/SalaServices/Update_Sala_Service.js";
    import { carregarUsuarios } from "$lib/services/UserServices/List_User_Service.js";
    import { goto } from "$app/navigation";

    let token = "";
    let matriculaLogado = "";

    let novaSala = {
        nome: "",
        obs: "",
        status: true,
        responsavel_id: null,
    };
    let salas = [];
    let usuarios = [];
    let carregando = false;
    let carregandoLista = false;
    let erro = "";
    let sucesso = "";
    let editando = false;
    let salaEditandoId = null;

    onMount(async () => {
        token = localStorage.getItem("token") || "";
        matriculaLogado = localStorage.getItem("matricula") || "";

        if (!token) {
            erro = "Token não encontrado. Faça login novamente.";
            return;
        }
        await Promise.all([carregarLista(), carregarListaUsuarios()]);
    });

    async function carregarLista() {
        carregandoLista = true;
        erro = "";
        try {
            salas = await carregarSalas(token);
        } catch (e) {
            erro = e?.message || "Não foi possível carregar as salas.";
        } finally {
            carregandoLista = false;
        }
    }

    async function carregarListaUsuarios() {
        try {
            usuarios = await carregarUsuarios(token);
        } catch (e) {
            // não bloqueia o formulário se falhar, só fica sem opções
            usuarios = [];
        }
    }

    async function salvarSala() {
        erro = "";
        sucesso = "";
        if (!novaSala.nome || !novaSala.obs) {
            erro = "Preencha todos os campos do formulário.";
            return;
        }
        carregando = true;
        try {
            if (editando && salaEditandoId) {
                await atualizarSalas(salaEditandoId, novaSala, token);
                sucesso = "Sala atualizada com sucesso.";
            } else {
                await cadastrarSala(novaSala, token);
                sucesso = "Sala cadastrada com sucesso.";
            }
            resetForm();
            await carregarLista();
        } catch (e) {
            erro = e?.message || "Erro ao salvar sala.";
        } finally {
            carregando = false;
        }
    }

    function editarSala(sala) {
        novaSala = {
            ...sala,
            responsavel_id: sala.responsavel_id ?? sala.responsavel?.id ?? null,
        };
        salaEditandoId = sala.id;
        editando = true;
        sucesso = "";
        erro = "";
    }

    function resetForm() {
        novaSala = {
            nome: "",
            obs: "",
            status: true,
            responsavel_id: null,
        };
        editando = false;
        salaEditandoId = null;
    }
</script>

<CadastroCard
    titulo="Portal de Agendamento"
    subtitulo="Cadastro de Salas"
    onSair={() => goto("/main")}
    onSubmit={salvarSala}
    onCancelar={resetForm}
    {editando}
    {carregando}
    {erro}
    {sucesso}
    iconeForm={editando ? "meeting_room" : "add_home"}
    tituloTabela="Salas Cadastradas"
    iconeTabela="door_front"
    totalRegistros={salas.length}
    {carregandoLista}
    estadoVazioTexto="Nenhuma sala cadastrada ainda."
    carregandoTexto="Carregando salas..."
    temToggle={true}
>
    <svelte:fragment slot="campos">
        <div class="field">
            <label for="nome-sala">Nome da Sala</label>
            <input
                id="nome-sala"
                type="text"
                bind:value={novaSala.nome}
                placeholder="Ex: Sala de Reunião A"
                required
            />
        </div>
        <div class="field">
            <label for="obs-sala">Observação</label>
            <input
                id="obs-sala"
                type="text"
                bind:value={novaSala.obs}
                placeholder="Ex: Capacidade para 10 pessoas"
                required
            />
        </div>
        <div class="field">
            <label for="responsavel-sala">Responsável</label>
            <select id="responsavel-sala" bind:value={novaSala.responsavel_id}>
                <option value={null}>Nenhum responsável</option>
                {#each usuarios as u}
                    <option value={u.id}>{u.nome}</option>
                {/each}
            </select>
        </div>
    </svelte:fragment>

    <svelte:fragment slot="toggle">
        <label for="status-sala">Status</label>
        <div class="toggle-wrapper">
            <label class="toggle-switch">
                <input
                    id="status-sala"
                    type="checkbox"
                    bind:checked={novaSala.status}
                />
                <span class="toggle-track"
                    ><span class="toggle-thumb"></span></span
                >
            </label>
            <span class="toggle-label"
                >{novaSala.status ? "Ativo" : "Inativo"}</span
            >
        </div>
    </svelte:fragment>

    <svelte:fragment slot="tabela-header">
        <div class="table-header">
            <div class="th flex-2">
                <span
                    class="material-symbols-outlined"
                    style="font-size:16px; margin-right:4px; vertical-align:middle"
                    >meeting_room</span
                >
                Nome
            </div>
            <div class="th flex-1">Número</div>
            <div class="th flex-2">Observação</div>
            <div class="th flex-2">Responsável</div>
            <div class="th flex-1">Status</div>
            <div class="th flex-1">Ações</div>
        </div>
    </svelte:fragment>

    <svelte:fragment slot="tabela-body">
        {#each salas as s, index}
            <div class="table-row {index % 2 === 0 ? 'even' : 'odd'}">
                <div class="td flex-2">
                    <span class="text-truncate">{s.nome}</span>
                </div>
                <div class="td flex-2">
                    <span class="text-truncate">{s.obs}</span>
                </div>
                <div class="td flex-2">
                    <span class="text-truncate"
                        >{s.responsavel?.nome ||
                            s.responsavel?.name ||
                            "—"}</span
                    >
                </div>
                <div class="td flex-1">
                    <span class="badge-status {s.status ? 'ativo' : 'inativo'}">
                        {s.status ? "Ativo" : "Inativo"}
                    </span>
                </div>
                <div class="td flex-1 action-cell">
                    <button
                        class="btn-action edit"
                        on:click={() => editarSala(s)}
                        title="Editar"
                    >
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                </div>
            </div>
        {/each}
    </svelte:fragment>
</CadastroCard>
