<script>
  //main page
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import MainCard from "$lib/components/main/MainCard.svelte";
  import { carregarAgendamentosSalas } from "$lib/services/AgendamentoServices/AgendamentoSala/List_Agendamento_Sala_Service.js";
  import { carregarAgendamentosEquipamentos } from "$lib/services/AgendamentoServices/AgendamentoEquipamento/List_Agendamento_Equipamento_Service.js";
  import { deletarAgendamentoSala } from "$lib/services/AgendamentoServices/AgendamentoSala/Deleted_Agendamento_Sala_Service.js";
  import { deletarAgendamentoEquipamento } from "$lib/services/AgendamentoServices/AgendamentoEquipamento/Deleted_Agendamento_equipamento.js";
  import { confirmarAgendamento as confirmarAgendamentoService } from "$lib/services/AgendamentoServices/Confirmar_Agendamento_Service.js";
  import { buscarUsuario } from "$lib/services/UserServices/Buscar_Usuario_Service.js";

  let token = "";

  let titulo = "Portal de Agendamento";
  let nome = "";
  let matricula = "";
  let cargo = "";
  let usuarioId = null;

  let agendamentos = [];
  let carregando = false;
  let erro = "";

  onMount(async () => {
    token = localStorage.getItem("token") || "";
    nome = localStorage.getItem("nome") || "";
    matricula = localStorage.getItem("matricula") || "";
    cargo = localStorage.getItem("cargo") || "";
    usuarioId = localStorage.getItem("user_id");

    if (!token) {
      goto("/login");
      return;
    }

    if (!nome && usuarioId) {
      try {
        const usuario = await buscarUsuario(token, usuarioId);
        nome = usuario?.nome || "";
        if (nome) localStorage.setItem("nome", nome);
      } catch {
        // O carregamento dos agendamentos continua mesmo se o perfil falhar.
      }
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

      agendamentos = [...salasComTipo, ...equipamentosComTipo];
    } catch (e) {
      erro = e?.message || "Erro ao carregar agendamentos.";
    } finally {
      carregando = false;
    }
  }

  async function confirmarAgendamento(ag) {
    try {
      const atualizado = await confirmarAgendamentoService(ag);
      agendamentos = agendamentos.map((item) =>
        item.id === ag.id && item.tipo === ag.tipo
          ? { ...item, status: atualizado?.status || "ativo" }
          : item,
      );
    } catch (e) {
      erro = e?.message || "Erro ao confirmar o agendamento.";
      throw e;
    }
  }

  async function deletarAgendamento(ag) {
    erro = "";
    try {
      if (ag.tipo === "sala") {
        await deletarAgendamentoSala(ag.id, token, ag.justificativa || "");
      } else if (ag.tipo === "equipamento") {
        await deletarAgendamentoEquipamento(
          ag.id,
          token,
          ag.justificativa || "",
        );
      }

      agendamentos = agendamentos.map((item) =>
        item.id === ag.id && item.tipo === ag.tipo
          ? {
              ...item,
              status: "inativo",
              justificativa: ag.justificativa || "",
            }
          : item,
      );
    } catch (e) {
      erro = e?.message || "Erro ao deletar agendamento.";
      throw e;
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
  {nome}
  {matricula}
  {cargo}
  {usuarioId}
  {agendamentos}
  {carregando}
  {erro}
  onSair={sair}
  onNovoAgendamento={irParaNovoAgendamento}
  onConfirmarAgendamento={confirmarAgendamento}
  onDeletar={deletarAgendamento}
/>
