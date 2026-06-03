<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import MainCard from "$lib/components/main/MainCard.svelte";
  import { logoutUser } from "$lib/services/UserServices/Logout_User_Service.js";
  import { carregarAgendamentosSalas } from "$lib/services/AgendamentoServices/AgendamentoSala/List_Agendamento_Sala_Service.js";
  import { carregarAgendamentosEquipamentos } from "$lib/services/AgendamentoServices/AgendamentoEquipamento/List_Agendamento_Equipamento_Service.js";

  // O import do main.css FOI REMOVIDO daqui!

  let token = "";
  let matricula = "";
  let cargo = "";
  let agendamentos = [];
  let carregando = false;
  let erro = "";

  onMount(async () => {
    token = localStorage.getItem("token") || "";
    matricula = localStorage.getItem("matricula") || "";
    cargo = localStorage.getItem("cargo") || "";

    if (!token) {
      goto("/login");
      return;
    }

    carregando = true;
    try {
      const [salas, equipamentos] = await Promise.all([
        carregarAgendamentosSalas(token),
        carregarAgendamentosEquipamentos(token),
      ]);
      agendamentos = [
        ...salas.map((s) => ({
          id: s.id,
          nome: s.nome || "",
          item: `Sala ${s.numero || ""}`,
          dataInicio: s.data_hora_inicio || "",
          dataFim: s.data_hora_fim || "",
          tipo: "sala",
        })),
        ...equipamentos.map((e) => ({
          id: e.id,
          nome: e.nome || "",
          item: `Equipamento ${e.modelo || ""}`,
          dataInicio: e.data_hora_inicio || "",
          dataFim: e.data_hora_fim || "",
          tipo: "equipamento",
        })),
      ];
    } catch (e) {
      erro = e?.message || "Erro ao carregar agendamentos.";
    } finally {
      carregando = false;
    }
  });

  async function handleSair() {
    await logoutUser(token);
    localStorage.removeItem("token");
    localStorage.removeItem("matricula");
    localStorage.removeItem("cargo");
    goto("/login");
  }
</script>

<MainCard
  titulo="Portal de Agendamento"
  {matricula}
  onSair={handleSair}
  onNovoAgendamento={() => goto("/agendamento")}
  totalRegistros={agendamentos.length}
  {carregando}
  {erro}
>
  <svelte:fragment slot="menu">
    <button class="menu-card" on:click={() => goto("/agendamento")}>
      <span class="material-symbols-outlined">calendar_today</span>
      <span>Meus<br />Agendamentos</span>
    </button>
    {#if cargo === "admin"}
      <button class="menu-card" on:click={() => goto("/admin/cadastro-sala")}>
        <span class="material-symbols-outlined">add_location</span>
        <span>Cadastrar<br />Sala</span>
      </button>
      <button
        class="menu-card"
        on:click={() => goto("/admin/cadastro-equipamento")}
      >
        <span class="material-symbols-outlined">playlist_add</span>
        <span>Cadastrar<br />Equipamento</span>
      </button>
      <button
        class="menu-card"
        on:click={() => goto("/admin/cadastro-usuario")}
      >
        <span class="material-symbols-outlined">person_add</span>
        <span>Cadastrar<br />Usuário</span>
      </button>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="tabela-body">
    {#each agendamentos as item, index}
      <div class="table-row {index % 2 === 0 ? 'even' : 'odd'}">
        <div class="td flex-2">
          <span class="material-symbols-outlined icon-tiny">person</span>
          <span class="text-truncate">{item.nome}</span>
        </div>
        <button
          class="td flex-2 item-clickable"
          on:click={() => goto("/agendamento")}
        >
          <span class="material-symbols-outlined icon-tiny">inventory_2</span>
          <span class="text-truncate text-link">{item.item}</span>
        </button>
        <div class="td flex-2">
          <span class="material-symbols-outlined icon-tiny">schedule</span>
          <span class="text-truncate">{item.dataInicio}</span>
        </div>
        <div class="td flex-2">
          <span class="material-symbols-outlined icon-tiny">schedule</span>
          <span class="text-truncate">{item.dataFim}</span>
        </div>
        <div class="td flex-1 action-cell">
          <button class="btn-info" on:click={() => goto("/agendamento")}>
            <span class="material-symbols-outlined">info</span>
          </button>
        </div>
      </div>
    {/each}
  </svelte:fragment>
</MainCard>
