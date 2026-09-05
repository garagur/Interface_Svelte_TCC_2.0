<script>
  import { onMount } from "svelte";
  import CadastroCard from "$lib/components/admin/CadastroCard.svelte";
  import { cadastrarUsuario } from "$lib/services/UserServices/Create_User_Service.js";
  import { carregarUsuarios } from "$lib/services/UserServices/List_User_Service.js";
  import { atualizarUsuario } from "$lib/services/UserServices/Update_User_Service.js";
  import { goto } from "$app/navigation";

  let token = "";
  let matriculaLogado = "";

  let novoUsuario = {
    nome: "",
    email: "",
    cargo: "",
    matricula: "",
    status: true,
  };
  let usuarios = [];
  let carregando = false;
  let carregandoLista = false;
  let erro = "";
  let sucesso = "";
  let editando = false;
  let usuarioEditandoId = null;

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
    await carregarLista();
  });

  async function carregarLista() {
    carregandoLista = true;
    erro = "";
    try {
      usuarios = await carregarUsuarios(token);
    } catch (e) {
      erro = e?.message || "Não foi possível carregar os usuários.";
    } finally {
      carregandoLista = false;
    }
  }

  async function salvarUsuario() {
    erro = "";
    sucesso = "";
    if (
      !novoUsuario.nome ||
      !novoUsuario.email ||
      !novoUsuario.cargo ||
      !novoUsuario.matricula
    ) {
      erro = "Preencha todos os campos do formulário.";
      return;
    }
    carregando = true;
    try {
      if (editando && usuarioEditandoId) {
        await atualizarUsuario(usuarioEditandoId, novoUsuario, token);
        sucesso = "Usuário atualizado com sucesso.";
      } else {
        await cadastrarUsuario(novoUsuario, token);
        sucesso = "Usuário cadastrado com sucesso.";
      }
      resetForm();
      await carregarLista();
    } catch (e) {
      erro = e?.message || "Erro ao salvar usuário.";
    } finally {
      carregando = false;
    }
  }

  function editarUsuario(usuario) {
    novoUsuario = {
      ...usuario,
      status: usuario.status ?? true,
    };
    usuarioEditandoId = usuario.id;
    editando = true;
    sucesso = "";
    erro = "";
  }

  function resetForm() {
    novoUsuario = {
      nome: "",
      email: "",
      cargo: "",
      matricula: "",
      status: true,
    };
    editando = false;
    usuarioEditandoId = null;
  }

  async function alternarStatus(usuario) {
    if (usuario.matricula === matriculaLogado) {
      alert("Você não pode desabilitar o seu próprio usuário!");
      return;
    }

    const novoStatus = !usuario.status;
    const acao = novoStatus ? "habilitar" : "desabilitar";

    if (!confirm(`Tem certeza que deseja ${acao} este usuário?`)) {
      return;
    }

    erro = "";
    sucesso = "";
    try {
      await atualizarUsuario(
        usuario.id,
        { ...usuario, status: novoStatus },
        token,
      );
      sucesso = `Usuário ${acao === "desabilitar" ? "desabilitado" : "habilitado"} com sucesso.`;
      await carregarLista();
    } catch (e) {
      erro = e?.message || "Erro ao alterar status do usuário.";
    }
  }

  function mudarOrdenacao(novoValor) {
    ordenacao = novoValor;
  }

  $: usuariosFiltrados = usuarios
    .filter((u) => {
      if (!pesquisa.trim()) return true;
      const termo = pesquisa.toLowerCase();
      return (
        u.nome?.toLowerCase().includes(termo) ||
        u.email?.toLowerCase().includes(termo) ||
        u.matricula?.toLowerCase().includes(termo)
      );
    })
    .filter((u) => {
      if (filtroStatus === "ativos") return u.status;
      if (filtroStatus === "inativos") return !u.status;
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
  subtitulo="Cadastro de Servidor / Usuário"
  onSair={() => goto("/main")}
  onSubmit={salvarUsuario}
  onCancelar={resetForm}
  {editando}
  {carregando}
  {erro}
  {sucesso}
  iconeForm={novoUsuario.matricula ? "manage_accounts" : "person_add"}
  tituloTabela="Usuários Cadastrados"
  iconeTabela="group"
  totalRegistros={usuariosFiltrados.length}
  {carregandoLista}
  estadoVazioTexto="Nenhum usuário encontrado."
  carregandoTexto="Carregando usuários..."
  temToggle={true}
  mostrarPesquisa={true}
  bind:pesquisa
  placeholderPesquisa="Pesquisar por nome, e-mail ou matrícula..."
  {ordenacao}
  onOrdenarChange={mudarOrdenacao}
>
  <svelte:fragment slot="campos">
    <div class="field">
      <label for="nome-usuario">Nome Completo</label>
      <input
        id="nome-usuario"
        type="text"
        bind:value={novoUsuario.nome}
        placeholder="Ex: João da Silva"
        required
      />
    </div>
    <div class="field">
      <label for="email-usuario">E-mail</label>
      <input
        id="email-usuario"
        type="email"
        bind:value={novoUsuario.email}
        placeholder="joao@escola.com"
        required
      />
    </div>
    <div class="field">
      <label for="cargo-usuario">Cargo</label>
      <select id="cargo-usuario" bind:value={novoUsuario.cargo} required>
        <option value="" disabled selected>Selecione um cargo...</option>
        <option value="admin">Admin</option>
        <option value="servidor">Servidor</option>
        <option value="educador">Educador</option>
      </select>
    </div>
    <div class="field">
      <label for="matricula-usuario">Matrícula</label>
      <input
        id="matricula-usuario"
        type="text"
        bind:value={novoUsuario.matricula}
        placeholder="000000"
        required
      />
    </div>
  </svelte:fragment>

  <svelte:fragment slot="toggle">
    <label for="status-usuario">Status</label>
    <div class="toggle-wrapper">
      <label class="toggle-switch">
        <input
          id="status-usuario"
          type="checkbox"
          bind:checked={novoUsuario.status}
        />
        <span class="toggle-track"><span class="toggle-thumb"></span></span>
      </label>
      <span class="toggle-label">
        {novoUsuario.status ? "Habilitado" : "Desabilitado"}
      </span>
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
        Habilitados
      </button>
      <button
        type="button"
        class="chip {filtroStatus === 'inativos' ? 'ativo' : ''}"
        on:click={() => (filtroStatus = "inativos")}
      >
        Desabilitados
      </button>
    </div>
  </svelte:fragment>

  <svelte:fragment slot="tabela-header">
    <div class="table-header">
      <div class="th flex-2">
        <span
          class="material-symbols-outlined"
          style="font-size:16px; margin-right:4px; vertical-align:middle"
          >person</span
        >
        Nome
      </div>
      <div class="th flex-2">
        <span
          class="material-symbols-outlined"
          style="font-size:16px; margin-right:4px; vertical-align:middle"
          >mail</span
        >
        E-mail
      </div>
      <div class="th flex-1">Cargo</div>
      <div class="th flex-1">Matrícula</div>
      <div class="th flex-1">Status</div>
      <div class="th flex-1">Ações</div>
    </div>
  </svelte:fragment>

  <svelte:fragment slot="tabela-body">
    {#each usuariosFiltrados as u, index}
      <div class="table-row {index % 2 === 0 ? 'even' : 'odd'}">
        <div class="td flex-2">
          <span class="text-truncate">{u.nome}</span>
        </div>
        <div class="td flex-2">
          <span class="text-truncate">{u.email}</span>
        </div>
        <div class="td flex-1">
          <span class="badge-cargo">{u.cargo}</span>
        </div>
        <div class="td flex-1">
          <span class="badge-matricula">{u.matricula}</span>
        </div>
        <div class="td flex-1">
          <span class="badge-status {u.status ? 'ativo' : 'inativo'}">
            {u.status ? "Habilitado" : "Desabilitado"}
          </span>
        </div>
        <div class="td flex-1 action-cell">
          <button
            class="btn-action edit"
            on:click={() => editarUsuario(u)}
            title="Editar"
          >
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button
            class="btn-action {u.status ? 'delete' : 'edit'}"
            on:click={() => alternarStatus(u)}
            title={u.status ? "Desabilitar usuário" : "Habilitar usuário"}
          >
            <span class="material-symbols-outlined">
              {u.status ? "block" : "check_circle"}
            </span>
          </button>
        </div>
      </div>
    {/each}
  </svelte:fragment>
</CadastroCard>
