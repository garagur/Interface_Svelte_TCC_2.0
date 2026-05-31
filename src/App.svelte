<script>
  import LoginScreen from "./routes/LoginScreen.svelte";
  import MainScreen from "./routes/MainScreen.svelte";
  import CadastroUserScreen from "./routes/UserConfigScreen.svelte";
  import CadastroSalaScreen from "./routes/CadastroSalaScreen.svelte";
  import CadastroEquipamentoScreen from "./routes/CadastroEquipamentoScreen.svelte";
  import AgendamentoScreen from "./routes/AgendamentoScreen.svelte";
  let tela = "login";
  let token = "";
  let matricula = "";

  function navegarPara(nomeTela) {
    tela = nomeTela;
  }

  function aoFazerLogin(data) {
    token = data.token;
    matricula = data.user?.matricula || "";
    tela = "main";
  }

  function aoSair() {
    token = "";
    matricula = "";
    tela = "login";
  }
</script>

{#if tela === "login"}
  <LoginScreen onLogin={aoFazerLogin} />
{:else if tela === "main"}
  <MainScreen {matricula} {token} {aoSair} onNavigate={navegarPara} />
{:else if tela === "CadastroUserScreen"}
  <CadastroUserScreen
    {token}
    matriculaLogado={matricula}
    onSair={() => navegarPara("main")}
  />
{:else if tela === "CadastroSalaScreen"}
  <CadastroSalaScreen {token} onSair={() => navegarPara("main")} />
{:else if tela === "CadastroEquipamentoScreen"}
  <CadastroEquipamentoScreen {token} onSair={() => navegarPara("main")} />
{:else if tela === "AgendamentoScreen"}
  <AgendamentoScreen {token} {matricula} onSair={() => navegarPara("main")} />
{/if}
