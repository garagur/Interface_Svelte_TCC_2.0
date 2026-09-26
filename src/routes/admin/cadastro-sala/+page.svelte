<script>
    import { onMount } from "svelte";
    import CadastroCard from "$lib/components/admin/CadastroCard.svelte";
    import { cadastrarSala } from "$lib/services/SalaServices/Create_Sala_Service.js";
    import { carregarSalas } from "$lib/services/SalaServices/List_Sala_Service.js";
    import { atualizarSalas } from "$lib/services/SalaServices/Update_Sala_Service.js";
    import { carregarUsuarios } from "$lib/services/UserServices/List_User_Service.js";
    import { goto } from "$app/navigation";

    const FOTO_TIPOS = ["image/jpeg", "image/png", "image/webp"];
    const FOTO_MAX_BYTES = 2 * 1024 * 1024;

    let token = "";
    let matriculaLogado = "";
    let fotoArquivo = null;
    let fotoPreview = "";
    let removerFoto = false;
    let inputFoto;

    $: fotoExibida = fotoPreview || (removerFoto ? "" : novaSala.fotoUrl || "");

    function limparPreview() {
        if (fotoPreview) URL.revokeObjectURL(fotoPreview);
        fotoPreview = "";
    }

    let novaSala = {
        nome: "",
        obs: "",
        status: true,
        responsavel_id: null,
        fotoUrl: null,
    };
    let salas = [];
    let usuarios = [];
    let carregando = false;
    let carregandoLista = false;
    let erro = "";
    let sucesso = "";
    let editando = false;
    let salaEditandoId = null;

    // pesquisa, ordenação e filtro de status
    let pesquisa = "";
    let ordenacao = "asc"; // "asc" | "desc"
    let filtroStatus = "todos"; // "todos" | "ativos" | "inativos"

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
        if (!novaSala.nome) {
            erro = "Preencha o nome da sala.";
            return;
        }
        carregando = true;
        try {
            const dadosEnviar = {
                nome: novaSala.nome,
                obs: novaSala.obs,
                status: novaSala.status,
                responsavel_id: novaSala.responsavel_id,
                foto: fotoArquivo,
                removerFoto,
            };

            if (editando && salaEditandoId) {
                await atualizarSalas(salaEditandoId, dadosEnviar, token);
                sucesso = "Sala atualizada com sucesso.";
            } else {
                await cadastrarSala(dadosEnviar, token);
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
            nome: sala.nome,
            obs: sala.obs,
            status: sala.status,
            responsavel_id: sala.responsavel_id ?? sala.responsavel?.id ?? null,
            fotoUrl: sala.fotoUrl ?? sala.foto_url ?? null,
        };
        salaEditandoId = sala.id;
        editando = true;
        sucesso = "";
        erro = "";
        limparPreview();
        fotoArquivo = null;
        removerFoto = false;
    }

    function resetForm() {
        novaSala = {
            nome: "",
            obs: "",
            status: true,
            responsavel_id: null,
            fotoUrl: null,
        };
        editando = false;
        salaEditandoId = null;
        limparPreview();
        fotoArquivo = null;
        removerFoto = false;
    }

    function mudarOrdenacao(novoValor) {
        ordenacao = novoValor;
    }
    function escolherFoto(event) {
        const input = event.currentTarget;
        const arquivo = input.files?.[0];
        if (!arquivo) return;

        if (!FOTO_TIPOS.includes(arquivo.type)) {
            erro = "Use uma imagem nos formatos jpg, png ou webp.";
            input.value = "";
            return;
        }
        if (arquivo.size > FOTO_MAX_BYTES) {
            erro = "A imagem pode ter no máximo 2 MB.";
            input.value = "";
            return;
        }

        erro = "";
        limparPreview();
        fotoArquivo = arquivo;
        fotoPreview = URL.createObjectURL(arquivo);
        removerFoto = false;
    }
    function removerFotoAtual() {
        limparPreview();
        fotoArquivo = null;
        if (inputFoto) inputFoto.value = "";
        removerFoto = !!novaSala.fotoUrl;
    }
    // pipeline: pesquisa -> filtro de status -> ordenação
    $: salasFiltradas = salas
        .filter((s) => {
            if (!pesquisa.trim()) return true;
            const termo = pesquisa.toLowerCase();
            const nomeResp = s.responsavel?.nome || s.responsavel?.name || "";
            return (
                s.nome?.toLowerCase().includes(termo) ||
                s.obs?.toLowerCase().includes(termo) ||
                nomeResp.toLowerCase().includes(termo)
            );
        })
        .filter((s) => {
            if (filtroStatus === "ativos") return s.status;
            if (filtroStatus === "inativos") return !s.status;
            return true; // "todos"
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
    totalRegistros={salasFiltradas.length}
    {carregandoLista}
    estadoVazioTexto="Nenhuma sala encontrada."
    carregandoTexto="Carregando salas..."
    temToggle={true}
    mostrarPesquisa={true}
    bind:pesquisa
    placeholderPesquisa="Pesquisar por nome, observação ou responsável..."
    {ordenacao}
    onOrdenarChange={mudarOrdenacao}
>
    <svelte:fragment slot="foto">
        <div class="foto-area">
            <div class="foto-preview">
                {#if fotoExibida}
                    <img src={fotoExibida} alt="Foto da sala" />
                {:else}
                    <span class="material-symbols-outlined">meeting_room</span>
                {/if}
            </div>
            <input
                bind:this={inputFoto}
                class="input-foto-oculto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                on:change={escolherFoto}
            />
            <div class="foto-acoes">
                <button
                    type="button"
                    class="btn-foto-sec"
                    disabled={carregando}
                    on:click={() => inputFoto?.click()}
                >
                    <span class="material-symbols-outlined">photo_camera</span>
                    {fotoExibida ? "Trocar foto" : "Adicionar foto"}
                </button>
                {#if fotoExibida}
                    <button
                        type="button"
                        class="btn-foto-sec"
                        disabled={carregando}
                        on:click={removerFotoAtual}
                    >
                        <span class="material-symbols-outlined">delete</span>
                        Remover foto
                    </button>
                {/if}
            </div>
        </div>
    </svelte:fragment>
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

    <svelte:fragment slot="filtros-extra">
        <div class="filtro-status">
            <button
                type="button"
                class="chip {filtroStatus === 'todos' ? 'ativo' : ''}"
                on:click={() => (filtroStatus = "todos")}
            >
                Todos
            </button>
            <button
                type="button"
                class="chip {filtroStatus === 'ativos' ? 'ativo' : ''}"
                on:click={() => (filtroStatus = "ativos")}
            >
                Ativos
            </button>
            <button
                type="button"
                class="chip {filtroStatus === 'inativos' ? 'ativo' : ''}"
                on:click={() => (filtroStatus = "inativos")}
            >
                Inativos
            </button>
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
            <div class="th flex-2">Observação</div>
            <div class="th flex-2">Responsável</div>
            <div class="th flex-1">Status</div>
            <div class="th flex-1">Ações</div>
        </div>
    </svelte:fragment>

    <svelte:fragment slot="tabela-body">
        {#each salasFiltradas as s, index}
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
                        type="button"
                        class="btn-action info"
                        title="Informações"
                        aria-label="Informações da sala"
                    >
                        <span class="material-symbols-outlined">info</span>
                    </button>
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
