<script>
  import { onMount } from "svelte";
  import CadastroCard from "$lib/components/admin/CadastroCard.svelte";
  import { cadastrarUsuario } from "$lib/services/UserServices/Create_User_Service.js";
  import { carregarUsuarios } from "$lib/services/UserServices/List_User_Service.js";
  import { atualizarUsuario } from "$lib/services/UserServices/Update_User_Service.js";
  import { goto } from "$app/navigation";
  let token = "";
  let matriculaLogado = "";

  let novoUsuario = { nome: "", email: "", cargo: "", matricula: "" };
  let usuarios = [];
  let carregando = false;
  let carregandoLista = false;
  let erro = "";
  let sucesso = "";
  let editando = false;
  let usuarioEditandoId = null;

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
    novoUsuario = { ...usuario };
    usuarioEditandoId = usuario.id;
    editando = true;
    sucesso = "";
    erro = "";
  }

  function resetForm() {
    novoUsuario = { nome: "", email: "", cargo: "", matricula: "" };
    editando = false;
    usuarioEditandoId = null;
  }

  function excluirUsuario(matricula) {
    if (matricula === matriculaLogado) {
      alert("Você não pode excluir o seu próprio usuário!");
      return;
    }
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      usuarios = usuarios.filter((u) => u.matricula !== matricula);
    }
  }
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
  totalRegistros={usuarios.length}
  {carregandoLista}
  estadoVazioTexto="Nenhum usuário cadastrado ainda."
  carregandoTexto="Carregando usuários..."
  temToggle={false}
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
      <div class="th flex-1">Ações</div>
    </div>
  </svelte:fragment>

  <svelte:fragment slot="tabela-body">
    {#each usuarios as u, index}
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
        <div class="td flex-1 action-cell">
          <button
            class="btn-action edit"
            on:click={() => editarUsuario(u)}
            title="Editar"
          >
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button
            class="btn-action delete"
            on:click={() => excluirUsuario(u.matricula)}
            title="Excluir"
          >
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    {/each}
  </svelte:fragment>
</CadastroCard>
