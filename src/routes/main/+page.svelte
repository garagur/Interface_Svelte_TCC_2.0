<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import MainCard from "$lib/components/main/MainCard.svelte";
  import { logoutUser } from "$lib/services/UserServices/Logout_User_Service.js";
  import { carregarAgendamentosSalas } from "$lib/services/AgendamentoServices/AgendamentoSala/List_Agendamento_Sala_Service.js";
  import { carregarAgendamentosEquipamentos } from "$lib/services/AgendamentoServices/AgendamentoEquipamento/List_Agendamento_Equipamento_Service.js";

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
          ...s,
          tipo: "sala",
        })),
        ...equipamentos.map((e) => ({
          ...e,
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
  {cargo}
  onSair={handleSair}
  onNovoAgendamento={() => goto("/agendamento")}
  {agendamentos}
  {carregando}
  {erro}
/>
