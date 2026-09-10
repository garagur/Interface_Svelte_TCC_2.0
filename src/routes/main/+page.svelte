<script>
  //main page
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import MainCard from "$lib/components/main/MainCard.svelte";
  import { carregarAgendamentosSalas } from "$lib/services/AgendamentoServices/AgendamentoSala/List_Agendamento_Sala_Service.js";
  import { carregarAgendamentosEquipamentos } from "$lib/services/AgendamentoServices/AgendamentoEquipamento/List_Agendamento_Equipamento_Service.js";

  let token = "";

  let titulo = "Portal de Agendamento";
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

    await carregarAgendamentos();
  });

  async function carregarAgendamentos() {
    carregando = true;
    try {
      const [salas, equipamentos] = await Promise.all([
        carregarAgendamentosSalas(token, null),
        carregarAgendamentosEquipamentos(token),
      ]);

      const salasComTipo = salas.map((ag) => ({ ...ag, tipo: "sala" }));
      const equipamentosComTipo = equipamentos.map((ag) => ({
        ...ag,
        tipo: "equipamento",
      }));

      agendamentos = [...salasComTipo, ...equipamentosComTipo].filter(
        (agendamento) => agendamento.status !== "inativo",
      );
    } catch (e) {
      erro = e?.message || "Erro ao carregar agendamentos.";
    } finally {
      carregando = false;
    }
  }

  function irParaNovoAgendamento() {
    goto("/agendamento");
  }

  function sair() {
    localStorage.clear();
    goto("/login");
  }
</script>

<MainCard
  {titulo}
  {matricula}
  {cargo}
  {agendamentos}
  {carregando}
  {erro}
  onSair={sair}
  onNovoAgendamento={irParaNovoAgendamento}
/>
